import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "地方議員マップ - あなたの街の議員を知る";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            letterSpacing: "0.2em",
            color: "#94a3b8",
            textTransform: "uppercase",
          }}
        >
          CHIHOGIIN.JP
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: "100px", fontWeight: 800, lineHeight: 1 }}>
            地方議員マップ
          </div>
          <div
            style={{
              fontSize: "40px",
              color: "#cbd5e1",
              fontWeight: 500,
            }}
          >
            あなたの街の市議会議員を、会派と選挙区で一覧
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "24px",
            color: "#94a3b8",
          }}
        >
          <div>大阪・名古屋・横浜・福岡・札幌 — 362名 掲載中</div>
          <div
            style={{
              background: "#f59e0b",
              color: "#0f172a",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            β版
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
