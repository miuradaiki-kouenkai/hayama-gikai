"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/** ヘッダー用のライト/ダーク切替ボタン。 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "ライトモードにする" : "ダークモードにする"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
