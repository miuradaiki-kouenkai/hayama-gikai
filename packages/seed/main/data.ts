import type { Database } from "@mirai-gikai/supabase";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type MiraiStanceInsert =
  Database["public"]["Tables"]["mirai_stances"]["Insert"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type BillsTagsInsert = Database["public"]["Tables"]["bills_tags"]["Insert"];
type DietSessionInsert =
  Database["public"]["Tables"]["diet_sessions"]["Insert"];
type InterviewConfigInsert =
  Database["public"]["Tables"]["interview_configs"]["Insert"];
type InterviewQuestionInsert =
  Database["public"]["Tables"]["interview_questions"]["Insert"];
type InterviewSessionInsert =
  Database["public"]["Tables"]["interview_sessions"]["Insert"];
type InterviewMessageInsert =
  Database["public"]["Tables"]["interview_messages"]["Insert"];
type InterviewReportInsert =
  Database["public"]["Tables"]["interview_report"]["Insert"];

// 葉山町議会の会期データ
export const dietSessions: DietSessionInsert[] = [
  {
    name: "葉山町議会 令和7年第4回定例会（12月）",
    slug: "hayama-r7-4",
    shugiin_url: "https://www.town.hayama.lg.jp/gikai/",
    start_date: "2025-12-01",
    end_date: "2025-12-19",
  },
  {
    name: "葉山町議会 令和7年第3回定例会（9月）",
    slug: "hayama-r7-3",
    shugiin_url: "https://www.town.hayama.lg.jp/gikai/",
    start_date: "2025-09-01",
    end_date: "2025-09-30",
  },
];

// タグデータ
export const tags: TagInsert[] = [
  {
    label: "環境・海・みどり",
    description: "海岸保全、ごみ・リサイクル、緑地保全に関する議案",
    featured_priority: 1,
  },
  {
    label: "子育て・教育",
    description: "子育て支援、教育政策、若者支援に関する議案",
    featured_priority: 2,
  },
  {
    label: "交通・まちづくり",
    description: "コミュニティバス、道路、空き家対策、まちづくりに関する議案",
    featured_priority: 3,
  },
];

export const bills: BillInsert[] = [
  {
    name: "葉山町一般会計補正予算",
    originating_house: "HR",
    status: "in_originating_house",
    status_note: "葉山町議会で審議中",
    submitted_date: "2025-08-01T09:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400.png",
  },
  {
    name: "葉山町子ども・子育て支援条例の一部改正",
    originating_house: "HC",
    status: "enacted",
    status_note: "本会議で可決、成立",
    submitted_date: "2025-01-20T10:00:00+09:00",
    publish_status: "published",
    is_featured: true,
    thumbnail_url: "https://placehold.co/600x400.png",
  },
  {
    name: "葉山海岸周辺駐車場対策条例",
    originating_house: "HR",
    status: "rejected",
    status_note: "本会議で否決",
    submitted_date: "2025-02-01T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400.png",
  },
  {
    name: "学校給食無償化の継続に関する条例",
    originating_house: "HC",
    status: "enacted",
    status_note: "本会議で可決、4月から実施",
    submitted_date: "2025-01-10T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400.png",
  },
  // デザイン確認用の追加議案 - ループで生成
  ...Array.from({ length: 4 }, (_, i) => ({
    name: `葉山町空き家対策推進条例（第${i + 2}号）`,
    originating_house: (i % 2 === 0 ? "HR" : "HC") as "HR" | "HC",
    status: (i % 2 === 0 ? "enacted" : "in_originating_house") as
      | "enacted"
      | "in_originating_house",
    status_note: i % 2 === 0 ? "本会議で可決、成立" : "葉山町議会で審議中",
    submitted_date: `2025-08-0${i + 1}T09:00:00+09:00`,
    publish_status: "published" as const,
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400.png",
  })),
  {
    name: "コミュニティバス実証運行に関する条例",
    originating_house: "HR",
    status: "in_originating_house",
    status_note: "葉山町議会で審議中",
    submitted_date: "2025-09-15T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400.png",
  },
  {
    name: "防災・避難所整備基金条例",
    originating_house: "HR",
    status: "rejected",
    status_note: "本会議で否決",
    submitted_date: "2024-11-15T10:00:00+09:00",
    publish_status: "published",
    is_featured: false,
    thumbnail_url: "https://placehold.co/600x400.png",
  },
];

// 議案とタグの関連付け
// billsの順番: [補正予算, 子育て支援条例, 駐車場対策, 学校給食, 防災基金]
// tagsの順番: [環境・海・みどり, 子育て・教育, 交通・まちづくり]
export function createBillsTags(
  insertedBills: { id: string; name: string }[],
  insertedTags: { id: string; label: string }[]
): Omit<BillsTagsInsert, "id" | "created_at">[] {
  const billTagMap: { [billName: string]: string[] } = {
    "葉山町一般会計補正予算": ["交通・まちづくり"],
    "葉山町子ども・子育て支援条例の一部改正": ["子育て・教育"],
    "葉山海岸周辺駐車場対策条例": ["環境・海・みどり"],
    "学校給食無償化の継続に関する条例": ["子育て・教育"],
    // デザイン確認用の追加議案
    ...Object.fromEntries(
      Array.from({ length: 4 }, (_, i) => [
        `葉山町空き家対策推進条例（第${i + 2}号）`,
        ["交通・まちづくり"],
      ])
    ),
    "コミュニティバス実証運行に関する条例": ["交通・まちづくり"],
    "防災・避難所整備基金条例": ["環境・海・みどり"],
  };

  const billsTags: Omit<BillsTagsInsert, "id" | "created_at">[] = [];

  for (const bill of insertedBills) {
    const tagLabels = billTagMap[bill.name] || [];
    for (const tagLabel of tagLabels) {
      const tag = insertedTags.find((t) => t.label === tagLabel);
      if (tag) {
        billsTags.push({
          bill_id: bill.id,
          tag_id: tag.id,
        });
      }
    }
  }

  return billsTags;
}

const miraiStancesData: Omit<MiraiStanceInsert, "bill_id">[] = [
  {
    // 葉山町一般会計補正予算に対する見解
    type: "for",
    comment: `私たちは、物価高騰の中で町民生活を支えるこの補正予算に賛成します。

特に子育て世帯や小規模事業者への支援は、葉山の暮らしを守る上で重要です。ただし、基金残高や将来負担についても同時に説明が必要です。`,
  },
  {
    // 葉山町子ども・子育て支援条例の一部改正に対する見解
    type: "for",
    comment: `少子化が進む葉山町において、子育て支援の充実は最重要課題の一つです。この条例改正による支援の拡充は、子育て世代の経済的負担を軽減します。

特に保育の受け皿確保と相談体制の強化は、共働き世帯の多い葉山に効果的だと考えます。`,
  },
  {
    // 葉山海岸周辺駐車場対策条例に対する見解
    type: "for",
    comment: `夏の海水浴シーズンの渋滞・迷惑駐車は、葉山の長年の課題です。

この条例による駐車場の適正配置と案内表示の改善は、住民生活と観光の両立に向けた重要な取り組みです。海岸利用者のマナー啓発と合わせた運用を求めます。`,
  },
  {
    // 学校給食無償化の継続に関する条例に対する見解
    type: "for",
    comment: `学校給食の無償化は、子育て支援と教育の充実を同時に実現する重要な政策です。

全ての子どもが質の高い食事を平等に受けられることは、健康格差の解消にもつながります。地産地消の推進により地域経済の活性化も期待できます。`,
  },
  {
    // コミュニティバス実証運行に関する条例に対する見解
    type: "conditional_for",
    comment: `高齢化が進む葉山町において、移動手段の確保は避けられない課題であり、コミュニティバスの実証運行は重要です。

ただし、利用実績の乏しい路線を漫然と継続すれば、財政負担だけが残る恐れがあります。

利用データを公開しつつ、段階的な路線見直しと十分な周知を条件に賛成します。`,
  },
  // デザイン確認用の追加議案 - 同じ見解を4件追加
  ...Array.from({ length: 4 }, () => ({
    type: "for" as const,
    comment: `空き家の増加は、防災・防犯の面でも葉山町の課題です。

この条例による相談体制の整備と利活用の促進は、まちの安全と景観を守る重要な取り組みです。所有者の事情に配慮した丁寧な運用を求めます。`,
  })),
  {
    // 防災・避難所整備基金条例に対する見解
    type: "against",
    comment: `防災対策の充実は重要ですが、使途の定めが曖昧なまま基金だけを積むことには反対です。

避難所の耐震化、備蓄の更新、要支援者の避難計画など、具体策と必要額を先に示し、段階的な積み立てを検討すべきです。`,
  },
];

export function createMiraiStances(
  insertedBills: { id: string; name: string }[]
): MiraiStanceInsert[] {
  return miraiStancesData.map((stance, index) => ({
    ...stance,
    bill_id: insertedBills[index]?.id || "",
  }));
}

// インタビュー設定を作成（最初の議案用）
export function createInterviewConfig(
  insertedBills: { id: string; name: string }[]
): Omit<InterviewConfigInsert, "id" | "created_at" | "updated_at"> | null {
  const targetBill = insertedBills[0];
  if (!targetBill) return null;

  return {
    bill_id: targetBill.id,
    name: "デフォルト設定",
    status: "public",
    themes: ["賛否", "理由"],
  };
}

// インタビュー質問を作成
export function createInterviewQuestions(
  interviewConfigId: string
): Omit<InterviewQuestionInsert, "id" | "created_at" | "updated_at">[] {
  return [
    {
      interview_config_id: interviewConfigId,
      question: "この議案に賛成ですか？反対ですか？",
      follow_up_guide: "ユーザーの立場を明確にしてください。",
      quick_replies: ["賛成", "反対", "どちらでもない"],
      question_order: 1,
    },
    {
      interview_config_id: interviewConfigId,
      question: "その理由を教えてください。",
      follow_up_guide: "具体的な理由を引き出してください。",
      quick_replies: null,
      question_order: 2,
    },
  ];
}

// インタビューセッションを作成（5パターン × 20回 = 100件）
export function createInterviewSessions(
  interviewConfigId: string
): Omit<InterviewSessionInsert, "id" | "created_at" | "updated_at">[] {
  const now = new Date();
  const sessions: Omit<
    InterviewSessionInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // 20回ループして100件作成
  for (let i = 0; i < 20; i++) {
    const baseOffset = i * 86400000 * 3; // 3日ずつずらす

    // パターン1: 完了 + レポートあり（賛成）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 1).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 3600000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 3000000
      ).toISOString(),
    });

    // パターン2: 完了 + レポートあり（反対）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 2).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 7200000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 6600000
      ).toISOString(),
    });

    // パターン3: 完了 + レポートあり（中立）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 3).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 10800000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 10200000
      ).toISOString(),
    });

    // パターン4: 完了したけどレポート未作成
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 4).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 14400000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 13800000
      ).toISOString(),
    });

    // パターン5: 進行中（未完了、レポートなし）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 5).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 1800000).toISOString(),
      completed_at: null,
    });
  }

  return sessions;
}

