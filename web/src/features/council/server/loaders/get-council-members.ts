import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  findActiveCouncilMembers,
  findCouncilMemberById,
  findDebatesByMemberId,
  findVotesByMemberId,
} from "../repositories/council-repository";

export const getCouncilMembers = unstable_cache(
  async () => findActiveCouncilMembers(),
  ["council-members"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);

export const getCouncilMemberDetail = unstable_cache(
  async (id: string) => {
    const [member, votes, debates] = await Promise.all([
      findCouncilMemberById(id),
      findVotesByMemberId(id),
      findDebatesByMemberId(id),
    ]);
    if (!member) return null;
    return { member, votes, debates };
  },
  ["council-member-detail"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);
