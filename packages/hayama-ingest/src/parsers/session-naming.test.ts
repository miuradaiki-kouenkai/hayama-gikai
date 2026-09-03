import { describe, expect, it } from "vitest";
import { buildSessionSlug, sessionMatchKey } from "./session-naming";

describe("buildSessionSlug", () => {
  it("6月定例会議", () => {
    expect(buildSessionSlug("令和7年第2回定例会6月定例会議", 7)).toBe(
      "hayama-r7-2-06"
    );
  });

  it("招集会議", () => {
    expect(buildSessionSlug("令和7年第2回定例会招集会議", 7)).toBe(
      "hayama-r7-2-shoshu"
    );
  });

  it("第1回定例会", () => {
    expect(buildSessionSlug("令和7年第1回定例会", 7)).toBe("hayama-r7-1-main");
  });
});

describe("sessionMatchKey", () => {
  it("元号年を除く", () => {
    expect(sessionMatchKey("令和7年第2回定例会招集会議")).toBe(
      "第2回定例会招集会議"
    );
  });
});
