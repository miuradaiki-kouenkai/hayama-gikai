import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getCouncilMemberDetail } from "@/features/council/server/loaders/get-council-members";
import { MemberDetail } from "@/features/council/server/components/member-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getCouncilMemberDetail(id);

  if (!detail) {
    return { title: "議員が見つかりません" };
  }

  return {
    title: `${detail.member.name}の判断一覧 | みらい議会`,
    description: `${detail.member.name}（葉山町議会）の賛否記録と討論での発言です。`,
  };
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const detail = await getCouncilMemberDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <Container className="py-8">
      <MemberDetail
        member={detail.member}
        votes={detail.votes}
        debates={detail.debates}
      />
    </Container>
  );
}
