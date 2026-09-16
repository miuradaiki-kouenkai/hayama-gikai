import { describe, expect, it } from "vitest";
import { getJuneBillPdfUrl } from "./bill-source";

const BASE = "https://www.town.hayama.lg.jp/material/files/group/27";

describe("getJuneBillPdfUrl", () => {
  it("第20号〜第32号をgian7-N.pdfに解決する", () => {
    expect(
      getJuneBillPdfUrl("第20号 令和7年度葉山町一般会計補正予算（第2号）")
    ).toBe(`${BASE}/gian7-20.pdf`);
    expect(
      getJuneBillPdfUrl("第32号 令和7年度葉山町一般会計補正予算（第3号）")
    ).toBe(`${BASE}/gian7-32.pdf`);
  });

  it("議会議案・請願・陳情を解決する", () => {
    expect(
      getJuneBillPdfUrl("議会議案第7-12号 マイナ保険証の有無に関わらず〜")
    ).toBe(`${BASE}/gikaigian7-12.pdf`);
    expect(getJuneBillPdfUrl("請願第7-1号 教職員定数改善〜")).toBe(
      `${BASE}/seigan7-1-3.pdf`
    );
    expect(
      getJuneBillPdfUrl("陳情第7-16号 マイナ保険証の有無にかかわらず〜")
    ).toBe(`${BASE}/chin7-16.pdf`);
  });

  it("24件すべて解決できる", () => {
    const numbers = [
      ...Array.from({ length: 13 }, (_, i) => `第${20 + i}号`),
      "議会議案第7-10号",
      "議会議案第7-11号",
      "議会議案第7-12号",
      "請願第7-1号",
      ...Array.from({ length: 7 }, (_, i) => `陳情第7-${14 + i}号`),
    ];
    expect(numbers).toHaveLength(24);
    for (const n of numbers) {
      expect(getJuneBillPdfUrl(`${n} ダミー件名`)).not.toBeNull();
    }
  });

  it("未知の議案・12月議案はnull", () => {
    expect(
      getJuneBillPdfUrl("議案第50号 令和7年度葉山町一般会計補正予算（第6号）")
    ).toBeNull();
    expect(
      getJuneBillPdfUrl("葉山町子ども・子育て支援条例の一部改正")
    ).toBeNull();
  });
});
