/** 元号ごとの元年の西暦 */
const ERA_BASE_YEAR: Record<string, number> = {
  令和: 2019,
  平成: 1989,
  昭和: 1926,
};

/** 元号名として認識する文字列 */
export const KNOWN_ERAS = Object.keys(ERA_BASE_YEAR);

/** 全角数字・全角スペースを半角に直す。 */
export function toHalfWidth(value: string): string {
  return value
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ");
}

/** 元号年を西暦に直す。不明な元号・範囲外は null。 */
export function warekiToYear(era: string, eraYear: number): number | null {
  const baseYear = ERA_BASE_YEAR[era];
  if (baseYear === undefined || eraYear < 1 || eraYear > 99) return null;
  return baseYear + eraYear - 1;
}

/** 年月日の妥当性を確認して ISO 8601 にする。不正なら null。 */
export function toIsoDate(
  year: number,
  month: number,
  day: number
): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * "令和7年6月定例会議" のような会期ラベルから西暦年を取る。
 * 見つからなければ null。
 */
export function yearFromSessionLabel(label: string): number | null {
  const normalized = toHalfWidth(label);
  for (const era of KNOWN_ERAS) {
    const matched = normalized.match(new RegExp(`${era}(\\d{1,2})年`));
    if (matched) return warekiToYear(era, Number(matched[1]));
  }
  return null;
}

/**
 * "5月15日" のような月日表記を ISO 8601 にする。年は呼び出し側が渡す。
 */
export function monthDayToIsoDate(
  value: string,
  year: number
): string | null {
  const matched = toHalfWidth(value.trim()).match(
    /^(\d{1,2})\s*月\s*(\d{1,2})\s*日/
  );
  if (!matched) return null;
  return toIsoDate(year, Number(matched[1]), Number(matched[2]));
}
