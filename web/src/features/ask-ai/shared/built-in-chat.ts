/**
 * 内蔵AIチャットの有効・無効を返す。
 * 葉山町版は外部AIへの導線に置き換えるため、既定は無効。
 */
export function isBuiltInChatEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BUILT_IN_CHAT_ENABLED === "true";
}
