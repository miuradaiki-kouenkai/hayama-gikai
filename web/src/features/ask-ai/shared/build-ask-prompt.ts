export type AskPromptInput = {
  billName: string;
  summary?: string | null;
  statusNote?: string | null;
  pageUrl: string;
  question: string;
};

/** 議案詳細の定番質問 */
export const BILL_PRESET_QUESTIONS = [
  "この議案のポイントは？",
  "この議案は私にどんな影響がある？",
  "賛成・反対の主な意見は？",
] as const;

/**
 * 外部AIに渡す質問文を作る。URLと要点を添える方式で、
 * ページが未公開・未インデックスでも要点から答えられる形にする。
 */
export function buildAskPrompt(input: AskPromptInput): string {
  const lines = [
    "以下の葉山町議会の議案について教えてください。",
    "",
    `【議案】${input.billName}`,
  ];
  if (input.statusNote) lines.push(`【状況】${input.statusNote}`);
  if (input.summary) lines.push(`【概要】${input.summary}`);
  lines.push(`【ページ】${input.pageUrl}`, "", `【質問】${input.question}`);
  return lines.join("\n");
}
