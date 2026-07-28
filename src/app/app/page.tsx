import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma/client";
import type { MonoCategory } from "@/generated/prisma/enums";
import { ensureLocalUser } from "@/lib/ensure-local-user";
import { sumRolling12MonthsArs } from "@/lib/income-rollup";
import { monthlyRolling12MonthsArs } from "@/lib/monthly-rollup";
import { nextRecategorization } from "@/lib/recategorization";
import { computeRunway } from "@/lib/runway";
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

  if (clerkId && email) {
    const user = await ensureLocalUser(clerkId, email);
    const ceiling = Number(user.categoryCeilingArs);
    defaults = {
      category: user.category,
      categoryCeilingArs:
        ceiling > 0 ? user.categoryCeilingArs.toFixed(2) : "",
    };
    category = user.category;
    const [accumulated, monthly] = await Promise.all([
      sumRolling12MonthsArs(user.id),
      monthlyRolling12MonthsArs(user.id),
    ]);
    runway = computeRunway(accumulated, user.categoryCeilingArs);
    monthlyPoints = monthly;
  }

  const countdown = nextRecategorization();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-600">
          Tope declarado, runway 12 meses, countdown a recategorización y
          gráfico mensual.
        </p>
      </div>

      <CategorySettingsForm defaults={defaults} />
      <RunwayCard category={category} runway={runway} />
      <RecategorizationCountdownSection countdown={countdown} />
      <MonthlyChart points={monthlyPoints} />
    </div>
  );
}
