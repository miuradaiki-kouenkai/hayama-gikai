import { describe, expect, it } from "vitest";
import { buildContents, toDisplayTitle } from "./bill-contents";

describe("toDisplayTitle", () => {
  it("町の付番を取り除く", () => {
    expect(toDisplayTitle("第1号 令和6年度葉山町一般会計補正予算（第9号）")).toBe(
      "令和6年度葉山町一般会計補正予算（第9号）"
    );
  });

  it("陳情の付番を取り除く", () => {
    expect(
      toDisplayTitle("第7-13号 陳情 ごみ処理基本データの定期開示")
    ).toBe("陳情 ごみ処理基本データの定期開示");
  });

  it("議会議案の付番は残す", () => {
    expect(
      toDisplayTitle("議会議案第7-2号 最低賃金の改善を求める意見書")
    ).toBe("議会議案第7-2号 最低賃金の改善を求める意見書");
  });
});

describe("buildContents", () => {
  it("定型文を組み立てる", () => {
    const built = buildContents({
      name: "第5号 令和7年度葉山町一般会計予算",
      statusNote: "予算特別委員会を経て、本会議で可決",
      pdfUrl: "https://example.invalid/gian.pdf",
    });
    expect(built.title).toBe("令和7年度葉山町一般会計予算");
    expect(built.summary).toBe(
      "令和7年度葉山町一般会計予算（予算特別委員会を経て、本会議で可決）。詳細は葉山町議会の公開資料を参照。"
    );
    expect(built.normal).toContain("## 資料");
    expect(built.hard).toContain("## 詳しく読む");
    expect(built.hard).toContain("- 審議結果: 予算特別委員会を経て、本会議で可決");
  });

  it("未定のときは審議中と議会トップへのリンクになる", () => {
    const built = buildContents({ name: "第1号 仮議案", statusNote: null, pdfUrl: null });
    expect(built.summary).toContain("（審議中）");
    expect(built.normal).toContain("https://www.town.hayama.lg.jp/gikai/");
  });
});
