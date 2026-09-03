/**
 * 外部AIへの導線定義。質問文をURLパラメータに載せて開くだけで、
 * APIキーもサーバーも要らない（note記事の「AIに聞く」ボタン方式）。
 * URL仕様は各サービスの実測ベース。Geminiはプリフィル用パラメータが無いため
 * Google AIモードへ送る。
 */
export type AskAiProviderId =
  | "chatgpt"
  | "claude"
  | "aimode"
  | "perplexity"
  | "aistudio";

export type AskAiProvider = {
  id: AskAiProviderId;
  label: string;
  buildUrl: (encodedPrompt: string) => string;
};

export const ASK_AI_PROVIDERS: AskAiProvider[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    buildUrl: (prompt) => `https://chatgpt.com/?q=${prompt}`,
  },
  {
    id: "claude",
    label: "Claude",
    buildUrl: (prompt) => `https://claude.ai/new?q=${prompt}`,
  },
  {
    id: "aimode",
    label: "Google AIモード",
    buildUrl: (prompt) => `https://www.google.com/search?udm=50&q=${prompt}`,
  },
  {
    id: "perplexity",
    label: "Perplexity",
    buildUrl: (prompt) => `https://www.perplexity.ai/search?q=${prompt}`,
  },
  {
    id: "aistudio",
    label: "AI Studio",
    buildUrl: (prompt) =>
      `https://aistudio.google.com/prompts/new_chat?prompt=${prompt}`,
  },
];

/** プロンプト文をURLに載せられる形にする。 */
export function encodeAskPrompt(prompt: string): string {
  return encodeURIComponent(prompt);
}

/** プロンプト文から送信先URLを作る。 */
export function buildProviderUrl(
  provider: AskAiProvider,
  prompt: string
): string {
  return provider.buildUrl(encodeAskPrompt(prompt));
}
