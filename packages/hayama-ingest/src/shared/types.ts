/** 町サイトの年別indexから読み取った1会期分 */
export type ParsedYearSession = {
  /** 表記そのまま（例: "令和7年第2回定例会6月定例会議"） */
  label: string;
  /** 会期ページの絶対URL */
  url: string;
};

/** 会期ページの表から読み取った1議案分 */
export type ParsedSessionBill = {
  /** 議案番号（例: "第20号"。請願・陳情は "第7-14号" のように通し番号） */
  number: string;
  /** 区分（町長提出議案 / 議会提出議案・意見書 / 請願 / 陳情） */
  category: BillCategory;
  /** 件名 */
  name: string;
  /** 付託先委員会（"-" や空欄は null） */
  committee: string | null;
  /** 結果（"可決" など。空欄は null） */
  decision: string | null;
  /** 議案PDFの絶対URL（無い場合は null） */
  documentUrl: string | null;
};

export type BillCategory =
  | "mayor"
  | "council"
  | "petition"
  | "appeal";

/** 議会中継の日程ページから読み取った1会期分の日程 */
export type ParsedSessionSchedule = {
  /** 表記そのまま（例: "令和7年第2回定例会招集会議"） */
  label: string;
  /** 会期内の会議日（ISO 8601 の配列） */
  dates: string[];
};
