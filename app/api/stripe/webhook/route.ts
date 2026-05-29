import { NextResponse } from "next/server";
import type Stripe from "stripe";
import crypto from "node:crypto";
import { stripe } from "@/lib/stripe";
import {
  findReviewByStripeSession,
  promoteReviewAfterPayment,
  setReviewStatus,
  addToQueue,
  findQueueByReviewId,
  recordStripeEvent,
  addLog,
} from "@/lib/server-store";

/**
 * Stripe webhook（地方議員マップ用）
 *
 * 国会議員マップ（diet-map）と同じ Stripe アカウントを共有するが、
 * metadata.kind の値（"review_fee_chiho" / "donation_chiho"）で識別する。
 * 別 kind のイベントは無視する。
 *
 * webhook 用 endpoint secret は diet-map と別に Stripe で発行する。
 * （URL が異なるため: chiho-map.vercel.app/api/stripe/webhook）
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return new NextResponse("webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("missing stripe-signature header", { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[stripe-webhook] signature verification failed:", msg);
    return new NextResponse(`signature error: ${msg}`, { status: 400 });
  }

  let isNew: boolean;
  try {
    isNew = await recordStripeEvent(event.id, event.type, event);
  } catch (err) {
    console.error("[stripe-webhook] failed to record event:", err);
    return new NextResponse("idempotency record failed", { status: 500 });
  }
  if (!isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[stripe-webhook] handler error:", event.type, msg);
    return new NextResponse(`handler error: ${msg}`, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const kind = session.metadata?.kind;
  const mode = session.livemode ? "live" : "test";

  // 地方議員マップ用の kind だけ処理する。
  // diet-map の kind ("review_fee", "donation") はこの webhook で受信しても無視。
  if (kind === "review_fee_chiho") {
    const review = await findReviewByStripeSession(session.id);
    if (!review) {
      console.warn("[stripe-webhook] review not found for session", session.id);
      return;
    }
    if (review.status !== "pending_payment") return;

    const hasFlags = review.flags.length > 0;
    await promoteReviewAfterPayment(
      review.id,
      hasFlags ? "under_review" : "published",
    );
    if (hasFlags) {
      const existing = await findQueueByReviewId(review.id);
      if (!existing) {
        await addToQueue({
          id: `q-${crypto.randomUUID()}`,
          reviewId: review.id,
          memberId: review.memberId,
          content: review.content,
          rating: review.rating,
          caseType: review.caseType,
          autoFlags: review.flags,
        });
      }
    }
    await addLog({
      id: `log-${crypto.randomUUID()}`,
      actionType: "review-paid",
      decisionReason: `Stripe payment confirmed (${mode})`,
      operator: "system:stripe-webhook",
      relatedReviewId: review.id,
      snapshot: {
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        livemode: session.livemode,
      },
    });
  } else if (kind === "donation_chiho") {
    await addLog({
      id: `log-${crypto.randomUUID()}`,
      actionType: "donation-received",
      decisionReason: `Donation received (${mode})`,
      operator: "system:stripe-webhook",
      snapshot: {
        sessionId: session.id,
        amount: session.amount_total,
        currency: session.currency,
        donorName: session.metadata?.donor_name ?? null,
        message: session.metadata?.message ?? null,
        livemode: session.livemode,
      },
    });
  }
  // 他の kind（diet-map のもの含む）は無視
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const sessionId = await findSessionFromCharge(charge);
  const review = sessionId
    ? await findReviewByStripeSession(sessionId)
    : null;

  if (review) {
    await setReviewStatus(review.id, "removed");
    await addLog({
      id: `log-${crypto.randomUUID()}`,
      actionType: "review-refunded",
      decisionReason: "Stripe charge refunded — review removed",
      operator: "system:stripe-webhook",
      relatedReviewId: review.id,
      snapshot: {
        chargeId: charge.id,
        amountRefunded: charge.amount_refunded,
        sessionId,
      },
    });
  }
  // chiho-map で見つからない charge は、diet-map のものの可能性があるので無視
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  let chargeObj: Stripe.Charge | null = null;
  if (typeof dispute.charge === "string") {
    try {
      chargeObj = await stripe.charges.retrieve(dispute.charge);
    } catch (err) {
      console.warn(
        "[stripe-webhook] failed to retrieve charge for dispute:",
        err,
      );
    }
  } else {
    chargeObj = dispute.charge;
  }

  const sessionId = chargeObj
    ? await findSessionFromCharge(chargeObj)
    : null;
  const review = sessionId
    ? await findReviewByStripeSession(sessionId)
    : null;

  if (review) {
    await setReviewStatus(review.id, "removed");
    await addLog({
      id: `log-${crypto.randomUUID()}`,
      actionType: "dispute-created",
      decisionReason: `Stripe dispute opened: ${dispute.reason}`,
      operator: "system:stripe-webhook",
      relatedReviewId: review.id,
      snapshot: {
        disputeId: dispute.id,
        amount: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        chargeId: chargeObj?.id,
        sessionId,
      },
    });
  }
}

async function findSessionFromCharge(
  charge: Stripe.Charge | null,
): Promise<string | null> {
  if (!charge?.payment_intent) return null;
  const piId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent.id;
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: piId,
      limit: 1,
    });
    return sessions.data[0]?.id ?? null;
  } catch (err) {
    console.warn(
      "[stripe-webhook] failed to list sessions for payment_intent:",
      piId,
      err,
    );
    return null;
  }
}
