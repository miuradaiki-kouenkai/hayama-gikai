import { describe, expect, it } from "vitest";
import type { BillVoteWithMember } from "../types";
import {
  countCouncilVotes,
  sortVotesBySeat,
  voteTextClass,
} from "./vote-display";

function makeVote(
  vote: BillVoteWithMember["vote"],
  seat: number,
  debated = false
): BillVoteWithMember {
  return {
    bill_id: "bill-1",
    council_member_id: `member-${seat}`,
    vote,
    debated,
    created_at: "2025-06-01T00:00:00Z",
    council_members: {
      id: `member-${seat}`,
      name: `議員${seat}`,
      seat_number: seat,
      party: null,
      role: seat === 13 ? "chair" : "member",
    },
  };
}

describe("countCouncilVotes", () => {
  it("議長（non_voting）を分母から除いて集計する", () => {
    // 起立12名の多数で可決した議案の想定（表決権者13名中12名賛成・1名反対）
    const fixed = [
      ...Array.from({ length: 11 }, (_, i) =>
        makeVote("for", [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12][i])
      ),
      makeVote("against", 3, true),
      makeVote("for", 14),
      makeVote("non_voting", 13),
    ];
    expect(countCouncilVotes(fixed)).toEqual({
      forCount: 12,
      againstCount: 1,
      debatedCount: 1,
      voterCount: 13,
    });
  });

  it("空配列では0を返す", () => {
    expect(countCouncilVotes([])).toEqual({
      forCount: 0,
      againstCount: 0,
      debatedCount: 0,
      voterCount: 0,
    });
  });
});

describe("voteTextClass", () => {
  it("賛否に応じたクラスを返す", () => {
    expect(voteTextClass("for")).toContain("text-primary-accent");
    expect(voteTextClass("against")).toContain("text-stance-against");
    expect(voteTextClass("non_voting")).toContain("text-mirai-text-muted");
  });
});

describe("sortVotesBySeat", () => {
  it("議席番号順に並べる", () => {
    const votes = [makeVote("for", 14), makeVote("for", 1), makeVote("for", 3)];
    expect(
      sortVotesBySeat(votes).map((v) => v.council_members?.seat_number)
    ).toEqual([1, 3, 14]);
  });
});
