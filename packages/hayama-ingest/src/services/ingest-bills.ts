import { HayamaSiteClient } from "../fetchers/hayama-site-client";
import { toBillStatus, toStatusNote } from "../parsers/map-bill-status";
import { parseSessionBills } from "../parsers/parse-session-bills";
import { parseSessionIndex } from "../parsers/parse-session-index";
import { buildSessionSlug } from "../parsers/session-naming";
import { toHalfWidth } from "../parsers/normalize-wareki";
import { buildYearIndexUrl } from "../shared/constants";
import { upsertBill } from "../repositories/ingest-repository";
import { createAdminClient } from "@mirai-gikai/supabase";

export type IngestBillsParams = {
  /** 元号年（例: 7 = 令和7年） */
  eraYear: number;
  /** 定例会の開催月（例: 6）。省略時はその年の全会期 */
  month?: number;
  client?: HayamaSiteClient;
};

export type IngestBillsResult = {
  sessions: { slug: string; billCount: number }[];
  skippedSessions: string[];
};

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function findSessionId(slug: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("diet_sessions")
    .select("id")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`会期の検索に失敗した: ${error.message}`);
  return data?.id ?? null;
}

/**
 * 年別indexの各会期ページから議案を取り込む。
 * 会期（日付確定済み）がDBに無い場合はその会期をスキップする。
 * 議案名は「第20号 ○○」のように番号付きで保存する。
 */
export async function ingestBills(
  params: IngestBillsParams
): Promise<IngestBillsResult> {
  const client = params.client ?? new HayamaSiteClient();
  const indexHtml = await client.fetchText(buildYearIndexUrl(params.eraYear));
  let indexSessions = parseSessionIndex(indexHtml);
  if (params.month !== undefined) {
    const needle = `${params.month}月`;
    indexSessions = indexSessions.filter((s) =>
      toHalfWidth(s.label).includes(needle)
    );
  }

  const sessions: IngestBillsResult["sessions"] = [];
  const skippedSessions: string[] = [];
  for (const indexSession of indexSessions) {
    const slug = buildSessionSlug(indexSession.label, params.eraYear);
    const sessionId = await findSessionId(slug);
    if (!sessionId) {
      skippedSessions.push(`${indexSession.label}(会期未取込)`);
      continue;
    }

    const pageHtml = await client.fetchText(indexSession.url);
    const { bills } = parseSessionBills(pageHtml, indexSession.url);
    for (const bill of bills) {
      await upsertBill({
        dietSessionId: sessionId,
        name: `${bill.number} ${bill.name}`,
        status: toBillStatus(bill.decision, bill.committee),
        statusNote: toStatusNote(bill.decision, bill.committee),
        sourceUrl: bill.documentUrl ?? indexSession.url,
      });
    }
    sessions.push({ slug, billCount: bills.length });
    await sleep(500);
  }

  return { sessions, skippedSessions };
}
