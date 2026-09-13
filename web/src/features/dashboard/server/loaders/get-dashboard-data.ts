import "server-only";

import { getDietSessions } from "@/features/diet-sessions/server/loaders/get-diet-sessions";
import { getBillsWithReportCounts } from "@/features/bills/server/loaders/get-bills-with-report-counts";
import {
  aggregateDashboard,
  type DashboardStats,
} from "../../shared/utils/aggregate-dashboard";

export type DashboardData = {
  stats: DashboardStats;
  /** 集計した時刻（ISO）。画面の「時点」表示に使う。 */
  fetchedAt: string;
};

/**
 * 公開中の議案と会期一覧からダッシュボードの集計を作る。
 *
 * 新しいクエリは足さない。既存の一覧用loaderの結果を束ねるだけ。
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [bills, sessions] = await Promise.all([
    getBillsWithReportCounts(),
    getDietSessions(),
  ]);

  const stats = aggregateDashboard(
    bills.map((bill) => ({
      id: bill.id,
      name: bill.name,
      status: bill.status,
      diet_session_id: bill.diet_session_id,
      tags: bill.tags,
      publicReportCount: bill.publicReportCount ?? 0,
      hasPublicInterview: bill.hasPublicInterview ?? false,
      title: bill.bill_content?.title ?? null,
    })),
    sessions
  );

  return { stats, fetchedAt: new Date().toISOString() };
}
