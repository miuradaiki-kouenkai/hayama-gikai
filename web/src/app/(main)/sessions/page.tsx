import type { Metadata } from "next";
import { SessionListPage } from "@/features/diet-sessions/server/components/session-list-page";

export const metadata: Metadata = {
  title: "定例会の一覧 | みらい議会＠葉山町",
  description:
    "葉山町議会の会期ごとの議案一覧です。気になる会期から議案を探せます。",
};

export default async function SessionsPage() {
  return <SessionListPage />;
}
