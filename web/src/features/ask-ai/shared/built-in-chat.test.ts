import { describe, expect, it, vi } from "vitest";
import { isBuiltInChatEnabled } from "./built-in-chat";

describe("isBuiltInChatEnabled", () => {
  it("既定は無効", () => {
    vi.stubEnv("NEXT_PUBLIC_BUILT_IN_CHAT_ENABLED", "");
    expect(isBuiltInChatEnabled()).toBe(false);
  });

  it("trueのときだけ有効", () => {
    vi.stubEnv("NEXT_PUBLIC_BUILT_IN_CHAT_ENABLED", "true");
    expect(isBuiltInChatEnabled()).toBe(true);
    vi.unstubAllEnvs();
  });
});
