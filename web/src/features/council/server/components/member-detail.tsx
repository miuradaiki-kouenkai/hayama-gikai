import { MessagesSquare, Vote } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type {
  CouncilMember,
  MemberDebateHistory,
  MemberVoteHistory,
} from "../../shared/types";
import { voteTextClass } from "../../shared/utils/vote-display";
import { COUNCIL_VOTE_LABELS, COUNCIL_VOTE_MARKS } from "../../shared/types";

interface MemberDetailProps {
  member: CouncilMember;
  votes: MemberVoteHistory[];
  debates: MemberDebateHistory[];
}

/**
 * 議員詳細：判断一覧＋討論履歴
 */
export function MemberDetail({ member, votes, debates }: MemberDetailProps) {
  const votingVotes = votes.filter((v) => v.vote !== "non_voting");
  const forCount = votingVotes.filter((v) => v.vote === "for").length;
  const againstCount = votingVotes.filter((v) => v.vote === "against").length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">
          {member.seat_number}番　{member.name}
        </h1>
        <p className="text-mirai-text-muted">
          {[member.party, member.role === "chair" ? "議長" : null]
            .filter(Boolean)
            .join("・") || "葉山町議会議員"}
        </p>
      </div>

      <section>
        <h2 className="text-[22px] font-bold mb-4 flex items-center gap-2">
          <Vote className="h-6 w-6" />
          判断一覧
        </h2>
        {member.role === "chair" ? (
          <p className="text-mirai-text-muted">
            議長は表決権を持たないため、賛否記録はありません（可否同数のときのみ裁決します）。
          </p>
        ) : (
          <>
            <p className="mb-3 font-bold">
              賛成 {forCount} ・ 反対 {againstCount}
              <span className="ml-2 text-sm font-normal text-mirai-text-muted">
                （記録 {votingVotes.length}件）
              </span>
            </p>
            <ul className="flex flex-col gap-2">
              {votingVotes.map((v) => (
                <li
                  key={`${v.bill_id}-${v.council_member_id}`}
                  className="rounded-lg border border-mirai-border bg-card px-4 py-3 text-[15px]"
                >
                  <span className={voteTextClass(v.vote)}>
                    {COUNCIL_VOTE_MARKS[v.vote]} {COUNCIL_VOTE_LABELS[v.vote]}
                  </span>
                  {v.debated && (
                    <span className="ml-2 rounded-full bg-mirai-surface-muted px-2 text-xs font-bold">
                      討論あり
                    </span>
                  )}{" "}
                  {v.bills ? (
                    <Link
                      href={routes.billDetail(v.bills.id)}
                      className="underline underline-offset-2"
                    >
                      {v.bills.name}
                    </Link>
                  ) : (
                    <span>（議案情報なし）</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {debates.length > 0 && (
        <section>
          <h2 className="text-[22px] font-bold mb-4 flex items-center gap-2">
            <MessagesSquare className="h-6 w-6" />
            討論での発言
          </h2>
          <ul className="flex flex-col gap-2">
            {debates.map((d) => (
              <li
                key={d.id}
                className="rounded-lg border border-mirai-border bg-card px-4 py-3 text-[15px]"
              >
                <span
                  className={
                    d.stance === "for"
                      ? "font-bold text-primary-accent"
                      : "font-bold text-stance-against"
                  }
                >
                  {d.stance === "for" ? "賛成の討論" : "反対の討論"}
                </span>{" "}
                {d.bills ? (
                  <Link
                    href={routes.billDetail(d.bills.id)}
                    className="underline underline-offset-2"
                  >
                    {d.bills.name}
                  </Link>
                ) : (
                  <span>{d.speaker_name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
