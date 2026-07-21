# ExportOps

**Freelancer Export Ops Cockpit (Argentina).** Registrá cobros en dólares, convertí al oficial BNA y mirá tu acumulado de 12 meses contra el tope de tu categoría — con alertas antes de la recategorización de enero/julio.

> Sabé cuánto te queda de categoría antes de facturar de más.

## Qué es

Un cockpit mínimo para freelancers y contractors argentinos que exportan servicios y cobran afuera (Wise, Payoneer, Deel):

- **Ledger de ingresos:** cargás el cobro (USD/EUR) y la fecha; se convierte a ARS al tipo vendedor BNA del día.
- **Runway fiscal:** acumulado rolling de 12 meses, % del tope de tu categoría, countdown a la próxima recategorización (1 ene / 1 jul).
- **Clientes:** quién paga, en qué moneda, por qué canal.
- **Alertas:** aviso al 80% y al 95% del tope.

Una sola cosa: runway fiscal visible. No es un facturador.

## Qué NO es (anti-scope, v1)

- ❌ **No emite Factura E ni CAE.** Cero integración con ARCA/webservices.
- ❌ No asesora sobre liquidación de divisas (BCRA/PSP).
- ❌ No hace contabilidad ni DDJJ.
- ❌ No es app móvil nativa ni marketplace.
- ❌ No maneja datos clínicos ni multi-tenant para contadores.

> **Disclaimer:** No somos contadores ni reemplazamos ARCA. Los topes los cargás vos según la tabla vigente. Consultá siempre a tu contador.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://prisma.io) + PostgreSQL ([Neon](https://neon.tech))
- [Clerk](https://clerk.com) para auth
- Deploy en [Vercel](https://vercel.com)

## Setup

```bash
npm install
cp .env.example .env   # completá DATABASE_URL (Neon) y las keys de Clerk
npx prisma migrate dev
npm run dev
```

App en [http://localhost:3000](http://localhost:3000).

## Status

En construcción — MVP con alcance congelado (4 semanas, sesiones acotadas). El scope de v1 no se amplía.
