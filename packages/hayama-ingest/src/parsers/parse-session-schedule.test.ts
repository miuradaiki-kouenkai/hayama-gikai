import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSessionSchedule } from "./parse-session-schedule";

const FIXTURES = join(import.meta.dirname, "__fixtures__");

function readShiftJis(name: string): string {
  const bytes = readFileSync(join(FIXTURES, name));
  return new TextDecoder("shift-jis").decode(bytes);
}

describe("parseSessionSchedule", () => {
  it("招集会議の日程を読み取る", () => {
    const schedule = parseSessionSchedule(readShiftJis("nittei-kaigi-41.html"));
    expect(schedule.label).toBe("令和7年第2回定例会招集会議");
    expect(schedule.dates).toContain("2025-05-15");
    expect(schedule.dates[0]).toBe("2025-05-15");
  });
});

describe("parseMonthSchedule", () => {
  it("2025年12月の会議日を読み取る", async () => {
    const { parseMonthSchedule } = await import("./parse-session-schedule");
    const schedule = parseMonthSchedule(readShiftJis("schedule-month-202512.html"));
    expect(schedule.year).toBe(2025);
    expect(schedule.month).toBe(12);
    expect(schedule.dates[0]).toBe("2025-12-01");
    expect(schedule.dates).toContain("2025-12-16");
  });
});
