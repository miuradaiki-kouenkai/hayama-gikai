import { describe, expect, it } from "vitest";
import { matchTags } from "./tag-rules";

describe("matchTags", () => {
  it("造成工事の陳情は環境と請願・陳情に当たる", () => {
    expect(
      matchTags("第7-17号 株式会社三嘉を事業者とする有限会社新世工業による下山口茅木山の大規模な造成工事に関する陳情書")
    ).toEqual(["環境・海・みどり", "交通・まちづくり", "請願・陳情"]);
  });

  it("私学助成の意見書は子育て・教育と請願・陳情に当たる", () => {
    expect(
      matchTags("議会議案第7-22号 神奈川県に私学助成の拡充を求める意見書")
    ).toEqual(["子育て・教育", "請願・陳情"]);
  });

  it("補正予算は交通・まちづくりに当たる", () => {
    expect(matchTags("第20号 令和7年度葉山町一般会計補正予算（第2号）")).toEqual([
      "交通・まちづくり",
    ]);
  });

  it("当たらない議案は空配列", () => {
    expect(matchTags("第31号 人権擁護委員の推薦について")).toEqual([]);
  });
});
