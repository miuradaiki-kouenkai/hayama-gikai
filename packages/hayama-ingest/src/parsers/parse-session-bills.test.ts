import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSessionBills } from "./parse-session-bills";

const FIXTURES = join(import.meta.dirname, "__fixtures__");

describe("parseSessionBills", () => {
  it("令和7年6月定例会議の全議案を読み取る", () => {
    const html = readFileSync(join(FIXTURES, "session-r7-06.html"), "utf-8");
    const { bills, voteResultPdfUrl } = parseSessionBills(html);

    const mayor = bills.filter((b) => b.category === "mayor");
    const council = bills.filter((b) => b.category === "council");
    const petitions = bills.filter((b) => b.category === "petition");
    const appeals = bills.filter((b) => b.category === "appeal");
    expect(mayor).toHaveLength(13);
    expect(council).toHaveLength(3);
    expect(petitions).toHaveLength(1);
    expect(appeals).toHaveLength(7);

    const first = mayor[0];
    expect(first.number).toBe("第20号");
    expect(first.name).toBe("令和7年度葉山町一般会計補正予算（第2号）");
    expect(first.decision).toBe("可決");
    expect(first.committee).toBeNull();
    expect(first.documentUrl).toBe(
      "https://www.town.hayama.lg.jp/material/files/group/27/gian7-20.pdf"
    );

    const appeal = appeals[0];
    expect(appeal.number).toBe("第7-14号");
    expect(appeal.committee).toBe("総務建設");
    expect(appeal.decision).toBe("採択");

    expect(voteResultPdfUrl).toBe(
      "https://www.town.hayama.lg.jp/material/files/group/27/7-6sanpi.pdf"
    );
  });

  it("審議結果の文言から始まる行は議案として拾わない", () => {
    const html = [
      "<h2>町長提出議案</h2>",
      "<table><caption>議案</caption>",
      "<tr><th>議案番号</th><th>件名</th><th>結果</th></tr>",
      "<tr><td>第1号</td><td>令和7年度一般会計予算</td><td>可決</td></tr>",
      "<tr><td>継続</td><td>趣旨了承 令和7年 第2回定例会招集会議</td><td></td></tr>",
      "</table>",
    ].join("");
    const { bills } = parseSessionBills(html);
    expect(bills.map((b) => b.name)).toEqual(["令和7年度一般会計予算"]);
  });

  it("番号らしくない行は議案として拾わない", () => {
    const html = [
      "<h2>議会提出議案</h2>",
      "<table><caption>意見書</caption>",
      "<tr><th>議案番号</th><th>件名</th><th>結果</th></tr>",
      "<tr><td>議会議案第7-2号</td><td>最低賃金の改善を求める意見書</td><td>可決</td></tr>",
      "<tr><td>採択</td><td>令和8年 2月定例会議</td><td></td></tr>",
      "</table>",
    ].join("");
    const { bills } = parseSessionBills(html);
    expect(bills.map((b) => b.number)).toEqual(["議会議案第7-2号"]);
  });
});
