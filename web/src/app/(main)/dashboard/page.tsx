import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard/server/components/dashboard-page";

export const metadata: Metadata = {
  title: "データで見る議会 | みらい議会＠葉山町",
  description:
    "葉山町議会の議案を会期・審議結果・分野・住民の声で数値化したダッシュボードです。",
};

export default async function DashboardRoutePage() {
  return <DashboardPage />;
}
