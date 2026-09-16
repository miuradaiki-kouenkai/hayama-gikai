/**
 * 6月定例会議の議案本文PDFのURL解決。
 * 町サイト会期ページ（https://www.town.hayama.lg.jp/gikai/2_1/r2_5/15562.html）
 * に掲載のPDFファイル名を転記したマッピング。不明な議案は null。
 */
const TOWN_PDF_BASE = "https://www.town.hayama.lg.jp/material/files/group/27";

function buildBillPdfFiles(): Record<string, string> {
  const files: Record<string, string> = {};
  // 第20号〜第32号: gian7-{N}.pdf
  for (let n = 20; n <= 32; n++) {
    files[`第${n}号`] = `gian7-${n}.pdf`;
  }
  // 議会議案第7-10号〜7-12号: gikaigian7-{N}.pdf
  for (let n = 10; n <= 12; n++) {
    files[`議会議案第7-${n}号`] = `gikaigian7-${n}.pdf`;
  }
  // 請願第7-1号のみファイル名が不規則
  files["請願第7-1号"] = "seigan7-1-3.pdf";
  // 陳情第7-14号〜7-20号: chin7-{N}.pdf
  for (let n = 14; n <= 20; n++) {
    files[`陳情第7-${n}号`] = `chin7-${n}.pdf`;
  }
  return files;
}

const BILL_PDF_FILES = buildBillPdfFiles();

/**
 * 議案名（「第20号 ○○」形式）の先頭の議案番号から本文PDFのURLを返す。
 */
export function getJuneBillPdfUrl(billName: string): string | null {
  const number = billName.split(" ")[0];
  const file = BILL_PDF_FILES[number];
  return file ? `${TOWN_PDF_BASE}/${file}` : null;
}
