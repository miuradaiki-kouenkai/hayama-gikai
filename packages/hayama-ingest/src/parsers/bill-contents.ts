/**
 * 議案解説（bill_contents）の組み立て。
 * AI生成ではなく、件名・審議結果・資料URLだけから定型文を作る。
 * 詳細は葉山町議会の公開資料へのリンクに寄せる。
 */

export const GIKAI_FALLBACK_URL = "https://www.town.hayama.lg.jp/gikai/";

/** 「第1号 」「第7-13号 」のような町付番を取り除く。議会議案は残す。 */
export function toDisplayTitle(billName: string): string {
  return billName.replace(/^第\d+(?:-\d+)?号\s+/, "");
}

export type BuiltContents = {
  title: string;
  summary: string;
  normal: string;
  hard: string;
};

export function buildContents(input: {
  name: string;
  statusNote: string | null;
  pdfUrl: string | null;
}): BuiltContents {
  const title = toDisplayTitle(input.name);
  const result = input.statusNote ?? "審議中";
  const pdf = input.pdfUrl ?? GIKAI_FALLBACK_URL;
  const summary = `${title}（${result}）。詳細は葉山町議会の公開資料を参照。`;
  const normal = [
    `# ${title}`,
    ``,
    `## 概要`,
    ``,
    summary,
    ``,
    `## 資料`,
    ``,
    `- [町サイトの議案資料](${pdf})`,
    ``,
  ].join("\n");
  const hard = [
    normal,
    `## 詳しく読む`,
    ``,
    `この議案の原文書（PDF）は、葉山町議会の公開資料で読めます。`,
    ``,
    `- [議案資料PDF](${pdf})`,
    `- 審議結果: ${result}`,
    ``,
  ].join("\n");
  return { title, summary, normal, hard };
}
