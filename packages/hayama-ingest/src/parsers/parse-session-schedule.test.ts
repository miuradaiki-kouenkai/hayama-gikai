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

  it("第1回定例会の会期名だけを読み取る", () => {
    const schedule = parseSessionSchedule(readShiftJis("nittei-kaigi-40.html"));
    expect(schedule.label).toBe("令和7年第1回定例会");
    expect(schedule.dates[0]).toBe("2025-02-12");
    expect(schedule.dates[schedule.dates.length - 1]).toBe("2025-03-19");
  });

  it("回次の無い6月・12月定例会議も読み取る", () => {
    const june = parseSessionSchedule(readShiftJis("nittei-kaigi-43.html"));
    expect(june.label).toBe("令和7年6月定例会議");
    expect(june.dates.length).toBeGreaterThan(0);

    const december = parseSessionSchedule(
      readShiftJis("nittei-kaigi-46.html")
    );
    expect(december.label).toBe("令和7年12月定例会議");
    expect(december.dates.length).toBeGreaterThan(0);
  });
});
