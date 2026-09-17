import type { AdminClient } from "../shared/helper";
import juneVotes from "./hayama-votes-r7-06.json";
import stances from "./hayama-stances-r7-12.json";

/**
 * 葉山町議会の実データ seed。
 * 出典:
 * - 議員名簿: 町サイト「議員の紹介」(https://www.town.hayama.lg.jp/gikai/giin/3487.html)
 * - 6月定例会議の議案・賛否: 町サイト会期ページ + 議員別賛否PDF(7-6sanpi.pdf)
 * - 12月定例会議の討論・採決人数: 議会中継の会議録(12月1日分)
 */

export const HAYAMA_MEMBERS = [
  { name: "三浦大輝", seat_number: 1, party: "無所属", role: "member" },
  { name: "星加代子", seat_number: 2, party: "公明党", role: "member" },
  { name: "笹本貢史", seat_number: 3, party: "葉山維新の会", role: "member" },
  { name: "中村和雄", seat_number: 4, party: "無所属", role: "member" },
  { name: "石岡実成", seat_number: 5, party: "無所属", role: "member" },
  { name: "山田由美", seat_number: 6, party: "無所属", role: "member" },
  { name: "金崎ひさ", seat_number: 7, party: "新葉クラブ", role: "member" },
  { name: "荒井直彦", seat_number: 8, party: "尚政会", role: "member" },
  { name: "笠原俊一", seat_number: 9, party: "尚政会", role: "member" },
  { name: "待寺真司", seat_number: 10, party: "無所属", role: "member" },
  { name: "窪田美樹", seat_number: 11, party: "日本共産党", role: "member" },
  { name: "近藤昇一", seat_number: 12, party: "日本共産党", role: "member" },
  { name: "土佐洋子", seat_number: 13, party: "尚政会", role: "chair" },
  { name: "伊東圭介", seat_number: 14, party: "尚政会", role: "member" },
] as const;

const JUNE_SESSION = {
  name: "令和7年第2回定例会6月定例会議",
  slug: "hayama-r7-2-06",
  start_date: "2025-06-06",
  end_date: "2025-06-26",
  shugiin_url:
    "https://hayama-gikai.gijiroku.com/g07_Nittei_Kaigi.asp?KaigiID=43",
  is_active: false,
};

const DEC_SESSION = {
  name: "令和7年第2回定例会12月定例会議",
  slug: "hayama-r7-2-12",
  start_date: "2025-12-01",
  end_date: "2025-12-16",
  shugiin_url:
    "https://hayama-gikai.gijiroku.com/voices/cgi/voiweb.exe?ACT=203&FINO=707",
  is_active: false,
};

// 6月定例会議の議案（町サイト会期ページより。「第○号 件名」形式で保存）
const JUNE_BILLS: Array<{ number: string; name: string }> = [
  { number: "第20号", name: "令和7年度葉山町一般会計補正予算（第2号）" },
  { number: "第21号", name: "令和7年度葉山町国民健康保険特別会計補正予算（第1号）" },
  { number: "第22号", name: "葉山町税条例の一部を改正する条例" },
  { number: "第23号", name: "葉山町特定教育・保育施設及び特定地域型保育事業の運営に関する基準を定める条例の一部を改正する条例" },
  { number: "第24号", name: "葉山町家庭的保育事業等の設備及び運営に関する基準を定める条例の一部を改正する条例" },
  { number: "第25号", name: "工事請負契約の締結について（みそぎ橋橋梁補修工事（第一期））" },
  { number: "第26号", name: "工事請負契約の締結について（役場庁舎空調設備等改修工事）" },
  { number: "第27号", name: "財産の取得について（第6分団ポンプ自動車1台）" },
  { number: "第28号", name: "財産の取得について（塵芥収集車2台）" },
  { number: "第29号", name: "財産の取得について（小学校学習用コンピュータ等）" },
  { number: "第30号", name: "財産の取得について（中学校学習用コンピュータ等）" },
  { number: "第31号", name: "人権擁護委員の推薦について" },
  { number: "第32号", name: "令和7年度葉山町一般会計補正予算（第3号）" },
  { number: "議会議案第7-10号", name: "日米地位協定の抜本改定を求める意見書" },
  { number: "議会議案第7-11号", name: "教職員定数改善の推進及び教育予算の拡充を求める意見書" },
  { number: "議会議案第7-12号", name: "マイナ保険証の有無に関わらず、国民健康保険加入者全員に資格確認書を発行することを求める意見書" },
  { number: "請願第7-1号", name: "教職員定数改善の推進および教育予算の拡充を求める2026年度政府予算についての請願書" },
  { number: "陳情第7-14号", name: "日米地位協定の抜本改定を求める意見書を国に提出することを求める陳情" },
  { number: "陳情第7-15号", name: "マイナ保険証の有無にかかわらず、国民健康保険加入者全員に資格確認書を発行することを求める陳情" },
  { number: "陳情第7-16号", name: "マイナ保険証の有無にかかわらず、国保加入者全員に資格確認書を発行する手続きを、行わせるための対応を求める意見書を国に対して提出することを求める陳情" },
  { number: "陳情第7-17号", name: "株式会社三嘉を事業者とする有限会社新世工業による下山口茅木山の大規模な造成工事に関する陳情書" },
  { number: "陳情第7-18号", name: "非常時における医療用ポータブル電源への助成を求める陳情書" },
  { number: "陳情第7-19号", name: "真名瀬駐車場使用料の住民への夏季期間減免又は補助を求める陳情" },
  { number: "陳情第7-20号", name: "トゥモローランドのホテル建設事業に関連する町道240号線の通行止め工事延期の陳情" },
];

