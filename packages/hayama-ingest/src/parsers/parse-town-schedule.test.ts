import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTownSchedule } from "./parse-town-schedule";

const FIXTURES = join(import.meta.dirname, "__fixtures__");

describe("parseTownSchedule", () => {
  it("令和2年第1回定例会の日程を読み取る", () => {
    const html = readFileSync(
      join(FIXTURES, "town-schedule-r2-01.html"),
      "utf-8"
    );
    const schedule = parseTownSchedule(html, 2);
    expect(schedule.label).toBe("第1回定例会 日程");
    // 休会日（2/14〜18など）は含まない
    expect(schedule.dates).toContain("2020-02-13");
    expect(schedule.dates).toContain("2020-02-19");
    expect(schedule.dates).not.toContain("2020-02-14");
    expect(schedule.dates).not.toContain("2020-02-16");
    expect(schedule.dates[0]).toBe("2020-02-13");
  });
});
