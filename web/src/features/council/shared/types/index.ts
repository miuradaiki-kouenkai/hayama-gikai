import type { Database } from "@mirai-gikai/supabase";

export type CouncilMember =
  Database["public"]["Tables"]["council_members"]["Row"];
export type BillVote = Database["public"]["Tables"]["bill_votes"]["Row"];
export type BillDebate = Database["public"]["Tables"]["bill_debates"]["Row"];

export type CouncilVoteValue = "for" | "against" | "proposer" | "non_voting";

export const COUNCIL_VOTE_LABELS: Record<string, string> = {
  for: "賛成",
  against: "反対",
  proposer: "提出者",
  non_voting: "表決権なし",
};

export const COUNCIL_VOTE_MARKS: Record<string, string> = {
  for: "○",
  against: "×",
  proposer: "◎",
  non_voting: "−",
};

type MemberBillRef = Pick<
  Database["public"]["Tables"]["bills"]["Row"],
  "id" | "name" | "status" | "status_note"
>;

export type BillVoteWithMember = BillVote & {
  council_members: Pick<
    CouncilMember,
    "id" | "name" | "seat_number" | "party" | "role"
  > | null;
};

export type BillDebateWithMember = BillDebate & {
  council_members: Pick<CouncilMember, "id" | "name" | "party"> | null;
};

export type MemberVoteHistory = BillVote & {
  bills: MemberBillRef | null;
};

export type MemberDebateHistory = BillDebate & {
  bills: MemberBillRef | null;
};
