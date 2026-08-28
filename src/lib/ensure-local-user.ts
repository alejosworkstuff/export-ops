import { prisma } from "@/lib/db";

export async function ensureLocalUser(clerkId: string, email: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email },
    create: { clerkId, email },
  });
}
