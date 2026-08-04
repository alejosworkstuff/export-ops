import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import type { MonoCategory } from "@/generated/prisma/enums";
import {
  evaluateAndPersistAlerts,
  getActiveAlerts,
  type ActiveAlert,
} from "@/lib/alerts";
import { ensureLocalUser } from "@/lib/ensure-local-user";
import { sumRolling12MonthsArs } from "@/lib/income-rollup";
import { monthlyRolling12MonthsArs } from "@/lib/monthly-rollup";
import { nextRecategorization } from "@/lib/recategorization";
import { computeRunway } from "@/lib/runway";
import { AlertsBanner } from "./alerts-banner";
import { CategorySettingsForm } from "./category-settings-form";
import { MonthlyChart } from "./monthly-chart";
import { RecategorizationCountdownSection } from "./recategorization-countdown";
import { RunwayCard } from "./runway-card";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

  let defaults: {
    category: MonoCategory;
    categoryCeilingArs: string;
  } = {
    category: "A",
    categoryCeilingArs: "",
  };

  let category: MonoCategory = "A";
  let runway = computeRunway(
    new Prisma.Decimal(0),
    new Prisma.Decimal(0),
  );
  let monthlyPoints: Awaited<ReturnType<typeof monthlyRolling12MonthsArs>> =
    [];
  let activeAlerts: ActiveAlert[] = [];

  if (clerkId && email) {
    const user = await ensureLocalUser(clerkId, email);
    const ceiling = Number(user.categoryCeilingArs);
    defaults = {
      category: user.category,
      categoryCeilingArs:
        ceiling > 0 ? user.categoryCeilingArs.toFixed(2) : "",
    };
    category = user.category;

    // Persist any newly crossed thresholds / window (idempotent), then load banner.
    await evaluateAndPersistAlerts(user.id);
    const [accumulated, monthly, alerts] = await Promise.all([
      sumRolling12MonthsArs(user.id),
      monthlyRolling12MonthsArs(user.id),
      getActiveAlerts(user.id),
    ]);
    runway = computeRunway(accumulated, user.categoryCeilingArs);
    monthlyPoints = monthly;
    activeAlerts = alerts;
  }

  const countdown = nextRecategorization();

  return (
    <div className="space-y-6">
      <div className="eo-reveal space-y-2">
        <h1 className="eo-font-display text-3xl font-bold tracking-tight text-[var(--eo-ink)] sm:text-4xl">
          Resumen
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--eo-muted)]">
          Tu tope, el acumulado de 12 meses, la próxima recategorización y el
          gráfico mensual.
        </p>
      </div>

      {activeAlerts.length > 0 ? (
        <div className="eo-reveal eo-reveal-delay-1">
          <AlertsBanner alerts={activeAlerts} />
        </div>
      ) : null}

      <div className="eo-reveal eo-reveal-delay-1">
        <CategorySettingsForm defaults={defaults} />
      </div>
      <div className="eo-reveal eo-reveal-delay-2">
        <RunwayCard category={category} runway={runway} />
      </div>
      <div className="eo-reveal eo-reveal-delay-3">
        <RecategorizationCountdownSection countdown={countdown} />
      </div>
      <div className="eo-reveal eo-reveal-delay-4">
        <MonthlyChart points={monthlyPoints} />
      </div>
    </div>
  );
}
