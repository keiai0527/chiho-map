import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import { CORRECTION_EMAIL, SITE_URL, TWITTER_URL } from "@/lib/config";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_NAME = "地方議員マップ";
const SITE_DESCRIPTION =
  "政令指定都市の市議会議員を、会派・選挙区・政党横断で検索できるデータベース。国会議員マップ（kokkaimap.jp）の地方版。個人運営の非公式情報サイト（β版）。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}｜あなたの街の議員を知る`,
    template: `%s｜${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME}｜あなたの街の議員を知る`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: "@kokkai_map",
    creator: "@kokkai_map",
    title: `${SITE_NAME}｜あなたの街の議員を知る`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-surface">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-6 bg-accent" aria-hidden />
              <span className="text-lg font-bold text-primary tracking-tight">
                地方議員マップ
              </span>
              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                β
              </span>
            </Link>
            <nav className="flex items-center gap-3 sm:gap-5 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                🔍 <span className="hidden sm:inline">議員を探す</span>
              </Link>
              <Link href="/about" className="hover:text-primary hidden md:inline">
                このサイトについて
              </Link>
              <a
                href="https://kokkaimap.jp"
                target="_blank"
                rel="noopener"
                className="hover:text-primary hidden lg:inline"
              >
                🏛️ 国会議員マップ
              </a>
              <Link
                href="/support"
                className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
              >
                <span aria-hidden>♥</span>
                <span>応援</span>
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border mt-16 bg-surface">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted-foreground space-y-4">
            <nav className="flex flex-wrap gap-x-4 gap-y-1 items-center">
              <Link href="/" className="hover:text-primary font-medium">
                議員を探す
              </Link>
              <Link href="/about" className="hover:text-primary font-medium">
                このサイトについて
              </Link>
              <Link
                href="/support"
                className="hover:text-rose-700 font-medium text-rose-600"
              >
                ♥ サイトを応援する
              </Link>
              <Link href="/guidelines" className="hover:text-primary">
                投稿ガイドライン
              </Link>
              <Link href="/terms" className="hover:text-primary">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-primary">
                プライバシーポリシー
              </Link>
              <Link href="/tokushoho" className="hover:text-primary">
                特定商取引法に基づく表記
              </Link>
              <Link href="/takedown" className="hover:text-primary">
                削除依頼
              </Link>
              <Link href="/correction" className="hover:text-primary">
                訂正依頼
              </Link>
              <a
                href="https://kokkaimap.jp"
                target="_blank"
                rel="noopener"
                className="hover:text-primary"
              >
                国会議員マップ →
              </a>
            </nav>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 leading-relaxed text-amber-900">
              <p className="font-bold mb-1.5">⚠️ ご利用にあたって</p>
              <p>
                本サイトは、特定の政党・候補者・議員への投票または不投票を呼びかけるものではありません。掲載情報は各市議会の公開情報をもとに作成していますが、正確性・最新性・完全性を保証するものではありません。
                政党・会派・ふりがな・期数等に暫定情報を含む議員がいます（議員ページの「データ品質」欄に明示）。判断の根拠とされる場合は、必ず各議員の「公式プロフィール」リンクから一次情報をご確認ください。
              </p>
              <p className="mt-1.5">
                本サイトの情報を利用して、議員本人・家族・事務所・関係者に対する<strong>嫌がらせ・脅迫・迷惑行為・無断訪問・ストーカー行為</strong>を行うことを<strong>固く禁じます</strong>。違反が確認された場合、関係機関への通報を含む適切な対応を行います。
              </p>
            </div>

            <p className="leading-relaxed">
              地方議員マップは{" "}
              <a
                href="https://kokkaimap.jp"
                target="_blank"
                rel="noopener"
                className="text-accent hover:underline"
              >
                国会議員マップ（kokkaimap.jp）
              </a>
              {" "}の地方版です。データ出典は各市議会公式ウェブサイト。
              <Link href="/about" className="underline mx-1">
                詳細はこちら
              </Link>
              。
            </p>
            <p className="text-[11px] opacity-80">
              <strong>個人運営</strong>（X:
              <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener"
                className="underline mx-1"
              >
                @kokkai_map
              </a>
              ／メール:
              <a
                href={`mailto:${CORRECTION_EMAIL}`}
                className="underline mx-1"
              >
                {CORRECTION_EMAIL}
              </a>
              ）／本サイトは市議会・自治体・政府の公式機関ではありません。削除・訂正依頼は
              <Link href="/takedown" className="underline mx-1">
                専用フォーム
              </Link>
              から受け付けています。
            </p>
            <p className="text-[11px] opacity-60">© 2026 地方議員マップ</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
