import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureLocalUser } from "@/lib/ensure-local-user";

export async function requireLocalUser(): Promise<
  | { ok: true; user: { id: string } }
  | { ok: false; error: string }
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { ok: false, error: "No autenticado" };
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { ok: false, error: "Usuario sin email" };
  }

  const user = await ensureLocalUser(clerkId, email);
  return { ok: true, user };
}
