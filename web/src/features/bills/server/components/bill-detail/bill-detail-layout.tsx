import { Container } from "@/components/layouts/container";
import { AskAiFloat } from "@/features/ask-ai/client/components/ask-ai-float";
import { AskAiPanel } from "@/features/ask-ai/client/components/ask-ai-panel";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { InterviewLandingSection } from "@/features/interview-config/client/components/interview-landing-section";
import { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import { getPublicReportsByBillId } from "@/features/interview-report/server/loaders/get-public-reports-by-bill-id";
import { BillTopicsPreviewSection } from "@/features/user-topic-analysis/server/components/bill-topics-preview-section";
import { getPublicTopicAnalysis } from "@/features/user-topic-analysis/server/loaders/get-public-topic-analysis";
import { BillDetailClient } from "../../../client/components/bill-detail/bill-detail-client";
import { BillDisclaimer } from "../../../client/components/bill-detail/bill-disclaimer";
import { BillStatusProgress } from "../../../client/components/bill-detail/bill-status-progress";
import { MiraiStanceCard } from "../../../client/components/bill-detail/mirai-stance-card";
import type { BillWithContent } from "../../../shared/types";
import { BillShareButtons } from "../share/bill-share-buttons";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";
import { BillContent } from "./bill-content";
import { BillDetailHeader } from "./bill-detail-header";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

export async function BillDetailLayout({
  bill,
  currentDifficulty,
}: BillDetailLayoutProps) {
  const showMiraiStance = bill.status === "preparing" || bill.mirai_stance;
  const [interviewConfig, publicReportsResult, topicAnalysis] =
    await Promise.all([
      getInterviewConfig(bill.id),
      getPublicReportsByBillId(bill.id),
      getPublicTopicAnalysis(bill.id),
    ]);

  const pageUrl = new URL(routes.billDetail(bill.id), env.webUrl).toString();

  return (
    <div className="container mx-auto pb-8 max-w-4xl pc:max-w-6xl">
      <div className="pc:grid pc:grid-cols-[minmax(0,1fr)_360px] pc:gap-8 pc:items-start">
        <div className="min-w-0">
          {/*
        テキスト選択機能とチャット連携の実装パターン:
        - BillContentはServer Componentのまま保持（SSRによる高速な初期レンダリング）
        - BillDetailClientでクライアントサイド機能（テキスト選択、チャット連携）を提供
        - このパターンによりSSRを保持しつつインタラクティブ機能を実装
      */}
          <BillDetailClient
            bill={bill}
            currentDifficulty={currentDifficulty}
            hasInterviewConfig={interviewConfig != null}
          >
            <BillDetailHeader
              bill={bill}
              hasInterviewConfig={interviewConfig != null}
              opinionCount={topicAnalysis?.total_opinions ?? 0}
              topicCount={topicAnalysis?.topics.length ?? 0}
            />
            <Container>
              {/* 議案ステータス進捗 */}
              <div className="my-8">
                <BillStatusProgress
                  status={bill.status}
                  originatingHouse={bill.originating_house}
                  statusNote={bill.status_note}
                />
              </div>

              <BillContent bill={bill} />
            </Container>
          </BillDetailClient>

          <Container>
            {/* 法案のトピック一覧（AIインタビュー意見の整理） */}
            <div className="my-8">
              <BillTopicsPreviewSection
                billId={bill.id}
                topics={topicAnalysis?.topics ?? []}
                publicReportCount={publicReportsResult.totalCount}
              />
            </div>

            {interviewConfig != null && (
              <div className="my-8">
                <InterviewLandingSection billId={bill.id} />
              </div>
            )}
            {showMiraiStance && (
              <div className="my-8">
                <MiraiStanceCard
                  stance={bill.mirai_stance}
                  billStatus={bill.status}
                />
              </div>
            )}
            {/* シェアボタン */}
            <div className="my-8">
              <BillShareButtons bill={bill} />
            </div>

            {/* データの出典と免責事項 */}
            <div className="my-8">
              <BillDisclaimer />
            </div>
          </Container>
        </div>

        {/* 右パネル（PCのみ。元チャット欄の位置） */}
        <aside className="hidden pc:block sticky top-24 rounded-2xl border border-mirai-border bg-white p-5">
          <AskAiPanel
            billName={bill.name}
            summary={bill.bill_content?.summary}
            statusNote={bill.status_note}
            pageUrl={pageUrl}
          />
        </aside>
      </div>

      {/* 外部AIに聞く（モバイル用フローティングボタン） */}
      <div className="pc:hidden">
        <AskAiFloat
          billName={bill.name}
          summary={bill.bill_content?.summary}
          statusNote={bill.status_note}
          pageUrl={pageUrl}
        />
      </div>
    </div>
  );
}
