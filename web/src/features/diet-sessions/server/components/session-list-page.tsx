import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { routes } from "@/lib/routes";
import { formatDateWithDots } from "@/lib/utils/date";
import { getDietSessions } from "../loaders/get-diet-sessions";

/** 定例会の一覧ページ。 */
export async function SessionListPage() {
  const sessions = (await getDietSessions()).filter(
    (session): session is typeof session & { slug: string } =>
      session.slug !== null
  );

  return (
    <Container className="py-10">
      <h1 className="text-[22px] font-bold text-mirai-text leading-[1.48]">
        定例会の一覧
      </h1>
      <p className="mt-2 text-xs text-mirai-text-secondary">
        葉山町議会の会期ごとの議案を見られます
      </p>

      {sessions.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          会期がありません
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={routes.kokkaiSessionBills(session.slug)}
                className="flex items-center justify-between gap-3 rounded-xl border border-mirai-border bg-card px-5 py-4 transition-colors hover:bg-mirai-surface-grouped"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-bold text-base text-mirai-text leading-tight">
                    {session.name}
                  </span>
                  <span className="text-xs text-mirai-text-subtle">
                    {formatDateWithDots(session.start_date ?? "")} -{" "}
                    {formatDateWithDots(session.end_date ?? "")}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
