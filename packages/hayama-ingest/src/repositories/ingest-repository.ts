import { createAdminClient } from "@mirai-gikai/supabase";
import type { Database } from "@mirai-gikai/supabase";

type BillStatus = Database["public"]["Enums"]["bill_status_enum"];

export type DietSessionUpsert = {
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  sourceUrl: string | null;
};

export type BillUpsert = {
  dietSessionId: string;
  name: string;
  status: BillStatus;
  statusNote: string | null;
  sourceUrl: string | null;
};

/** 会期を slug で突合して作成・更新する。 */
export async function upsertDietSession(
  session: DietSessionUpsert
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("diet_sessions")
    .upsert(
      {
        name: session.name,
        slug: session.slug,
        start_date: session.startDate,
        end_date: session.endDate,
        shugiin_url: session.sourceUrl,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error) throw new Error(`会期の保存に失敗した: ${error.message}`);
  return data.id;
}

/** 同一会期・同名の議案を探す。 */
export async function findBillId(
  dietSessionId: string,
  name: string
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select("id")
    .eq("diet_session_id", dietSessionId)
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`議案の検索に失敗した: ${error.message}`);
  return data?.id ?? null;
}

/** 議案を作成・更新する。一院制のため originating_house は HR で統一する。 */
export async function upsertBill(bill: BillUpsert): Promise<string> {
  const supabase = createAdminClient();
  const existingId = await findBillId(bill.dietSessionId, bill.name);

  const row = {
    diet_session_id: bill.dietSessionId,
    name: bill.name,
    originating_house: "HR" as const,
    status: bill.status,
    status_note: bill.statusNote,
    publish_status: "published" as const,
    shugiin_url: bill.sourceUrl,
  };

  if (existingId) {
    const { error } = await supabase
      .from("bills")
      .update(row)
      .eq("id", existingId);
    if (error) throw new Error(`議案の更新に失敗した: ${error.message}`);
    return existingId;
  }

  const { data, error } = await supabase
    .from("bills")
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(`議案の作成に失敗した: ${error.message}`);
  return data.id;
}
