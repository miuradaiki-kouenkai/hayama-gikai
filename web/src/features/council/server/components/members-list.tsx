import Link from "next/link";
import { routes } from "@/lib/routes";
import type { CouncilMember } from "../../shared/types";

interface MembersListProps {
  members: CouncilMember[];
}

/**
 * 議員一覧（議席番号順）
 */
export function MembersList({ members }: MembersListProps) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {members.map((m) => (
        <li
          key={m.id}
          className="rounded-xl border border-mirai-border bg-card px-5 py-4"
        >
          <Link href={routes.memberDetail(m.id)} className="block">
            <p className="font-bold text-lg text-mirai-text">
              {m.seat_number}番　{m.name}
              {m.role === "chair" && (
                <span className="ml-2 rounded-full bg-mirai-surface-muted px-2 py-0.5 text-xs font-bold text-mirai-text-muted">
                  議長
                </span>
              )}
            </p>
            {m.party && (
              <p className="text-sm text-mirai-text-muted">{m.party}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
