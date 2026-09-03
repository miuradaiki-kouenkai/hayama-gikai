import { describe, expect, it } from "vitest";
import { getCardStatusLabel, getStatusVariant } from "./bill-status";

describe("getCardStatusLabel", () => {
  it.each([
    ["introduced", "審議中"],
    ["in_originating_house", "審議中"],
    ["in_receiving_house", "審議中"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getCardStatusLabel(status)).toBe(expected);
  });

  it("enacted → 可決", () => {
    expect(getCardStatusLabel("enacted")).toBe("可決");
  });

  it("rejected → 否決", () => {
    expect(getCardStatusLabel("rejected")).toBe("否決");
  });

  it("preparing → 提出前", () => {
    expect(getCardStatusLabel("preparing")).toBe("提出前");
  });
});

describe("getStatusVariant", () => {
  it.each([
    ["introduced", "light"],
    ["in_originating_house", "light"],
    ["in_receiving_house", "light"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getStatusVariant(status)).toBe(expected);
  });

  it("enacted → default", () => {
    expect(getStatusVariant("enacted")).toBe("default");
  });

  it("rejected → dark", () => {
    expect(getStatusVariant("rejected")).toBe("dark");
  });

  it("preparing → muted", () => {
    expect(getStatusVariant("preparing")).toBe("muted");
  });
});

describe("getCardStatusLabel with statusNote", () => {
  it.each([
    ["本会議で可決", "可決"],
    ["総務建設委員会を経て、本会議で採択", "採択"],
    ["本会議で同意", "同意"],
    ["決算特別委員会を経て、本会議で認定", "認定"],
    ["本会議で承認", "承認"],
    ["教育民生委員会を経て、本会議で趣旨了承", "趣旨了承"],
    ["決算特別委員会を経て、本会議で不認定", "不認定"],
  ])("note %s → %s", (note, expected) => {
    expect(getCardStatusLabel("enacted", note)).toBe(expected);
  });

  it("noteが無ければステータスから畳む", () => {
    expect(getCardStatusLabel("enacted", null)).toBe("可決");
    expect(getCardStatusLabel("in_originating_house", null)).toBe("審議中");
  });
});
