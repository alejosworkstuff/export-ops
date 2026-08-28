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

## Cómo funciona el cálculo

- Cada cobro USD/EUR se convierte a ARS usando el tipo vendedor BNA del día
	calendario argentino. La fecha se normaliza antes de persistirla para evitar
	desplazamientos por zona horaria o DST.
- USD usa la serie histórica cuando existe y puede caer al valor actual para el
	día presente. EUR no tiene una serie histórica pública en esta integración:
	para fechas históricas se permite pegar manualmente la cotización y también se
	cachean los valores por moneda y día.
- El runway suma los últimos 12 meses calendario y lo compara con el tope de
	categoría declarado por el usuario. Sin tope configurado, el porcentaje se
	considera `null` y no se muestra como un valor engañoso.
- Las alertas se disparan inclusivamente al 80% y 95%, además de la ventana
	previa a las recategorizaciones del 1 de enero y el 1 de julio. Los eventos
	son idempotentes y una restricción única absorbe carreras entre requests.
- Al cambiar categoría o tope se limpian las alertas de techo para que los
	umbrales vuelvan a evaluarse contra el nuevo baseline. La prioridad visual es
	crítico, advertencia y luego recategorización.
- El endpoint de health registra detalles de DB/driver solo del lado servidor;
	nunca los devuelve al cliente. El seed de demo deja el runway cerca del 82%
	para probar el banner del 80%.

La aplicación es una ayuda de seguimiento personal: los topes son snapshots
declarados por el usuario, no una consulta automática a ARCA, y no reemplaza
asesoramiento fiscal.

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
