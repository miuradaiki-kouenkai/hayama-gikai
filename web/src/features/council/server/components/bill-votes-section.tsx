import "server-only";

import { Vote } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { BillVoteWithMember } from "../../shared/types";
import { COUNCIL_VOTE_LABELS, COUNCIL_VOTE_MARKS } from "../../shared/types";
import { getJuneBillPdfUrl } from "../../shared/utils/bill-source";
import {
  countCouncilVotes,
  sortVotesBySeat,
} from "../../shared/utils/vote-display";
import { findVotesByBillId } from "../repositories/council-repository";

interface BillVotesSectionProps {
  billId: string;
  billName: string;
}

/**
 * 議案詳細の議員別賛否セクション。
 * データ源: 議員別賛否PDF（○=賛成/×=反対/討論=討論参加/−=議長で表決権なし）
 */
export async function BillVotesSection({
  billId,
  billName,
}: BillVotesSectionProps) {
  const rows = (await findVotesByBillId(billId)) as BillVoteWithMember[];
  if (rows.length === 0) {
    return null;
  }

  const votes = sortVotesBySeat(rows);
  const { forCount, againstCount, debatedCount, voterCount } =
    countCouncilVotes(votes);
  const groups = {
    for: votes.filter((v) => v.vote === "for"),
    against: votes.filter((v) => v.vote === "against"),
    proposer: votes.filter((v) => v.vote === "proposer"),
    nonVoting: votes.filter((v) => v.vote === "non_voting"),
  };
  const billPdfUrl = getJuneBillPdfUrl(billName);

  return (
    <>
      <h2 className="text-[22px] font-bold mb-4 flex items-center gap-2">
        <Vote className="h-6 w-6" />
        議員の賛否
      </h2>
      <div className="rounded-2xl border border-mirai-border bg-card px-6 py-5">
        <p className="text-lg font-bold mb-4">
          賛成 {forCount} ・ 反対 {againstCount}
          <span className="ml-2 text-sm font-normal text-mirai-text-muted">
            （表決権者 {voterCount}名
            {debatedCount > 0 ? `・うち討論あり ${debatedCount}名` : ""}）
          </span>
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-stance-for-bg px-4 py-3">
            <p className="font-bold text-primary-accent mb-2">
              ○ 賛成（{groups.for.length}名）
            </p>
            <MemberNames votes={groups.for} />
          </div>
          <div className="rounded-lg bg-stance-against-bg px-4 py-3">
            <p className="font-bold text-stance-against mb-2">
              × 反対（{groups.against.length}名）
            </p>
            <MemberNames votes={groups.against} />
          </div>
        </div>

        {(groups.proposer.length > 0 || groups.nonVoting.length > 0) && (
          <p className="mt-3 text-sm text-mirai-text-muted">
            {groups.proposer.length > 0 && (
              <>◎ 提出者: {groups.proposer.map(nameOf).join("、")}　</>
            )}
            {groups.nonVoting.length > 0 && (
              <>
                − 表決権なし（議長）: {groups.nonVoting.map(nameOf).join("、")}
              </>
            )}
          </p>
        )}

        <p className="mt-3 text-sm text-mirai-text-muted">
          出典:{" "}
          {billPdfUrl && (
            <>
              <a
                href={billPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                議案本文PDF
              </a>
              ・{" "}
            </>
          )}
          <a
            href="https://www.town.hayama.lg.jp/material/files/group/27/7-6sanpi.pdf"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            議員別賛否結果PDF
          </a>
          ・{" "}
          <a
            href="https://www.town.hayama.lg.jp/gikai/2_1/r2_5/15562.html"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            町サイト会期ページ
          </a>
          ・{" "}
          <a
            href="https://hayama-gikai.gijiroku.com/g07_Nittei_Kaigi.asp?KaigiID=43"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            会議録検索
          </a>
          （6月定例会議分より転記）
        </p>
      </div>
    </>
  );
}

function nameOf(v: BillVoteWithMember): string {
  return v.council_members?.name ?? "不明";
}

function MemberNames({ votes }: { votes: BillVoteWithMember[] }) {
  if (votes.length === 0) {
    return <p className="text-sm text-mirai-text-muted">なし</p>;
  }
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[15px]">
      {votes.map((v) => (
        <li key={v.council_member_id} className="flex items-center gap-1">
          {v.council_members ? (
            <Link
              href={routes.memberDetail(v.council_members.id)}
              className="underline underline-offset-2"
            >
              {v.council_members.name}
            </Link>
          ) : (
            <span>不明</span>
          )}
          <span className="text-mirai-text-muted">
            （{v.council_members?.seat_number}番）
          </span>
          {v.debated && (
            <span className="rounded-full bg-card px-2 text-xs font-bold text-mirai-text">
              討論あり
            </span>
          )}
          <span className="sr-only">
            {COUNCIL_VOTE_LABELS[v.vote]} {COUNCIL_VOTE_MARKS[v.vote]}
          </span>
        </li>
      ))}
    </ul>
  );
}
