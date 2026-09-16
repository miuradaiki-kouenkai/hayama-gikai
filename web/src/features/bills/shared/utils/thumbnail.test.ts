import { describe, expect, it } from "vitest";
import { normalizeThumbnailUrl } from "./thumbnail";

describe("normalizeThumbnailUrl", () => {
  it("通常URLはそのまま返す", () => {
    expect(normalizeThumbnailUrl("https://example.com/a.jpg")).toBe(
      "https://example.com/a.jpg"
    );
  });

  it("placehold.coはnullにする", () => {
    expect(
      normalizeThumbnailUrl("https://placehold.co/600x400.png")
    ).toBeNull();
    expect(
      normalizeThumbnailUrl("https://www.placehold.co/600x400.png")
    ).toBeNull();
  });

  it("空・不正値はnullにする", () => {
    expect(normalizeThumbnailUrl(null)).toBeNull();
    expect(normalizeThumbnailUrl(undefined)).toBeNull();
    expect(normalizeThumbnailUrl("")).toBeNull();
    expect(normalizeThumbnailUrl("not-a-url")).toBeNull();
  });
});
