import type { BillVoteWithMember } from "../types";

/**
 * 議案の賛否集計（純粋関数）。
 * non_voting（議長）は分母から除く。
 */
export function countCouncilVotes(votes: BillVoteWithMember[]): {
  forCount: number;
  againstCount: number;
  debatedCount: number;
  voterCount: number;
} {
  let forCount = 0;
  let againstCount = 0;
  let debatedCount = 0;
  let voterCount = 0;
  for (const v of votes) {
    if (v.vote === "non_voting") continue;
    voterCount += 1;
    if (v.vote === "for") forCount += 1;
    if (v.vote === "against") againstCount += 1;
    if (v.debated) debatedCount += 1;
  }
  return { forCount, againstCount, debatedCount, voterCount };
}

/**
 * 賛否リスト表示用に議員を議席番号順に並べる。
 */
export function sortVotesBySeat(
  votes: BillVoteWithMember[]
): BillVoteWithMember[] {
  return [...votes].sort(
    (a, b) =>
      (a.council_members?.seat_number ?? 999) -
      (b.council_members?.seat_number ?? 999)
  );
}

/**
 * 賛否バッジの文字色クラス（純粋関数）。
 */
export function voteTextClass(vote: string): string {
  if (vote === "for") return "font-bold text-primary-accent";
  if (vote === "against") return "font-bold text-stance-against";
  return "text-mirai-text-muted";
}
