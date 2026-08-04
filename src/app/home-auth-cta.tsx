"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

type HomeAuthCtaProps = {
  className?: string;
};

export function HomeAuthCta({ className }: HomeAuthCtaProps) {
  return (
    <div
      className={
        className ??
        "eo-reveal eo-reveal-delay-3 mt-8 flex flex-wrap items-center gap-3"
      }
    >
      <Show when="signed-out">
        <SignUpButton mode="redirect" forceRedirectUrl="/app">
          <button type="button" className="eo-btn">
            Empezar gratis
          </button>
        </SignUpButton>
        <a href="#como-funciona" className="eo-btn-ghost">
          Ver cómo funciona
        </a>
        <SignInButton mode="redirect" forceRedirectUrl="/app">
          <button type="button" className="text-sm font-semibold text-[var(--eo-muted)] underline-offset-4 hover:text-[var(--eo-ink)] hover:underline">
            Ya tengo cuenta
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <Link href="/app" className="eo-btn">
          Entrar
        </Link>
        <a href="#como-funciona" className="eo-btn-ghost">
          Ver cómo funciona
        </a>
      </Show>
    </div>
  );
}
