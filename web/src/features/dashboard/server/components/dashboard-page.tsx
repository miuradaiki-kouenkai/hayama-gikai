import "server-only";

import {
  CalendarDays,
  ExternalLink,
  FileText,
  MessagesSquare,
  Scale,
  Tag,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import {
  BILL_STATUS_GROUP_LABELS,
  type BillStatusGroup,
} from "@/features/bills/shared/utils/bill-status-group";
import {
  billsListHref,
  DEFAULT_BILLS_LIST_PARAMS,
} from "@/features/bills/shared/utils/parse-bills-list-params";
import { routes } from "@/lib/routes";
import { formatDateWithDots } from "@/lib/utils/date";
import { getDashboardData } from "../loaders/get-dashboard-data";

const TOWN_GIKAI_URL = "https://www.town.hayama.lg.jp/gikai/";

/** 審議結果の内訳に出す順番。「すべて」は内訳に要らないので除く。 */
const STATUS_ROWS: BillStatusGroup[] = [
  "deliberating",
  "waiting",
  "enacted",
  "rejected",
];

/** ダッシュボード（/dashboard）。集計は loader + 純粋関数に寄せる。 */
export async function DashboardPage() {
  const { stats, fetchedAt } = await getDashboardData();
  const maxSessionBills = Math.max(
    1,
    ...stats.bySession.map((row) => row.billCount)
  );
  const maxStatusCount = Math.max(
    1,
    ...STATUS_ROWS.map((group) => stats.byStatusGroup[group])
  );

  return (
    <Container className="pt-24 pb-8 md:pt-8">
      <div className="mb-3">
        <Breadcrumb
          items={[
            { label: "トップ", href: routes.home() },
            { label: "データで見る議会" },
          ]}
        />
      </div>

      <h1 className="mb-2 text-3xl font-bold">データで見る議会</h1>
      <p className="mb-1 text-sm text-mirai-text-secondary">
        葉山町議会の議案を、会期・審議結果・分野・住民の声の4つの切り口で数値化しました。
        難しい文書を開かなくても、議会の今がつかめます。
      </p>
      <p className="mb-6 text-xs text-mirai-text-muted">
        本サイト掲載中の公開議案の集計（{formatDateWithDots(fetchedAt)}
        時点）。一次情報は葉山町議会の公式サイトで確認できます。
      </p>

      {stats.totalBills === 0 ? (
        <p className="rounded-2xl border border-mirai-border bg-card px-6 py-12 text-center text-sm text-mirai-text-secondary">
          集計できる公開議案がまだありません
        </p>
      ) : (
        <>
          <section aria-label="全体の数値" className="mb-10">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KpiCard
                icon={FileText}
                value={`${stats.totalBills}件`}
                label="公開中の議案"
              />
              <KpiCard
                icon={CalendarDays}
                value={`${stats.totalSessions}会期`}
                label="掲載中の定例会"
              />
              <KpiCard
                icon={Scale}
                value={`${Math.round(stats.decidedRate * 100)}%`}
                label={`議決済み（${stats.decidedCount}件）`}
              />
              <KpiCard
                icon={MessagesSquare}
                value={`${stats.totalReports}件`}
                label="寄せられたご意見"
              />
            </div>
          </section>

          <DashboardSection
            title="審議結果の内訳"
            description="議案が今どこにあるのかを4つに分けて数えました。行を選ぶと該当の議案一覧に進めます。"
          >
            <ul className="flex flex-col gap-3">
              {STATUS_ROWS.map((group) => (
                <li key={group}>
                  <Link
                    href={billsListHref(DEFAULT_BILLS_LIST_PARAMS, {
                      status: group,
                    })}
                    className="block rounded-xl border border-mirai-border bg-card px-4 py-3 transition-colors hover:bg-mirai-surface-grouped"
                  >
                    <span className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-bold">
                        {BILL_STATUS_GROUP_LABELS[group]}
                      </span>
                      <span className="font-lexend text-sm font-bold text-mirai-text-muted">
                        {stats.byStatusGroup[group]}件
                      </span>
                    </span>
                    <Bar
                      value={stats.byStatusGroup[group]}
                      max={maxStatusCount}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardSection>

          <DashboardSection
            title="会期別の議案数"
            description="どの定例会で何件の議案が出たかです。行を選ぶと会期ごとの議案一覧に進めます。"
          >
            <ul className="flex flex-col gap-3">
              {stats.bySession.map((row) => {
                const href = row.slug
                  ? routes.kokkaiSessionBills(row.slug)
                  : routes.sessions();
                return (
                  <li key={row.sessionId}>
                    <Link
                      href={href}
                      className="block rounded-xl border border-mirai-border bg-card px-4 py-3 transition-colors hover:bg-mirai-surface-grouped"
                    >
                      <span className="mb-1.5 flex items-baseline justify-between gap-2">
                        <span className="text-sm font-bold">{row.name}</span>
                        <span className="font-lexend text-sm font-bold text-mirai-text-muted">
                          {row.billCount}件
                        </span>
                      </span>
                      <Bar value={row.billCount} max={maxSessionBills} />
                      <span className="mt-1.5 block text-xs text-mirai-text-muted">
                        議決済み {row.decidedCount}件・ご意見 {row.reportCount}
                        件
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {stats.unassignedBillCount > 0 && (
              <p className="mt-3 text-xs text-mirai-text-muted">
                ※ 会期に紐づいていない議案が
                {stats.unassignedBillCount}件あります
              </p>
            )}
          </DashboardSection>

          {stats.topTags.length > 0 && (
            <DashboardSection
              title="分野別の議案数（上位）"
              description="議案についている分野タグの多い順です。選ぶと該当の議案一覧に進めます。"
            >
              <ul className="flex flex-wrap gap-1.5">
                {stats.topTags.map((tag) => (
                  <li key={tag.id}>
                    <Link
                      href={billsListHref(DEFAULT_BILLS_LIST_PARAMS, {
                        tagId: tag.id,
                      })}
                      className="inline-flex items-center gap-2 rounded-full border border-mirai-border bg-card px-3.5 py-1.5 text-[13px] font-bold whitespace-nowrap"
                    >
                      <Tag className="h-[15px] w-[15px] shrink-0" aria-hidden />
                      {tag.label}
                      <span className="font-lexend text-xs font-bold text-mirai-text-muted">
                        {tag.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </DashboardSection>
          )}

          <DashboardSection
            title="ご意見が集まっている議案"
            description="AIインタビューで声が多く寄せられた議案です。住民の関心がどこにあるのかが分かります。"
          >
            {stats.topBills.length === 0 ? (
              <p className="text-sm text-mirai-text-secondary">
                まだご意見が寄せられていません。
                {stats.interviewOpenCount > 0 && (
                  <>
                    <Link
                      href={billsListHref(DEFAULT_BILLS_LIST_PARAMS, {
                        interviewOnly: true,
                      })}
                      className="text-primary-accent underline"
                    >
                      AIインタビュー受付中の議案（
                      {stats.interviewOpenCount}件）
                    </Link>
                    から声を届けられます。
                  </>
                )}
              </p>
            ) : (
              <ol className="flex flex-col gap-3">
                {stats.topBills.map((bill, index) => (
                  <li
                    key={bill.id}
                    className="flex items-start gap-3 rounded-xl border border-mirai-border bg-card px-4 py-3"
                  >
                    <span
                      className="font-lexend text-lg font-bold text-mirai-text-muted"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <Link
                        href={routes.billDetail(bill.id)}
                        className="block truncate text-sm font-bold hover:underline"
                      >
                        {bill.title}
                      </Link>
                      <Link
                        href={routes.billTopics(bill.id)}
                        className="w-fit text-xs font-bold text-primary-accent hover:opacity-80"
                      >
                        {bill.reportCount}件のご意見を見る
                      </Link>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </DashboardSection>
        </>
      )}

      <section className="mt-10">
        <h2 className="mb-2 text-base font-bold">出典</h2>
        <p className="text-sm text-mirai-text-secondary">
          本ページの数値は、本サイトに掲載中の公開議案データの集計です。議案の原文・審議結果の一次情報は{" "}
          <Link
            href={TOWN_GIKAI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-accent underline"
          >
            葉山町議会（町公式サイト）
            <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>{" "}
          で確認できます。
        </p>
        <div className="mt-4">
          <BillDisclaimer />
        </div>
      </section>
    </Container>
  );
}

function DashboardSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-base font-bold">{title}</h2>
      <p className="mb-3 text-xs text-mirai-text-secondary">{description}</p>
      {children}
    </section>
  );
}

function KpiCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-mirai-border bg-card p-4">
      <Icon className="mb-2 h-5 w-5 text-mirai-text-muted" aria-hidden />
      <p className="font-lexend text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-bold text-mirai-text-secondary">
        {label}
      </p>
    </div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <span
      className="block h-2 overflow-hidden rounded-full bg-mirai-surface-muted"
      role="img"
      aria-label={`${value}件`}
    >
      <span
        className="block h-full rounded-full bg-primary"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}
