import { describe, expect, it } from "vitest";
import { BILL_PRESET_QUESTIONS, buildAskPrompt } from "./build-ask-prompt";

describe("buildAskPrompt", () => {
  it("議案情報と質問を組み立てる", () => {
    const prompt = buildAskPrompt({
      billName: "第20号 令和7年度葉山町一般会計補正予算（第2号）",
      summary: "物価高対策の補正予算です。",
      statusNote: "本会議で可決",
      pageUrl: "https://example.com/bills/1",
      question: "この議案のポイントは？",
    });
    expect(prompt).toContain("【議案】第20号");
    expect(prompt).toContain("【状況】本会議で可決");
    expect(prompt).toContain("【概要】物価高対策の補正予算です。");
    expect(prompt).toContain("【ページ】https://example.com/bills/1");
    expect(prompt).toContain("【質問】この議案のポイントは？");
  });

  it("空の概要・状況は省く", () => {
    const prompt = buildAskPrompt({
      billName: "議案A",
      summary: null,
      statusNote: null,
      pageUrl: "https://example.com/bills/1",
      question: "教えて",
    });
    expect(prompt).not.toContain("【概要】");
    expect(prompt).not.toContain("【状況】");
  });

  it("定番質問が3つある", () => {
    expect(BILL_PRESET_QUESTIONS).toHaveLength(3);
  });
});
