"use client";

import { Check, Copy, ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BILL_PRESET_QUESTIONS,
  buildAskPrompt,
} from "../../shared/build-ask-prompt";
import { ASK_AI_PROVIDERS, buildProviderUrl } from "../../shared/providers";

interface AskAiPanelProps {
  billName: string;
  summary?: string | null;
  statusNote?: string | null;
  pageUrl: string;
  /** ダイアログ内利用時は見出しを出さない */
  hideHeading?: boolean;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 議案詳細の「AIに聞く」パネル。
 * 内蔵チャットの代わりに、外部AIへの導線とコピペ用の質問文を出す。
 */
export function AskAiPanel({
  billName,
  summary,
  statusNote,
  pageUrl,
  hideHeading = false,
}: AskAiPanelProps) {
  const [question, setQuestion] = useState<string>(BILL_PRESET_QUESTIONS[0]);
  const [copied, setCopied] = useState(false);
  const prompt = buildAskPrompt({
    billName,
    summary,
    statusNote,
    pageUrl,
    question,
  });

  const openProvider = (providerId: string) => {
    const provider = ASK_AI_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;
    window.open(buildProviderUrl(provider, prompt), "_blank", "noopener");
  };

  const handleCopy = async () => {
    setCopied(await copyToClipboard(prompt));
  };

  return (
    <section aria-label="この議案をAIに聞く" className="flex flex-col gap-4">
      {!hideHeading && (
        <h2 className="text-[22px] font-bold text-black leading-[1.48] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-accent" aria-hidden />
          この議案をAIに聞く
        </h2>
      )}
      <p className="text-xs text-mirai-text-secondary">
        普段使っているAIを選ぶと、議案の情報と質問文が入った状態で開きます。自分でコピーして貼り付けることもできます。
      </p>

      <div className="flex flex-wrap gap-2">
        {BILL_PRESET_QUESTIONS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={preset === question ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setQuestion(preset);
              setCopied(false);
            }}
          >
            {preset}
          </Button>
        ))}
      </div>

      <label
        htmlFor="ask-ai-prompt"
        className="text-xs font-bold text-mirai-text-secondary"
      >
        送信される質問文
      </label>
      <textarea
        id="ask-ai-prompt"
        readOnly
        rows={8}
        value={prompt}
        onFocus={(event) => event.target.select()}
        className="w-full rounded-lg border border-mirai-border bg-white p-3 text-sm leading-relaxed text-black"
      />

      <div className="flex flex-wrap gap-2">
        {ASK_AI_PROVIDERS.map((provider) => (
          <Button
            key={provider.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openProvider(provider.id)}
          >
            {provider.label}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </Button>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="h-3 w-3" aria-hidden />
          ) : (
            <Copy className="h-3 w-3" aria-hidden />
          )}
          {copied ? "コピー済み" : "質問文をコピー"}
        </Button>
      </div>
    </section>
  );
}
