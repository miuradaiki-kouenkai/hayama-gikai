/** 町サイト・議会中継の取得クライアント。相手サーバーへの配慮として直列取得する。 */
export class HayamaSiteClient {
  private readonly userAgent =
    "mirai-gikai-hayama-ingest/1.0 (+https://github.com/miuradaiki-kouenkai/hayama-gikai)";

  async fetchText(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: { "User-Agent": this.userAgent },
    });
    if (!response.ok) {
      throw new Error(`取得に失敗した (${response.status}): ${url}`);
    }
    return response.text();
  }

  /** 議会中継は Shift_JIS のため、バイト列で受けて UTF-8 に直す。 */
  async fetchShiftJisText(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: { "User-Agent": this.userAgent },
    });
    if (!response.ok) {
      throw new Error(`取得に失敗した (${response.status}): ${url}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return new TextDecoder("shift-jis").decode(buffer);
  }
}
