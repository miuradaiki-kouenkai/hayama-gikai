import { describe, expect, it } from "vitest";
import { toBillStatus, toStatusNote } from "./map-bill-status";

describe("toBillStatus", () => {
  it("可決はenacted", () => {
    expect(toBillStatus("可決", null)).toBe("enacted");
  });

  it("同意・採択・趣旨了承はenacted", () => {
    expect(toBillStatus("同意", null)).toBe("enacted");
    expect(toBillStatus("採択", null)).toBe("enacted");
    expect(toBillStatus("趣旨了承", null)).toBe("enacted");
  });

  it("否決はrejected", () => {
    expect(toBillStatus("否決", null)).toBe("rejected");
  });

  it("結果なし＋委員会ありはin_originating_house", () => {
    expect(toBillStatus(null, "総務建設")).toBe("in_originating_house");
  });

  it("結果なし＋委員会なしはintroduced", () => {
    expect(toBillStatus(null, null)).toBe("introduced");
  });
});

describe("toStatusNote", () => {
  it("委員会と結果をつなげる", () => {
    expect(toStatusNote("可決", "総務建設")).toBe(
      "総務建設委員会を経て、本会議で可決"
    );
  });

  it("結果なしは審査中", () => {
    expect(toStatusNote(null, null)).toBe("葉山町議会で審議中");
  });
});
