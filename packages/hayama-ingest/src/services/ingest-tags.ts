import { createAdminClient } from "@mirai-gikai/supabase";
import { TAG_KEYWORD_RULES, matchTags } from "../parsers/tag-rules";

export type IngestTagsParams = {
  /** 元号年（例: 8）。省略時は全議案 */
  eraYear?: number;
};

export type IngestTagsResult = {
  tags: number;
  bills: number;
  links: number;
};

/**
 * タグを用意し、件名キーワードで議案に紐付ける。
 * 既存の紐付けは残し、不足分だけ足す。
 */
export async function ingestTags(
  params: IngestTagsParams = {}
): Promise<IngestTagsResult> {
  const supabase = createAdminClient();

  const tagIds = new Map<string, string>();
  for (const rule of TAG_KEYWORD_RULES) {
    const { data, error } = await supabase
      .from("tags")
      .upsert(
        { label: rule.label, description: rule.description },
        { onConflict: "label" }
      )
      .select("id")
      .single();
    if (error) throw new Error(`タグの保存に失敗した: ${error.message}`);
    tagIds.set(rule.label, data.id);
  }

  let query = supabase.from("bills").select("id,name,diet_sessions!inner(slug)");
  const { data: bills, error: billsError } = await query;
  if (billsError) throw new Error(`議案の取得に失敗した: ${billsError.message}`);

  const { data: existing, error: existingError } = await supabase
    .from("bills_tags")
    .select("bill_id,tag_id");
  if (existingError) {
    throw new Error(`タグ紐付けの取得に失敗した: ${existingError.message}`);
  }
  const linked = new Set((existing ?? []).map((row) => `${row.bill_id}:${row.tag_id}`));

  let billCount = 0;
  let linkCount = 0;
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
    for (const label of matchTags(bill.name)) {
      const tagId = tagIds.get(label);
      if (!tagId || linked.has(`${bill.id}:${tagId}`)) continue;
      const { error } = await supabase
        .from("bills_tags")
        .insert({ bill_id: bill.id, tag_id: tagId });
      if (error) throw new Error(`タグ紐付けに失敗した: ${error.message}`);
      linked.add(`${bill.id}:${tagId}`);
      linkCount++;
    }
  }

  return { tags: tagIds.size, bills: billCount, links: linkCount };
}
