import {
  type BillStatusGroup,
  countByStatusGroup,
} from "@/features/bills/shared/utils/bill-status-group";
import type { BillStatusEnum } from "@/features/bills/shared/types";

/** 集計に入れる議案の最小形。loader が BillWithContent から変換する。 */
export type DashboardBillInput = {
  id: string;
  name: string;
  status: BillStatusEnum;
  diet_session_id: string | null;
  tags: { id: string; label: string }[];
  publicReportCount?: number;
  hasPublicInterview?: boolean;
  /** わかりやすいタイトル（bill_content.title）。無ければ公式件名を使う。 */
  title?: string | null;
};

/** 集計に入れる会期の最小形。 */
export type DashboardSessionInput = {
  id: string;
  name: string;
  slug: string | null;
  start_date: string;
  end_date: string;
};

export type DashboardSessionRow = {
  sessionId: string;
  name: string;
  slug: string | null;
  billCount: number;
  decidedCount: number;
  reportCount: number;
};

export type DashboardStats = {
  totalBills: number;
  totalSessions: number;
  /** 議決済み（enacted + rejected）の件数。 */
  decidedCount: number;
  /** 議決済み率（0〜1）。議案が0件なら0。 */
  decidedRate: number;
  /** 寄せられた意見（公開レポート）の総数。 */
  totalReports: number;
  /** AIインタビュー受付中の議案数。 */
  interviewOpenCount: number;
  byStatusGroup: Record<BillStatusGroup, number>;
  /** 開始日の降順。議案0件の会期も含める（掲載の抜けが分かる）。 */
  bySession: DashboardSessionRow[];
  /** どの会期にも属さない議案数。0より大きければ注意書きに出す。 */
  unassignedBillCount: number;
  topTags: { id: string; label: string; count: number }[];
  /** 意見が1件以上ある議案の上位。 */
  topBills: { id: string; name: string; title: string; reportCount: number }[];
};

const DEFAULT_TOP_TAG_LIMIT = 8;
const DEFAULT_TOP_BILL_LIMIT = 5;

/**
 * ダッシュボード用の集計をする純粋関数。
 *
 * DBや日時は触らない。件数の数え方だけをここに閉じ込める。
 */
export function aggregateDashboard(
  bills: readonly DashboardBillInput[],
  sessions: readonly DashboardSessionInput[],
  opts?: { topTagLimit?: number; topBillLimit?: number }
): DashboardStats {
  const topTagLimit = opts?.topTagLimit ?? DEFAULT_TOP_TAG_LIMIT;
  const topBillLimit = opts?.topBillLimit ?? DEFAULT_TOP_BILL_LIMIT;

  const byStatusGroup = countByStatusGroup(bills);
  const decidedCount = byStatusGroup.enacted + byStatusGroup.rejected;

  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const rows = new Map<string, DashboardSessionRow>();
  for (const session of sessions) {
    rows.set(session.id, {
      sessionId: session.id,
      name: session.name,
      slug: session.slug,
      billCount: 0,
      decidedCount: 0,
      reportCount: 0,
    });
  }

  const tagCounts = new Map<
    string,
    { id: string; label: string; count: number }
  >();
  let totalReports = 0;
  let interviewOpenCount = 0;
  let unassignedBillCount = 0;

  for (const bill of bills) {
    const reportCount = bill.publicReportCount ?? 0;
    totalReports += reportCount;
    if (bill.hasPublicInterview) interviewOpenCount += 1;

    for (const tag of bill.tags) {
      const entry = tagCounts.get(tag.id);
      if (entry) {
        entry.count += 1;
      } else {
        tagCounts.set(tag.id, { id: tag.id, label: tag.label, count: 1 });
      }
    }

    const row =
      bill.diet_session_id != null ? rows.get(bill.diet_session_id) : undefined;
    if (!row) {
      unassignedBillCount += 1;
      continue;
    }
    row.billCount += 1;
    row.reportCount += reportCount;
    if (bill.status === "enacted" || bill.status === "rejected") {
      row.decidedCount += 1;
    }
  }

  const bySession = [...rows.values()].sort((a, b) => {
    const aDate = sessionById.get(a.sessionId)?.start_date ?? "";
    const bDate = sessionById.get(b.sessionId)?.start_date ?? "";
    return bDate.localeCompare(aDate);
  });

  const topTags = [...tagCounts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ja"))
    .slice(0, topTagLimit);

  const topBills = bills
    .filter((bill) => (bill.publicReportCount ?? 0) > 0)
    .sort((a, b) => (b.publicReportCount ?? 0) - (a.publicReportCount ?? 0))
    .slice(0, topBillLimit)
    .map((bill) => ({
      id: bill.id,
      name: bill.name,
      title: bill.title || bill.name,
      reportCount: bill.publicReportCount ?? 0,
    }));

  return {
    totalBills: bills.length,
    totalSessions: sessions.length,
    decidedCount,
    decidedRate: bills.length > 0 ? decidedCount / bills.length : 0,
    totalReports,
    interviewOpenCount,
    byStatusGroup,
    bySession,
    unassignedBillCount,
    topTags,
    topBills,
  };
}
