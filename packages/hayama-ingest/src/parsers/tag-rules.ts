/**
 * 議案名キーワードによるタグ付けルール。
 * 人手の分類ではなく、件名の文言だけに依存する。
 * どのルールにも当たらない議案はタグなしになる。
 */
export type TagKeywordRule = {
  label: string;
  description: string;
  keywords: string[];
};

export const TAG_KEYWORD_RULES: TagKeywordRule[] = [
  {
    label: "子育て・教育",
    description: "子育て支援、教育政策、若者支援に関する議案",
    keywords: [
      "学校",
      "給食",
      "教育",
      "児童",
      "生徒",
      "保育",
      "子育て",
      "こども",
      "育成",
      "通園",
      "就学",
      "私学助成",
      "教職員",
    ],
  },
  {
    label: "環境・海・みどり",
    description: "海岸保全、ごみ・リサイクル、緑地保全に関する議案",
    keywords: [
      "海岸",
      "海水浴",
      "塵芥",
      "ごみ",
      "清掃",
      "環境",
      "緑",
      "公園",
      "下水",
      "造成",
      "カーボン",
      "脱炭素",
    ],
  },
  {
    label: "交通・まちづくり",
    description: "道路、公共施設、予算・決算、まちづくりに関する議案",
    keywords: [
      "道路",
      "町道",
      "橋",
      "工事",
      "契約",
      "財産",
      "バス",
      "交通",
      "駐車場",
      "空き家",
      "まちづくり",
      "都市計画",
      "補正予算",
      "予算",
      "決算",
      "税条例",
      "庁舎",
      "消防",
      "人事",
      "給与",
    ],
  },
  {
    label: "請願・陳情",
    description: "請願、陳情、意見書に関する議案",
    keywords: ["陳情", "請願", "意見書"],
  },
];

/** 議案名に当たるタグを全て返す。 */
export function matchTags(billName: string): string[] {
  return TAG_KEYWORD_RULES.filter((rule) =>
    rule.keywords.some((keyword) => billName.includes(keyword))
  ).map((rule) => rule.label);
}