// 12月定例会議の議案（会議録12月1日分の日程・採決記録より）
const DEC_BILLS: Array<{
  number: string;
  name: string;
  result: string | null;
  count: number | null;
}> = [
  { number: "議案第50号", name: "令和7年度葉山町一般会計補正予算（第6号）", result: "可決", count: 12 },
  { number: "議案第51号", name: "令和7年度葉山町国民健康保険特別会計補正予算（第3号）", result: "可決", count: 13 },
  { number: "議案第52号", name: "令和7年度葉山町後期高齢者医療特別会計補正予算（第2号）", result: "可決", count: 13 },
  { number: "議案第53号", name: "令和7年度葉山町介護保険特別会計補正予算（第2号）", result: "可決", count: 13 },
  { number: "議案第54号", name: "令和7年度葉山町下水道事業会計補正予算（第2号）", result: "可決", count: 13 },
  { number: "議案第55号", name: "葉山町職員定数条例の一部を改正する条例", result: "可決", count: 13 },
  { number: "議案第56号", name: "葉山町一般職の職員の給与等に関する条例の一部を改正する条例", result: "可決", count: 13 },
  { number: "議案第57号", name: "葉山町特別職の職員の給与等に関する条例の一部を改正する条例", result: "可決", count: 12 },
  { number: "議案第58号", name: "葉山町一般職の任期付職員の採用等に関する条例の一部を改正する条例", result: "可決", count: 13 },
  { number: "議案第59号", name: "葉山町特定教育保育施設及び特定地域型保育事業の運営に関する基準を求める条例の一部を改正する条例", result: "可決", count: 13 },
  { number: "議案第60号", name: "葉山町家庭的保育事業等の設備及び運営に関する基準を定める条例の一部を改正する条例", result: "可決", count: 13 },
  { number: "議案第61号", name: "放課後児童健全育成事業の設備及び運営に関する基準を定める条例の一部を改正する条例", result: "可決", count: 13 },
  { number: "議案第62号", name: "葉山町火災予防条例の一部を改正する条例", result: null, count: null },
  { number: "議案第63号", name: "固定資産評価審査委員会委員の選任について", result: "同意", count: 13 },
  { number: "議案第64号", name: "固定資産評価審査委員会委員の選任について", result: "同意", count: 13 },
  { number: "議案第65号", name: "固定資産評価審査委員会委員の選任について", result: "同意", count: 13 },
  { number: "議会議案第7-16号", name: "葉山町議会の議員の報酬及び費用弁償等に関する条例の一部を改正する条例", result: "可決", count: 12 },
];

type JuneVoteRow = {
  bill_number: string;
  result: string;
  votes: Record<string, { vote: string; debated?: boolean }>;
};

type StanceMap = Record<string, string[]>;

function statusNoteFor(result: string, count: number | null): string | null {
  if (!result || count == null) return result;
  // 表決権者は13名（議長を除く）。13名=全員、12名以下=多数
  const detail = count >= 13 ? `起立${count}名の全員` : `起立${count}名の多数`;
  return `${result}（${detail}）`;
}

