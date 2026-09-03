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
});
