import "server-only";
import { findAllDietSessions } from "../repositories/diet-session-repository";

/** 定例会の一覧ページ用の会期一覧を取得する。 */
export async function getDietSessions() {
  return findAllDietSessions();
}
