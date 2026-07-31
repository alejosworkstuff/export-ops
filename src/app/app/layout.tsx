import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ensureLocalUser } from "@/lib/ensure-local-user";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/ingresos", label: "Ingresos" },
  { href: "/app/clientes", label: "Clientes" },
] as const;

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  if (clerkUser && email) {
    await ensureLocalUser(clerkUser.id, email);
  }

  return (
    <div className="eo-shell">
      <header className="eo-header">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-5">
            <Link href="/app" className="eo-brand text-lg">
              ExportOps
            </Link>
            <nav className="flex items-center gap-0.5">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="eo-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </div>
  );
}
