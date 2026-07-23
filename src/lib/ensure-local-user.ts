import { prisma } from "@/lib/db";

/** Upsert local User on first authenticated visit (Clerk → Postgres bridge). */
export async function ensureLocalUser(clerkId: string, email: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email },
    create: { clerkId, email },
  });
}
