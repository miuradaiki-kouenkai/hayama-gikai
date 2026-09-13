import { describe, expect, it } from "vitest";
import {
  aggregateDashboard,
  type DashboardBillInput,
  type DashboardSessionInput,
} from "./aggregate-dashboard";

const sessions: DashboardSessionInput[] = [
  {
    id: "s-new",
    name: "令和7年第2回定例会",
    slug: "hayama-r7-2-06",
    start_date: "2025-06-01",
    end_date: "2025-06-30",
  },
  {
    id: "s-old",
    name: "令和7年第1回定例会",
    slug: "hayama-r7-1-03",
    start_date: "2025-03-01",
    end_date: "2025-03-31",
  },
];

function bill(
  patch: Partial<DashboardBillInput> & { id: string }
): DashboardBillInput {
  return {
    name: `議案 ${patch.id}`,
    status: "enacted",
    diet_session_id: "s-new",
    tags: [],
    ...patch,
  };
}

describe("aggregateDashboard", () => {
  it("空入力はゼロを返し、議決率は0になる", () => {
    const stats = aggregateDashboard([], []);

    expect(stats.totalBills).toBe(0);
    expect(stats.totalSessions).toBe(0);
    expect(stats.decidedCount).toBe(0);
    expect(stats.decidedRate).toBe(0);
    expect(stats.totalReports).toBe(0);
    expect(stats.bySession).toEqual([]);
    expect(stats.topTags).toEqual([]);
    expect(stats.topBills).toEqual([]);
  });

  it("ステータスを束ねて議決数と議決率を数える", () => {
    const stats = aggregateDashboard(
      [
        bill({ id: "b1", status: "enacted" }),
        bill({ id: "b2", status: "rejected" }),
        bill({ id: "b3", status: "in_originating_house" }),
        bill({ id: "b4", status: "preparing" }),
      ],
      sessions
    );

    expect(stats.byStatusGroup.enacted).toBe(1);
    expect(stats.byStatusGroup.rejected).toBe(1);
    expect(stats.byStatusGroup.deliberating).toBe(1);
    expect(stats.byStatusGroup.waiting).toBe(1);
    expect(stats.decidedCount).toBe(2);
    expect(stats.decidedRate).toBe(0.5);
  });

  it("会期ごとに件数・議決数・意見数を集め、新しい会期順に並べる", () => {
    const stats = aggregateDashboard(
      [
        bill({ id: "b1", status: "enacted", diet_session_id: "s-old" }),
        bill({
          id: "b2",
          status: "introduced",
          diet_session_id: "s-old",
          publicReportCount: 3,
        }),
        bill({
          id: "b3",
          status: "rejected",
          diet_session_id: "s-new",
          publicReportCount: 7,
        }),
      ],
      sessions
    );

    expect(stats.bySession.map((row) => row.sessionId)).toEqual([
      "s-new",
      "s-old",
    ]);
    expect(stats.bySession[1]).toMatchObject({
      billCount: 2,
      decidedCount: 1,
      reportCount: 3,
    });
    expect(stats.bySession[0]).toMatchObject({
      billCount: 1,
      decidedCount: 1,
      reportCount: 7,
    });
    expect(stats.unassignedBillCount).toBe(0);
  });

  it("所属不明の議案は未割当として数え、会期行には入れない", () => {
    const stats = aggregateDashboard(
      [
        bill({ id: "b1", diet_session_id: null }),
        bill({ id: "b2", diet_session_id: "s-unknown" }),
      ],
      sessions
    );

    expect(stats.unassignedBillCount).toBe(2);
    expect(stats.totalBills).toBe(2);
    expect(stats.bySession.every((row) => row.billCount === 0)).toBe(true);
  });

  it("タグ上位は件数順、同数はラベル順で上限まで返す", () => {
    const stats = aggregateDashboard(
      [
        bill({ id: "b1", tags: [{ id: "t1", label: "福祉" }] }),
        bill({
          id: "b2",
          tags: [
            { id: "t1", label: "福祉" },
            { id: "t2", label: "教育" },
          ],
        }),
      ],
      sessions,
      { topTagLimit: 1 }
    );

    expect(stats.topTags).toEqual([{ id: "t1", label: "福祉", count: 2 }]);
  });

  it("意見の多い議案だけを上位に並べ、0件は除く", () => {
    const stats = aggregateDashboard(
      [
        bill({ id: "b1", name: "第1号 予算", publicReportCount: 2 }),
        bill({ id: "b2", name: "第2号 条例", publicReportCount: 0 }),
        bill({
          id: "b3",
          name: "第3号 計画",
          title: "まちづくり計画",
          publicReportCount: 5,
        }),
      ],
      sessions
    );

    expect(stats.totalReports).toBe(7);
    expect(stats.topBills).toEqual([
      { id: "b3", name: "第3号 計画", title: "まちづくり計画", reportCount: 5 },
      { id: "b1", name: "第1号 予算", title: "第1号 予算", reportCount: 2 },
    ]);
  });

  it("インタビュー受付中の件数を数える", () => {
    const stats = aggregateDashboard(
      [bill({ id: "b1", hasPublicInterview: true }), bill({ id: "b2" })],
      sessions
    );

    expect(stats.interviewOpenCount).toBe(1);
  });
});
