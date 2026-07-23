import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
        Freelancer Export Ops
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">ExportOps</h1>
      <p className="max-w-md text-base text-zinc-600">
        Runway vs tope Monotributo. Cargá ingresos en USD/EUR y mirá el acumulado 12 meses.
      </p>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="redirect" forceRedirectUrl="/app">
            <button
              type="button"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Entrar
            </button>
          </SignInButton>
          <SignUpButton mode="redirect" forceRedirectUrl="/app">
            <button
              type="button"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Crear cuenta
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/app"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Ir al cockpit
          </Link>
        </Show>
      </div>
    </main>
  );
}