export async function seedHayamaCouncilData(supabase: AdminClient) {
  // --- 議員名簿 ---
  console.log("🏛️  Inserting Hayama council members...");
  const { data: members, error: membersError } = await supabase
    .from("council_members")
    .insert([...HAYAMA_MEMBERS])
    .select("id, name");
  if (membersError || !members) {
    throw new Error(`Failed to insert council members: ${membersError?.message}`);
  }
  const memberIdByName = new Map(members.map((m) => [m.name, m.id]));
  console.log(`✅ Inserted ${members.length} council members`);

  // --- 会期 ---
  console.log("🏛️  Inserting Hayama diet sessions...");
  const { data: sessions, error: sessionsError } = await supabase
    .from("diet_sessions")
    .insert([JUNE_SESSION, DEC_SESSION])
    .select("id, slug");
  if (sessionsError || !sessions) {
    throw new Error(`Failed to insert Hayama sessions: ${sessionsError?.message}`);
  }
  const sessionIdBySlug = new Map(sessions.map((s) => [s.slug, s.id]));

  // --- 議案 ---
  const billRows = [
    ...JUNE_BILLS.map((b) => {
      const vote = (juneVotes as JuneVoteRow[]).find(
        (v) => v.bill_number === b.number
      );
      return {
        diet_session_id: sessionIdBySlug.get(JUNE_SESSION.slug),
        name: `${b.number} ${b.name}`,
        originating_house: "HR" as const,
        status: "enacted" as const,
        status_note: vote?.result ?? null,
        publish_status: "published" as const,
        is_review_completed: true,
      };
    }),
    ...DEC_BILLS.map((b) => ({
      diet_session_id: sessionIdBySlug.get(DEC_SESSION.slug),
      name: `${b.number} ${b.name}`,
      originating_house: "HR" as const,
      status: (b.result ? "enacted" : "introduced") as "enacted" | "introduced",
      status_note:
        b.result && b.count != null
          ? statusNoteFor(b.result, b.count)
          : b.result,
      publish_status: "published" as const,
      is_review_completed: true,
    })),
  ];
  console.log("📄 Inserting Hayama bills...");
  const { data: bills, error: billsError } = await supabase
    .from("bills")
    .insert(billRows)
    .select("id, name");
  if (billsError || !bills) {
    throw new Error(`Failed to insert Hayama bills: ${billsError?.message}`);
  }
  console.log(`✅ Inserted ${bills.length} Hayama bills`);
  const billIdByName = new Map(bills.map((b) => [b.name, b.id]));

  // --- 6月分の議員別賛否 ---
  console.log("🗳️  Inserting June bill votes...");
  const voteRows: Array<{
    bill_id: string;
    council_member_id: string;
    vote: string;
    debated: boolean;
  }> = [];
  for (const row of juneVotes as JuneVoteRow[]) {
    // PDF側は「議案第20号」、seed議案名は「第20号」で保存するので正規化して突合
    const normalizedNumber = row.bill_number.replace(/^議案第/, "第");
    const juneBill = JUNE_BILLS.find((b) => b.number === normalizedNumber);
    if (!juneBill) continue;
    const billId = billIdByName.get(`${juneBill.number} ${juneBill.name}`);
    if (!billId) continue;
    for (const [memberName, v] of Object.entries(row.votes)) {
      const memberId = memberIdByName.get(memberName);
      if (!memberId) continue;
      voteRows.push({
        bill_id: billId,
        council_member_id: memberId,
        vote: v.vote,
        debated: v.debated ?? false,
      });
    }
  }
  const { error: votesError } = await supabase.from("bill_votes").insert(voteRows);
  if (votesError) {
    throw new Error(`Failed to insert bill votes: ${votesError.message}`);
  }
  console.log(`✅ Inserted ${voteRows.length} bill votes`);

  // --- 12月分の討論 ---
  // hayama-stances-r7-12.json: { 議員名: [発言全文...] }（会議録より抽出）
  console.log("🎤 Inserting December debates...");
  const stanceList = stances as StanceMap;
  const debatePlan: Array<{
    billNumber: string;
    stance: "for" | "against";
    speaker: string;
    index: number;
  }> = [
    { billNumber: "議案第50号", stance: "against", speaker: "笹本貢史", index: 0 },
    { billNumber: "議案第57号", stance: "against", speaker: "笹本貢史", index: 1 },
    { billNumber: "議会議案第7-16号", stance: "against", speaker: "笹本貢史", index: 2 },
    { billNumber: "議会議案第7-16号", stance: "for", speaker: "近藤昇一", index: 0 },
    { billNumber: "議会議案第7-16号", stance: "for", speaker: "笠原俊一", index: 0 },
    { billNumber: "議会議案第7-16号", stance: "for", speaker: "三浦大輝", index: 0 },
  ];
  const debateRows = debatePlan.map((d) => {
    const decBill = DEC_BILLS.find((b) => b.number === d.billNumber);
    const billId = billIdByName.get(`${decBill?.number} ${decBill?.name}`);
    if (!billId) {
      throw new Error(`Hayama seed: bill not found for ${d.billNumber}`);
    }
    const content = stanceList[d.speaker]?.[d.index];
    if (!content) {
      throw new Error(`Hayama seed: stance text not found for ${d.speaker}[${d.index}]`);
    }
    return {
      bill_id: billId,
      council_member_id: memberIdByName.get(d.speaker) ?? null,
      speaker_name: d.speaker,
      stance: d.stance,
      content,
      source_url: DEC_SESSION.shugiin_url,
    };
  });
  const { error: debatesError } = await supabase.from("bill_debates").insert(debateRows);
  if (debatesError) {
    throw new Error(`Failed to insert bill debates: ${debatesError.message}`);
  }
  console.log(`✅ Inserted ${debateRows.length} bill debates`);

  return { billIdByName, memberIdByName };
}
