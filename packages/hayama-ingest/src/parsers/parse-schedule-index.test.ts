import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseScheduleYearLinks,
  parseScheduleYearPage,
} from "./parse-schedule-index";

const FIXTURES = join(import.meta.dirname, "__fixtures__");

describe("parseScheduleYearLinks", () => {
  it("年別ページの一覧を読み取る", () => {
    const html = readFileSync(join(FIXTURES, "schedule-index.html"), "utf-8");
    const years = parseScheduleYearLinks(html);
    const r7 = years.find((y) => y.eraYear === 7);
    expect(r7?.url).toBe(
      "https://www.town.hayama.lg.jp/gikai/6/teireirinjinittei/15457.html"
    );
    const r8 = years.find((y) => y.eraYear === 8);
    expect(r8?.url).toContain("16365.html");
  });
});

describe("parseScheduleYearPage", () => {
  it("令和7年の5会期の日程リンクを読み取る", () => {
    const html = readFileSync(
      join(FIXTURES, "schedule-year-r7.html"),
      "utf-8"
    );
    const entries = parseScheduleYearPage(html);
    expect(entries).toHaveLength(5);
    const byLabel = new Map(entries.map((e) => [e.label, e.url]));
    expect(byLabel.get("第2回定例会 招集会議 日程")).toContain("KaigiID=41");
    expect(byLabel.get("第2回定例会 6月定例会議 日程")).toContain("KaigiID=43");
    expect(byLabel.get("第2回定例会 9月定例会議 日程")).toContain("KaigiID=44");
    expect(byLabel.get("第2回定例会 12月定例会議 日程")).toContain(
      "Nittei_Month"
    );
    expect(byLabel.get("第1回定例会 日程")).toContain("Nittei_Month");
  });
});
