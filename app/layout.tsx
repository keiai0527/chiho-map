import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "地方議員マップ | あなたの街の議員を知る",
  description:
    "政令指定都市の市議会議員を、会派・選挙区・政党横断で検索できるサイト。まずは大阪市・名古屋市・横浜市・福岡市・札幌市から。",
  openGraph: {
    title: "地方議員マップ",
    description: "あなたの街の市議会議員を、写真と会派と選挙区で一覧。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
