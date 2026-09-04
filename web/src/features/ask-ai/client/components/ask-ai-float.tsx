"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AskAiPanel } from "./ask-ai-panel";

interface AskAiFloatProps {
  billName: string;
  summary?: string | null;
  statusNote?: string | null;
  pageUrl: string;
}

/**
 * 議案詳細の右パネル（常設）。元チャット欄と同じオーバーレイ配置で、
 * 主列のレイアウトには触らない。モバイルでは別途インライン表示する。
 */
export function AskAiFloat({
  billName,
  summary,
  statusNote,
  pageUrl,
}: AskAiFloatProps) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <section
      aria-label="この議案をAIに聞く"
      className="hidden md:flex fixed bottom-4 right-4 z-50 w-[450px] max-h-[80vh] overflow-y-auto bg-card shadow-md rounded-2xl flex-col p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-mirai-text">
          この議案をAIに聞く
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          aria-label="閉じる"
        >
          <X className="h-4 w-4" aria-hidden />
          閉じる
        </Button>
      </div>
      <div className="mt-3">
        <AskAiPanel
          billName={billName}
          summary={summary}
          statusNote={statusNote}
          pageUrl={pageUrl}
          hideHeading
        />
      </div>
    </section>
  );
}
