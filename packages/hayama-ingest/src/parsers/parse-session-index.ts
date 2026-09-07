import { HAYAMA_TOWN_BASE_URL } from "../shared/constants";
import type { ParsedYearSession } from "../shared/types";
import { toHalfWidth } from "./normalize-wareki";

/** 年別indexの本文から会期リンクを抜く。 */
const SESSION_LINK_PATTERN =
  /<a\s[^>]*href="([^"]+)"[^>]*>([^<]*?(?:定例会|臨時会|招集会議)[^<]*)<\/a>/g;

/**
 * 年別index（例: 令和7年のページ）から会期の一覧を読み取る。
 * baseUrl は相対リンクの解決に使う。
 */
export function parseSessionIndex(
  html: string,
  baseUrl: string = HAYAMA_TOWN_BASE_URL
): ParsedYearSession[] {
  const found = new Map<string, ParsedYearSession>();
  for (const match of html.matchAll(SESSION_LINK_PATTERN)) {
    const [, href, rawLabel] = match;
    if (!href.includes("/gikai/")) continue;
    const label = toHalfWidth(rawLabel).replace(/\s+/g, "").trim();
    if (!label) continue;
    const url = new URL(href, baseUrl).toString();
    if (found.has(url)) continue;
    found.set(url, { label, url });
  }
  return [...found.values()];
}
