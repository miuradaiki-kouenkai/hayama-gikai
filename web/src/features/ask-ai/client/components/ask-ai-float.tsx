"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AskAiPanel } from "./ask-ai-panel";

interface AskAiFloatProps {
  billName: string;
  summary?: string | null;
  statusNote?: string | null;
  pageUrl: string;
}

/**
 * 議案詳細のフローティング「AIに質問する」ボタン。
 * 内蔵チャットの代わりに、外部AIへの導線ダイアログを開く。
 */
export function AskAiFloat({
  billName,
  summary,
  statusNote,
  pageUrl,
}: AskAiFloatProps) {
  const [isOpen, setIsOpen] = useState(false);

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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-left">
              <Sparkles className="h-5 w-5 text-primary-accent" aria-hidden />
              この議案をAIに聞く
            </DialogTitle>
          </DialogHeader>
          <AskAiPanel
            billName={billName}
            summary={summary}
            statusNote={statusNote}
            pageUrl={pageUrl}
            hideHeading
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
