import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSessionIndex } from "./parse-session-index";

const FIXTURES = join(import.meta.dirname, "__fixtures__");

describe("parseSessionIndex", () => {
  it("令和7年の5会期を読み取る", () => {
    const html = readFileSync(join(FIXTURES, "year-index-r7.html"), "utf-8");
    const sessions = parseSessionIndex(html);
    const labels = sessions.map((s) => s.label);
    expect(labels).toContain("令和7年第1回定例会");
    expect(labels).toContain("令和7年第2回定例会6月定例会議");
    expect(labels).toContain("令和7年第2回定例会9月定例会議");
    expect(labels).toContain("令和7年第2回定例会12月定例会議");
    expect(sessions).toHaveLength(5);
    for (const session of sessions) {
      expect(session.url).toMatch(
        /^https:\/\/www\.town\.hayama\.lg\.jp\/gikai\/2_1\/r2_5\/\d+\.html$/
      );
    }
  });
});
