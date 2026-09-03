import { describe, expect, it } from "vitest";
import {
  ASK_AI_PROVIDERS,
  buildProviderUrl,
  encodeAskPrompt,
} from "./providers";

describe("buildProviderUrl", () => {
  it("日本語・改行をエンコードして載せる", () => {
    const provider = ASK_AI_PROVIDERS[0];
    const url = buildProviderUrl(provider, "この議案の\nポイントは？");
    expect(url).toBe(
      `https://chatgpt.com/?q=${encodeURIComponent("この議案の\nポイントは？")}`
    );
  });

  it("5つの送信先がある", () => {
    expect(ASK_AI_PROVIDERS.map((p) => p.id)).toEqual([
      "chatgpt",
      "claude",
      "aimode",
      "perplexity",
      "aistudio",
    ]);
  });

  it("encodeAskPromptはencodeURIComponentと等しい", () => {
    expect(encodeAskPrompt("あ い")).toBe(encodeURIComponent("あ い"));
  });
});
