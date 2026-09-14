import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { getCouncilMembers } from "@/features/council/server/loaders/get-council-members";
import { MembersList } from "@/features/council/server/components/members-list";

export const metadata: Metadata = {
  title: "議員一覧 | みらい議会",
  description: "葉山町議会議員の名簿です。各議員の賛否記録を確認できます。",
};

export default async function MembersPage() {
  const members = await getCouncilMembers();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-2">議員一覧</h1>
      <p className="text-mirai-text-muted mb-6">
        葉山町議会議員14名（議長含む）。名前を選ぶと賛否の判断一覧が見られます。
      </p>
      <MembersList members={members} />
    </Container>
  );
}
