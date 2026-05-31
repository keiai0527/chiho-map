import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 管理画面・管理APIの予防的封鎖。
// 地方議員マップは現時点で管理画面 (/op-console-demo, /admin, /moderation,
// /api/admin, /api/moderation) を持たないが、誤って未認証の管理画面が
// 本番に出ないように、これらのパスは 404 で完全に隠す。
//
// 将来、管理画面を実装する際は、まずここを Basic Auth に切り替え、
// 同時にサーバーアクション側でも requireAdminAuth を二重チェックすること
// （国会議員マップ diet-map 側の app/actions/admin.ts と同じパターン）。
const ADMIN_PREFIXES = [
  "/op-console-demo",
  "/op-console",
  "/admin",
  "/moderation",
  "/api/admin",
  "/api/moderation",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const expected = process.env.OP_CONSOLE_PASSWORD;
    if (!expected) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }

    const auth = request.headers.get("authorization");
    const challenge = () =>
      new Response(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="chihogiin-admin"',
          "Content-Type": "text/plain; charset=utf-8",
        },
      });

    if (!auth || !auth.startsWith("Basic ")) {
      return challenge();
    }

    let pass = "";
    try {
      const decoded = atob(auth.slice("Basic ".length));
      const idx = decoded.indexOf(":");
      pass = decoded.slice(idx + 1);
    } catch {
      return challenge();
    }

    if (pass !== expected) {
      return challenge();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/op-console-demo/:path*",
    "/op-console/:path*",
    "/admin/:path*",
    "/moderation/:path*",
    "/api/admin/:path*",
    "/api/moderation/:path*",
  ],
};