// インタビューメッセージを作成（5パターンをループ）
export function createInterviewMessages(
  sessionIds: string[]
): Omit<InterviewMessageInsert, "id" | "created_at">[] {
  const conversations = [
    // パターン1: 賛成（完了 + レポートあり）
    [
      { role: "assistant" as const, content: "この議案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "賛成です" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "なぜなら賛成だからです。町民のためになると思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン2: 反対（完了 + レポートあり）
    [
      { role: "assistant" as const, content: "この議案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "反対です" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "財源が不明確だと思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン3: どちらでもない（完了 + レポートあり）
    [
      { role: "assistant" as const, content: "この議案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "どちらでもないです" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "もっと情報が必要だと思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン4: 完了したけどレポート未作成
    [
      { role: "assistant" as const, content: "この議案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "賛成です" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "良い議案だと思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン5: 進行中（途中で離脱）
    [
      { role: "assistant" as const, content: "この議案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "うーん、ちょっと考えさせてください" },
    ],
  ];

  const messages: Omit<InterviewMessageInsert, "id" | "created_at">[] = [];

  sessionIds.forEach((sessionId, sessionIndex) => {
    // 5パターンをループ
    const patternIndex = sessionIndex % 5;
    const conversation = conversations[patternIndex];
    conversation.forEach((msg) => {
      messages.push({
        interview_session_id: sessionId,
        role: msg.role,
        content: msg.content,
      });
    });
  });

  return messages;
}

// インタビューレポートを作成（パターン1,2,3のみ = 5の倍数で0,1,2番目）
export function createInterviewReports(
  sessionIds: string[]
): Omit<InterviewReportInsert, "id" | "created_at" | "updated_at">[] {
  const reportTemplates = [
    {
      stance: "for" as const,
      summary:
        "この議案は葉山町の暮らしの安定に寄与する重要な施策であり、賛成の立場をとる。特に物価高騰に苦しむ家庭への経済的支援効果が大きく、子育て支援の充実と合わせて早期の成立を望む。",
      role: "general_citizen" as const,
      role_title: "一般町民",
      role_description: "議案の内容に賛同する町民",
      opinions: [{ title: "賛成理由", content: "町民のためになる" }],
    },
    {
      stance: "against" as const,
      summary:
        "財源の確保が不透明であり、将来世代への負担増大が懸念されるため反対の立場をとる。歳出の見直しや他の財源確保策を十分に検討した上で、持続可能な制度設計を行うべきだと考える。",
      role: "work_related" as const,
      role_title: "会社員",
      role_description: "財政面を懸念する町民",
      opinions: [{ title: "反対理由", content: "財源が不明確" }],
    },
    {
      stance: "neutral" as const,
      summary:
        "現時点では議案の効果と影響について十分な情報が開示されておらず、賛否を判断するには時期尚早と考える。特に町民生活への影響や長期的な財政見通しについてより詳細な説明が必要。",
      role: "subject_expert" as const,
      role_title: "専門家",
      role_description: "慎重な判断を求める町民",
      opinions: [{ title: "態度保留理由", content: "情報不足" }],
    },
  ];

  const reports: Omit<
    InterviewReportInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // パターン1,2,3（5の倍数で0,1,2番目）のみレポートを作成
  // パターン4: 完了したけどレポート未作成
  // パターン5: 進行中（レポートなし）
  sessionIds.forEach((sessionId, index) => {
    const patternIndex = index % 5;
    if (patternIndex < 3) {
      const loopIndex = Math.floor(index / 5);
      reports.push({
        interview_session_id: sessionId,
        ...reportTemplates[patternIndex],
        is_public_by_user: loopIndex < 5, // 最初の5件は公開
        is_public_by_admin: loopIndex < 3, // 最初の3ループ分は管理者承認済み
      });
    }
  });

  return reports;
}

// デモ用の固定ID
export const DEMO_SESSION_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_REPORT_ID = "00000000-0000-0000-0000-000000000001";

// 4種類のロールを確認するためのデモ用ID
export const DEMO_SESSION_ID_WORK = "00000000-0000-0000-0000-000000000002";
export const DEMO_SESSION_ID_DAILY = "00000000-0000-0000-0000-000000000003";
export const DEMO_SESSION_ID_CITIZEN = "00000000-0000-0000-0000-000000000004";
export const DEMO_REPORT_ID_WORK = "00000000-0000-0000-0000-000000000002";
export const DEMO_REPORT_ID_DAILY = "00000000-0000-0000-0000-000000000003";
export const DEMO_REPORT_ID_CITIZEN = "00000000-0000-0000-0000-000000000004";

// デモ用のインタビューセッション（公開、固定ID）
export function createDemoSession(
  interviewConfigId: string
): InterviewSessionInsert {
  const now = new Date();
  return {
    id: DEMO_SESSION_ID,
    interview_config_id: interviewConfigId,
    user_id: "00000000-0000-0000-0000-000000000000",
    started_at: new Date(now.getTime() - 3600000).toISOString(),
    completed_at: new Date(now.getTime() - 3000000).toISOString(),
  };
}

// デモ用のインタビューメッセージ
export function createDemoMessages(): Omit<
  InterviewMessageInsert,
  "id" | "created_at"
>[] {
  return [
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "こんにちは！本日はインタビューにご協力いただきありがとうございます。\n\n葉山町の今後のまちづくりについて、率直なご意見をお聞かせください。今後、葉山町はどのようなことを達成してゆくと良いと思いますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "user",
      content: "町役場や議会のデジタル化や、ムダの削減を達成して欲しい",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content:
        "なるほど。役場のレスポンス速度の向上と、職員の負担軽減を通じて、よりよい行政サービスにつながる好循環を期待されているということですね。とても重要な指摘だと思います。\n\nそうした行政の働き方改革という視点から見たとき、議会の情報をわかりやすく伝える「みらい議会＠葉山町」のような取り組みは、今のあなたの期待にどの程度応えていると評価されますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "user",
      content:
        "役場のレスポンスの速さや、議会の議論が見えるようになることを期待しています。",
    },
    {
      interview_session_id: DEMO_SESSION_ID,
      role: "assistant",
      content: "ありがとうございました。ご意見を承りました。",
    },
  ];
}

// デモ用のインタビューレポート（固定ID）
export function createDemoReport(): InterviewReportInsert {
  return {
    id: DEMO_REPORT_ID,
    interview_session_id: DEMO_SESSION_ID,
    stance: "neutral",
    summary:
      "役場業務のデジタル化や職員の働き方改革には期待するが、システム移行時の混乱や高齢者への対応について懸念も大きい。慎重な段階的導入を求める。",
    role: "subject_expert",
    role_title: "町内事業者",
    role_description:
      "葉山町内の事業者\n役所手続きのデジタル化に関心\n窓口業務の改善を期待",
    opinions: [
      {
        title: "町役場や議会のデジタル化や、ムダの削減を達成して欲しい",
        content:
          "役場のレスポンスの速さや、議会の議論が見えるようになることを期待している。",
      },
    ],
    is_public_by_user: true,
    is_public_by_admin: true,
  };
}

// 追加のデモ用セッション（3種類のロール確認用）
export function createAdditionalDemoSessions(
  interviewConfigId: string
): InterviewSessionInsert[] {
  const now = new Date();
  return [
    {
      id: DEMO_SESSION_ID_WORK,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000010",
      started_at: new Date(now.getTime() - 7200000).toISOString(),
      completed_at: new Date(now.getTime() - 6600000).toISOString(),
    },
    {
      id: DEMO_SESSION_ID_DAILY,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000011",
      started_at: new Date(now.getTime() - 10800000).toISOString(),
      completed_at: new Date(now.getTime() - 10200000).toISOString(),
    },
    {
      id: DEMO_SESSION_ID_CITIZEN,
      interview_config_id: interviewConfigId,
      user_id: "00000000-0000-0000-0000-000000000012",
      started_at: new Date(now.getTime() - 14400000).toISOString(),
      completed_at: new Date(now.getTime() - 10200000).toISOString(),
    },
  ];
}

// 追加のデモ用メッセージ（3種類のロール確認用）
export function createAdditionalDemoMessages(): Omit<
  InterviewMessageInsert,
  "id" | "created_at"
>[] {
  return [
    // work_related セッション用
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content: "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "user",
      content: "物価高騰で仕入れコストが上がっています。この補正予算には賛成です。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content: "町内でお仕事をされている立場からのご意見ですね。具体的にどのような影響がありますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "user",
      content: "飲食店を経営していますが、食材費や光熱費が経営を圧迫しています。支援が少しでもあれば助かります。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_WORK,
      role: "assistant",
      content: "ありがとうございました。ご意見を承りました。",
    },
    // daily_life_affected セッション用
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content: "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "user",
      content: "葉山は坂が多く車が手放せないので、物価高対策の支援は嬉しいです。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content: "生活への影響が大きいとのことですね。どのような場面で負担を感じますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "user",
      content: "通勤や買い物、子供の送り迎えなど、毎日車を使っています。ガソリン代も上がっているので。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_DAILY,
      role: "assistant",
      content: "ありがとうございました。ご意見を承りました。",
    },
    // general_citizen セッション用
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content: "こんにちは！本日はインタビューにご協力いただきありがとうございます。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "user",
      content: "環境問題も気になりますが、今の物価高を考えると支援は必要だと思います。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content: "環境と家計のバランスを考えていらっしゃるのですね。どのような点が気になりますか？",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "user",
      content: "海岸の環境を守りつつ、当面の生活支援として予算をつけてもいいと思います。",
    },
    {
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      role: "assistant",
      content: "ありがとうございました。ご意見を承りました。",
    },
  ];
}

// 追加のデモ用レポート（3種類のロール確認用）
export function createAdditionalDemoReports(): InterviewReportInsert[] {
  return [
    {
      id: DEMO_REPORT_ID_WORK,
      interview_session_id: DEMO_SESSION_ID_WORK,
      stance: "for",
      summary:
        "食材費や光熱費の高騰が町内飲食店の経営を直撃しており、補正予算による支援は急務。支援の拡充は店舗の存続に直結する重要な施策だ。",
      role: "work_related",
      role_title: "飲食店経営者",
      role_description:
        "葉山町内の飲食店経営者\n従業員5名規模\n物価高騰の影響を直接受けている",
      opinions: [
        {
          title: "仕入れコストが経営を圧迫している",
          content:
            "飲食店を経営しているが、食材費や光熱費が経営を圧迫している。支援が少しでもあれば助かる。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
    {
      id: DEMO_REPORT_ID_DAILY,
      interview_session_id: DEMO_SESSION_ID_DAILY,
      stance: "for",
      summary:
        "坂の多い葉山では車は生活必需品であり、物価高対策の支援は生活に直結する問題。子育て世帯として送迎や買い物で毎日車を使うため、家計への負担軽減を強く望んでいる。",
      role: "daily_life_affected",
      role_title: "主婦",
      role_description:
        "葉山在住の主婦\n車が生活必需品\n子育て中で送り迎えに車を使用",
      opinions: [
        {
          title: "車が生活必需品",
          content:
            "通勤や買い物、子供の送り迎えなど毎日車を使っている。ガソリン代も上がっているので支援があると助かる。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
    {
      id: DEMO_REPORT_ID_CITIZEN,
      interview_session_id: DEMO_SESSION_ID_CITIZEN,
      stance: "neutral",
      summary:
        "補正予算による支援は短期的な家計支援になるが、海岸環境への配慮も欠かせない。環境保全と生活支援を組み合わせた総合的な町政として検討すべきだと考える。",
      role: "general_citizen",
      role_title: "会社員",
      role_description: "会社員\n環境問題に関心あり\n海岸清掃ボランティアに参加",
      opinions: [
        {
          title: "環境と家計のバランス",
          content:
            "海岸の環境を守りつつ、当面の生活支援として予算をつけてもいいと考える。",
        },
      ],
      is_public_by_user: true,
      is_public_by_admin: true,
    },
  ];
}
