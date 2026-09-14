import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";

// ============================================================
// Council Members
// ============================================================

/**
 * 現職の議員を議席番号順に取得
 */
export async function findActiveCouncilMembers() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("council_members")
    .select("*")
    .eq("is_active", true)
    .order("seat_number", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch council members: ${error.message}`);
  }

  return data ?? [];
}

/**
 * 議員を1件取得
 */
export async function findCouncilMemberById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("council_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// ============================================================
// Bill Votes
// ============================================================

/**
 * 議案の議員別賛否を議員情報付きで取得
 */
export async function findVotesByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_votes")
    .select("*, council_members (id, name, seat_number, party, role)")
    .eq("bill_id", billId);

  if (error) {
    console.error("Failed to fetch bill votes:", error);
    return [];
  }

  return data ?? [];
}

/**
 * 議員の賛否履歴を議案情報付きで取得
 */
export async function findVotesByMemberId(memberId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_votes")
    .select("*, bills (id, name, status, status_note)")
    .eq("council_member_id", memberId);

  if (error) {
    console.error("Failed to fetch member votes:", error);
    return [];
  }

  return data ?? [];
}

// ============================================================
// Bill Debates
// ============================================================

/**
 * 議案の討論を議員情報付きで取得
 */
export async function findDebatesByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_debates")
    .select("*, council_members (id, name, party)")
    .eq("bill_id", billId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch bill debates:", error);
    return [];
  }

  return data ?? [];
}

/**
 * 議員の討論履歴を議案情報付きで取得
 */
export async function findDebatesByMemberId(memberId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_debates")
    .select("*, bills (id, name, status, status_note)")
    .eq("council_member_id", memberId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch member debates:", error);
    return [];
  }

  return data ?? [];
}
