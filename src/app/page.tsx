import { HomeAuthCta } from "./home-auth-cta";

const STEPS = [
  {
    n: "01",
    title: "Cargá el cobro",
    body: "USD o EUR, con la fecha del movimiento. Sin planillas obligatorias.",
  },
  {
    n: "02",
    title: "Conversión BNA",
    body: "Se convierte al tipo vendedor del día y suma al acumulado de 12 meses.",
  },
  {
    n: "03",
    title: "Tope a la vista",
    body: "Ves qué % del tope usaste y cuántos días faltan a enero o julio.",
  },
  {
    n: "04",
    title: "Alertas a tiempo",
    body: "Te avisamos en pantalla al 80% y 95%, y cuando se acerca la recategorización.",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Hero: one composition: brand, headline, support, CTA, product visual */}
      <section className="relative overflow-hidden px-6 pb-16 pt-14 sm:pb-24 sm:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 420px at 12% 0%, rgba(13,148,136,0.22), transparent 55%), radial-gradient(700px 380px at 88% 18%, rgba(14,165,233,0.14), transparent 50%)",
          }}
        />

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="text-left">
            <p className="eo-reveal eo-meta">Freelancer Export Ops · Argentina</p>
            <h1 className="eo-reveal eo-reveal-delay-1 eo-font-display mt-3 text-5xl font-bold tracking-tight text-[var(--eo-ink)] sm:text-6xl lg:text-7xl">
              ExportOps
            </h1>
            <p className="eo-reveal eo-reveal-delay-2 mt-5 max-w-xl text-xl font-medium leading-snug text-[var(--eo-ink)] sm:text-2xl">
              Sabé cuánto te queda de categoría antes de facturar de más.
            </p>
            <p className="eo-reveal eo-reveal-delay-2 mt-4 max-w-lg text-base leading-relaxed text-[var(--eo-muted)]">
              Registrá cobros en dólares, convertí al oficial BNA y mirá tu
              acumulado de 12 meses. Alertas al 80% y al 95%. Sin certificado
              digital. Sin ARCA.
            </p>
            <HomeAuthCta className="eo-reveal eo-reveal-delay-3 mt-8 flex flex-wrap items-center gap-3" />
          </div>

          {/* Product visual: runway snapshot, not a card collage */}
          <div
            className="eo-reveal eo-reveal-delay-2 relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
            aria-hidden
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.2),transparent_60%)] blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--eo-line)] bg-white/80 p-6 shadow-[var(--eo-shadow)] backdrop-blur-md sm:p-8">
              <p className="eo-meta">Acumulado últimos 12 meses</p>
              <p className="eo-stat mt-2 text-4xl sm:text-5xl">82%</p>
              <p className="mt-1 text-sm text-[var(--eo-muted)]">
                del tope · categoría de ejemplo
              </p>
              <div className="eo-progress-track mt-6">
                <div
                  className="eo-progress-fill eo-progress-fill--warn"
                  style={{ width: "82%" }}
                />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--eo-line)] pt-5 text-sm">
                <div>
                  <p className="eo-meta">Acumulado</p>
                  <p className="eo-stat mt-1 text-lg">$ 7.2M</p>
                </div>
                <div>
                  <p className="eo-meta">Próxima recategorización</p>
                  <p className="eo-stat mt-1 text-lg">1 ene</p>
                </div>
              </div>
              <p className="mt-5 rounded-xl bg-[var(--eo-warn-soft)] px-3 py-2 text-xs font-medium text-[var(--eo-warn)]">
                Alerta 80% activa: estás cerca del techo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Para quién */}
      <section className="border-t border-[var(--eo-line)] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eo-meta">Para quién</p>
          <h2 className="eo-font-display mt-3 text-3xl font-bold tracking-tight text-[var(--eo-ink)] sm:text-4xl">
            Freelancers que exportan y cobran afuera
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--eo-muted)] sm:text-lg">
            Programación, diseño, consulting: Wise, Payoneer, Deel. Una sola
            cosa: ver cuánto te queda de categoría. No es un facturador.
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section
        id="como-funciona"
        className="scroll-mt-24 border-t border-[var(--eo-line)] px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eo-meta">Cómo funciona</p>
            <h2 className="eo-font-display mt-3 text-3xl font-bold tracking-tight text-[var(--eo-ink)] sm:text-4xl">
              Cuatro pasos. Sin ARCA.
            </h2>
            <p className="mt-3 text-base text-[var(--eo-muted)]">
              Cargás los ingresos, ves el techo de categoría y te avisamos
              antes de pasarte.
            </p>
          </div>

          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step) => (
              <li key={step.n} className="text-left">
                <span className="eo-font-display text-sm font-bold tracking-widest text-[var(--eo-accent)]">
                  {step.n}
                </span>
                <h3 className="eo-font-display mt-2 text-lg font-semibold text-[var(--eo-ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--eo-muted)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer disclaimer */}
      <footer className="mt-auto border-t border-[var(--eo-line)] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eo-brand text-lg">ExportOps</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--eo-muted)]">
              No somos contadores ni reemplazamos ARCA. Los topes los cargás vos
              según la tabla vigente. Consultá siempre a tu contador.
            </p>
          </div>
          <p className="text-xs text-[var(--eo-muted)]">
            No emite Factura E ni CAE
          </p>
        </div>
      </footer>
    </div>
  );
}
