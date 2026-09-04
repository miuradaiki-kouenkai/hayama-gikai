import { createAdminClient } from "@mirai-gikai/supabase";
import { buildContents } from "../parsers/bill-contents";

export type IngestContentsParams = {
  /** 元号年（例: 7）。省略時は全議案 */
  eraYear?: number;
};

export type IngestContentsResult = {
  bills: number;
  rows: number;
};

/**
 * 議案解説（bill_contents normal/hard）を定型文で用意する。
 * 既存行は上書きする（件名・審議結果の更新に追従するため）。
 */
export async function ingestContents(
  params: IngestContentsParams = {}
): Promise<IngestContentsResult> {
  const supabase = createAdminClient();

  const { data: bills, error: billsError } = await supabase
    .from("bills")
    .select("id,name,status_note,shugiin_url,diet_sessions!inner(slug)");
  if (billsError) throw new Error(`議案の取得に失敗した: ${billsError.message}`);

  let billCount = 0;
  let rowCount = 0;
  for (const bill of bills ?? []) {
    const slug = (
      bill as unknown as { diet_sessions: { slug: string } | null }
    ).diet_sessions?.slug;
    if (
      params.eraYear !== undefined &&
      slug !== undefined &&
      !slug?.startsWith(`hayama-r${params.eraYear}-`)
    ) {
      continue;
    }
    billCount++;
    const built = buildContents({
      name: bill.name,
      statusNote: bill.status_note,
      pdfUrl: bill.shugiin_url,
    });
    for (const [level, content] of [
      ["normal", built.normal],
      ["hard", built.hard],
    ] as const) {
      const { error } = await supabase.from("bill_contents").upsert(
        {
          bill_id: bill.id,
          difficulty_level: level,
          title: built.title,
          summary: built.summary,
          content,
        },
        { onConflict: "bill_id,difficulty_level" }
      );
      if (error) throw new Error(`解説の保存に失敗した: ${error.message}`);
      rowCount++;
    }
  }

  return { bills: billCount, rows: rowCount };
}
