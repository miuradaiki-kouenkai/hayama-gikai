import { describe, expect, it } from "vitest";
import {
  monthDayToIsoDate,
  toHalfWidth,
  toIsoDate,
  warekiToYear,
  yearFromSessionLabel,
} from "./normalize-wareki";

describe("warekiToYear", () => {
  it("令和7年を2025年に変換する", () => {
    expect(warekiToYear("令和", 7)).toBe(2025);
  });

  it("未知の元号はnull", () => {
    expect(warekiToYear("大正", 7)).toBeNull();
  });
});

describe("toHalfWidth", () => {
  it("全角数字と全角スペースを直す", () => {
    expect(toHalfWidth("５月　１５日")).toBe("5月 15日");
  });
});

describe("toIsoDate", () => {
  it("存在しない日付はnull", () => {
    expect(toIsoDate(2025, 2, 30)).toBeNull();
  });
});

describe("yearFromSessionLabel", () => {
  it("会期ラベルから西暦年を取る", () => {
    expect(yearFromSessionLabel("令和7年第2回定例会6月定例会議")).toBe(2025);
  });
});

describe("monthDayToIsoDate", () => {
  it("月日と年からISO日付を作る", () => {
    expect(monthDayToIsoDate("5月15日", 2025)).toBe("2025-05-15");
  });

  it("空白入り・全角でも読める", () => {
    expect(monthDayToIsoDate("５月 １５日", 2025)).toBe("2025-05-15");
  });
});
