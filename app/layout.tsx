import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "地方議員マップ | あなたの街の議員を知る",
    template: "%s | 地方議員マップ",
  },
  description:
    "政令指定都市の市議会議員を、会派・選挙区・政党横断で検索できるサイト。まずは大阪市・名古屋市・横浜市・福岡市・札幌市から。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "地方議員マップ",
    description:
      "あなたの街の市議会議員を、会派・選挙区・政党横断で一覧。個人運営の非公式情報サイト（β版）。",
    type: "website",
    url: SITE_URL,
    siteName: "地方議員マップ",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "地方議員マップ",
    description:
      "あなたの街の市議会議員を、会派・選挙区・政党横断で一覧。個人運営の非公式情報サイト（β版）。",
    creator: "@kokkai_map",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
