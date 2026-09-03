"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AskAiPanel } from "./ask-ai-panel";

interface AskAiFloatProps {
  billName: string;
  summary?: string | null;
  statusNote?: string | null;
  pageUrl: string;
}

/**
 * 議案詳細のフローティング「AIに質問する」ボタンと右パネル。
 * 元チャット欄と同じオーバーレイ配置で、主列のレイアウトには触らない。
 */
export function AskAiFloat({
  billName,
  summary,
  statusNote,
  pageUrl,
}: AskAiFloatProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div className="fixed max-w-[460px] mx-auto left-6 right-6 bottom-4 z-50 md:bottom-8 flex justify-center">
        <div className="relative rounded-[50px] bg-gradient-to-tr from-mirai-gradient-start to-mirai-gradient-end p-[2px] shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)] flex w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(true)}
            className="relative bg-white rounded-[50px] hover:opacity-90 flex items-center w-full h-14 justify-end pr-4 pl-6 gap-2.5"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            <span className="text-mirai-text-placeholder text-sm font-medium leading-[1.5em] tracking-[0.01em] flex-1 text-left">
              わからないことをAIに質問する
            </span>
            <span className="relative w-10 h-10 rounded-[20px] bg-mirai-gradient flex items-center justify-center flex-shrink-0">
              <Image
                src="/icons/chat-button-icon.svg"
                alt=""
                width={40}
                height={40}
                className="pointer-events-none"
              />
            </span>
          </Button>
        </div>
      </div>

      {isOpen && (
        <section
          aria-label="この議案をAIに聞く"
          className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-md rounded-t-2xl flex flex-col max-h-[85dvh] overflow-y-auto md:bottom-4 md:right-4 md:left-auto md:w-[450px] md:rounded-2xl md:max-h-[80vh] p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-black">この議案をAIに聞く</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="閉じる"
            >
              <X className="h-4 w-4" aria-hidden />
              閉じる
            </Button>
          </div>
          <AskAiPanel
            billName={billName}
            summary={summary}
            statusNote={statusNote}
            pageUrl={pageUrl}
            hideHeading
          />
        </section>
      )}
    </>
  );
}
