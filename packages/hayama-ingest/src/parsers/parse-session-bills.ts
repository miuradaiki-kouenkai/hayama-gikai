import { HAYAMA_TOWN_BASE_URL } from "../shared/constants";
import type { BillCategory, ParsedSessionBill } from "../shared/types";
import { toHalfWidth } from "./normalize-wareki";

/** 会期ページの解析結果 */
export type ParsedSessionPage = {
  bills: ParsedSessionBill[];
  /** 議員別賛否結果PDFの絶対URL（無い場合は null） */
  voteResultPdfUrl: string | null;
};

/** h2見出しと表の対応付け */
const SECTION_PATTERN = /<h2[^>]*>(.*?)<\/h2>/gs;
const TABLE_PATTERN = /<table[^>]*>(.*?)<\/table>/gs;
const ROW_PATTERN = /<tr[^>]*>(.*?)<\/tr>/gs;
const CELL_PATTERN = /<t[dh][^>]*>(.*?)<\/t[dh]>/gs;
const HREF_PATTERN = /<a[^>]*href="([^"]+)"[^>]*>/;
/** 件名欄に紛れ込んだ審議結果の文言（rowspan の取り違え対策）。 */
const RESULT_HEAD_PATTERN =
  /^(可決|否決|採択|不採択|趣旨了承|継続|同意|認定|不認定|承認|報告|審議中|撤回)/;
const VOTE_PDF_PATTERN =
  /<a[^>]*href="([^"]*sanpi[^"]*\.pdf)"[^>]*>/;

function toText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\(PDFファイル:[^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionCategory(heading: string): "mayor" | "council" | "mixed" | null {
  const text = toHalfWidth(heading).replace(/\s+/g, "");
  if (text.includes("町長提出議案")) return "mayor";
  if (text.includes("議会提出議案")) return "council";
  if (text.includes("請願") || text.includes("陳情")) return "mixed";
  return null;
}

function captionCategory(
  caption: string,
  section: "mayor" | "council" | "mixed"
): BillCategory {
  const text = toHalfWidth(caption).replace(/\s+/g, "");
  if (text.includes("陳情")) return "appeal";
  if (text.includes("請願")) return "petition";
  return section === "council" ? "council" : "mayor";
}

function cleanCommittee(value: string): string | null {
  const text = toHalfWidth(value).replace(/\s+/g, "");
  if (!text || text === "-" || text === "－" || text === "―") return null;
  return text;
}

function cleanDecision(value: string): string | null {
  const text = toHalfWidth(value).replace(/\s+/g, "");
  return text || null;
}

/**
 * 会期ページ（例: 令和7年第2回定例会6月定例会議）から議案の表を読み取る。
 * baseUrl は相対リンクの解決に使う。
 */
export function parseSessionBills(
  html: string,
  baseUrl: string = HAYAMA_TOWN_BASE_URL
): ParsedSessionPage {
  const bills: ParsedSessionBill[] = [];

  const voteMatch = html.match(VOTE_PDF_PATTERN);
  const voteResultPdfUrl = voteMatch
    ? new URL(voteMatch[1], baseUrl).toString()
    : null;

  const sections: { heading: string; body: string }[] = [];
  const headings = [...html.matchAll(SECTION_PATTERN)];
  for (let i = 0; i < headings.length; i++) {
    const bodyStart = (headings[i].index ?? 0) + headings[i][0].length;
    const bodyEnd = headings[i + 1]?.index ?? html.length;
    sections.push({
      heading: toText(headings[i][1]),
      body: html.slice(bodyStart, bodyEnd),
    });
  }

  for (const section of sections) {
    const kind = sectionCategory(section.heading);
    if (!kind) continue;

    for (const tableMatch of section.body.matchAll(TABLE_PATTERN)) {
      const tableHtml = tableMatch[1];
      const captionMatch = tableHtml.match(/<caption[^>]*>(.*?)<\/caption>/s);
      const category = captionCategory(
        captionMatch ? toText(captionMatch[1]) : "",
        kind
      );

      const rows = [...tableHtml.matchAll(ROW_PATTERN)];
      if (rows.length === 0) continue;

      // 先頭行が見出し行か判定する（th を含むか）
      const firstRowCells = [...rows[0][1].matchAll(CELL_PATTERN)];
      const hasHeader = /<th/i.test(rows[0][1]);
      const headerNames = hasHeader
        ? firstRowCells.map((c) => toText(c[1]))
        : [];
      const dataRows = hasHeader ? rows.slice(1) : rows;

      for (const row of dataRows) {
        const cells = [...row[1].matchAll(CELL_PATTERN)].map((c) => c[1]);
        if (cells.length === 0) continue;

        const indexOf = (name: string): number =>
          headerNames.findIndex((h) => h.includes(name));
        const at = (idx: number): string =>
          idx >= 0 && idx < cells.length ? toText(cells[idx]) : "";

        const number = hasHeader ? at(indexOf("議案番号")) : at(0);
        // 見出し行の取り残し・空行は捨てる
        if (!number || number.includes("議案番号")) continue;
        // 番号らしくない行（結果セルの取り違え）は捨てる
        if (!number.includes("号")) continue;

        const nameCell = hasHeader ? cells[indexOf("件名")] : cells[1];
        if (nameCell === undefined) continue;
        const name = toText(nameCell);
        if (!name) continue;
        // 結果セルの取り違え（例: "趣旨了承 令和7年 第2回定例会招集会議"）は捨てる
        if (RESULT_HEAD_PATTERN.test(name)) continue;
        const docMatch = nameCell.match(HREF_PATTERN);
        const documentUrl = docMatch
          ? new URL(docMatch[1], baseUrl).toString()
          : null;

        const committeeRaw = hasHeader ? at(indexOf("付託先委員会")) : "";
        const decisionRaw = hasHeader ? at(indexOf("結果")) : "";

        bills.push({
          number: toHalfWidth(number).replace(/\s+/g, ""),
          category,
          name,
          committee: cleanCommittee(committeeRaw),
          decision: cleanDecision(decisionRaw),
          documentUrl,
        });
      }
    }
  }

  return { bills, voteResultPdfUrl };
}
