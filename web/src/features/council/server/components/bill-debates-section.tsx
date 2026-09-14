import "server-only";

import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { BillDebateWithMember } from "../../shared/types";
import { findDebatesByBillId } from "../repositories/council-repository";

interface BillDebatesSectionProps {
  billId: string;
}

/**
 * 議案詳細の討論セクション。
 * データ源: 議会中継の会議録（「〜の立場から討論に参加」発言の抜粋）
 */
export async function BillDebatesSection({ billId }: BillDebatesSectionProps) {
  const debates = (await findDebatesByBillId(billId)) as BillDebateWithMember[];
  if (debates.length === 0) {
    return null;
  }

  const forDebates = debates.filter((d) => d.stance === "for");
  const againstDebates = debates.filter((d) => d.stance === "against");

  return (
    <>
      <h2 className="text-[22px] font-bold mb-4 flex items-center gap-2">
        <MessagesSquare className="h-6 w-6" />
        討論での発言
      </h2>
      <div className="flex flex-col gap-4">
        {againstDebates.length > 0 && (
          <div>
            <p className="font-bold text-stance-against mb-2">
              反対の討論（{againstDebates.length}件）
            </p>
            <div className="flex flex-col gap-3">
              {againstDebates.map((d) => (
                <DebateCard key={d.id} debate={d} />
              ))}
            </div>
          </div>
        )}
        {forDebates.length > 0 && (
          <div>
            <p className="font-bold text-primary-accent mb-2">
              賛成の討論（{forDebates.length}件）
            </p>
            <div className="flex flex-col gap-3">
              {forDebates.map((d) => (
                <DebateCard key={d.id} debate={d} />
              ))}
            </div>
          </div>
        )}
        <p className="text-sm text-mirai-text-muted">
          出典:
          葉山町議会の会議録（発言の冒頭部分を抜粋。全文は会議録検索で確認できます）
        </p>
      </div>
    </>
  );
}

function DebateCard({ debate }: { debate: BillDebateWithMember }) {
  // 長文は冒頭400字に丸める（全文は会議録原本を参照）
  const excerpt =
    debate.content.length > 400
      ? `${debate.content.slice(0, 400)}…`
      : debate.content;
  return (
    <div className="rounded-lg border border-mirai-border bg-white px-4 py-3">
      <p className="text-sm font-bold mb-1">
        {debate.council_members ? (
          <Link
            href={routes.memberDetail(debate.council_members.id)}
            className="underline underline-offset-2"
          >
            {debate.speaker_name}
          </Link>
        ) : (
          debate.speaker_name
        )}
        {debate.council_members?.party && (
          <span className="ml-2 font-normal text-mirai-text-muted">
            {debate.council_members.party}
          </span>
        )}
      </p>
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
        {excerpt}
      </p>
    </div>
  );
}
