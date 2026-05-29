import { notFound } from "next/navigation";
import { getCity, getMemberById, getPartyMap } from "@/lib/data";
import { NewReviewForm } from "@/components/NewReviewForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await getMemberById(id);
  if (!m) return {};
  return {
    title: `${m.name} 議員への口コミを投稿`,
    description: `${m.name} 議員の公務・政策・議会活動に関する口コミを投稿します（事前審査制・¥100）。`,
    robots: { index: false, follow: false },
  };
}

export default async function NewReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await getMemberById(id);
  if (!m) notFound();
  const c = await getCity(m.cityId);
  const partyMap = await getPartyMap();
  const party = partyMap.get(m.partyId);

  return (
    <NewReviewForm
      member={{
        id: m.id,
        name: m.name,
        cityName: c?.name ?? "",
        electoralDistrict: m.electoralDistrict,
        partyName: party?.name ?? "不明",
        partyColor: party?.color ?? "#94a3b8",
      }}
    />
  );
}
