import { HomeAuthCta } from "./home-auth-cta";

export default function Home() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <div className="eo-reveal pointer-events-none absolute inset-x-0 top-24 mx-auto h-64 max-w-lg rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.22),transparent_70%)] blur-2xl" />

      <p className="eo-reveal eo-meta">Freelancer Export Ops</p>
      <h1 className="eo-reveal eo-reveal-delay-1 eo-font-display mt-3 text-5xl font-bold tracking-tight text-[var(--eo-ink)] sm:text-6xl">
        ExportOps
      </h1>
      <p className="eo-reveal eo-reveal-delay-2 mt-4 max-w-md text-base leading-relaxed text-[var(--eo-muted)]">
        Runway vs tope Monotributo. Cargá ingresos en USD/EUR y mirá el
        acumulado 12 meses.
      </p>
      <HomeAuthCta />
    </main>
  );
}
