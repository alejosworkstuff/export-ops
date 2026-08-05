# ExportOps

[![Vercel](https://img.shields.io/badge/live-Vercel-000000?logo=vercel&logoColor=white)](https://export-ops-jade.vercel.app)

**ARG freelancer export runway.** Track USD/EUR payouts against your Monotributo category ceiling before you invoice too much.

> Sabé cuánto te queda de categoría antes de facturar de más.

**Live:** [export-ops-jade.vercel.app](https://export-ops-jade.vercel.app)

Registrá cobros en dólares, convertí al oficial BNA y mirá tu acumulado de 12 meses contra el tope de tu categoría, con alertas antes de la recategorización de enero/julio.

## Qué es

Cockpit mínimo para freelancers y contractors argentinos que exportan servicios y cobran afuera (Wise, Payoneer, Deel u otros canales):

| Pieza | Qué hace |
| --- | --- |
| **Ledger** | Cobro USD/EUR + fecha → ARS al tipo vendedor BNA del día |
| **Runway** | Rolling 12 meses, % del tope, countdown a 1 ene / 1 jul |
| **Clientes** | Quién paga, moneda, canal |
| **Alertas** | In-app al 80% / 95% del tope + ventana de recategorización |

Una sola cosa: **runway fiscal visible**. No es un facturador ni reemplazo de ARCA/contador.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Prisma + PostgreSQL (Neon)
- Clerk auth
- Deploy en Vercel
- FX: tipo vendedor BNA del día

## Screenshots

### Landing

![Landing ExportOps](./screenshots/export-ops-landing.png)

### Ledger

![Ledger ExportOps](./screenshots/export-ops-ledger.png)

### Clientes

![Clientes ExportOps](./screenshots/export-ops-client-page.png)

## Setup local

```bash
npm install
cp .env.example .env
# DATABASE_URL (Neon) + keys de Clerk
npx prisma migrate dev
npm run db:seed   # opcional, demo con runway cargado
npm run dev
```

App en [http://localhost:3000](http://localhost:3000). Variables: [`.env.example`](./.env.example).

Proyecto de portafolio. Código personal; no es consejo fiscal ni producto comercial.
