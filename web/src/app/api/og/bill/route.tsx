import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getBillById } from "@/features/bills/server/loaders/get-bill-by-id";

export const runtime = "edge";

function shorten(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * 議案詳細のOGP画像（GET /api/og/bill?id=...）。
 * 件名・タイトル・審議結果を青基調のカードにする。
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const bill = id ? await getBillById(id) : null;
  const title = bill?.bill_content?.title ?? bill?.name ?? "みらい議会＠葉山町";
  const status = bill?.status_note ?? "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f7f4f0",
        padding: 64,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#005dcb",
          }}
        />
        <div style={{ fontSize: 32, fontWeight: 700, color: "#005dcb" }}>
          みらい議会＠葉山町
        </div>
      </div>
      <div style={{ fontSize: 56, fontWeight: 800, color: "#1f2937" }}>
        {shorten(title, 42)}
      </div>
      <div style={{ fontSize: 28, color: "#404040" }}>
        {shorten(status, 36)}
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
