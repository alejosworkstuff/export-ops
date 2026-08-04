"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export function HomeAuthCta() {
  return (
    <div className="eo-reveal eo-reveal-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
      <Show when="signed-out">
        <SignInButton mode="redirect" forceRedirectUrl="/app">
          <button type="button" className="eo-btn">
            Entrar
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/app">
          <button type="button" className="eo-btn-ghost">
            Crear cuenta
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href="/app" className="eo-btn">
          Ir al cockpit
        </Link>
      </Show>
    </div>
  );
}
