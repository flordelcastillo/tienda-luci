# Luci · Joyería (tienda + admin)

Ecommerce de joyas con panel de administración propio (inventario, pagos y carga de productos), integrado con **Mercado Pago**. Monolito Next.js pensado para self-host en **EC2**.

## Stack
- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** — paleta salvia / crema / oro (estética "soft UI" editorial)
- **Prisma 7 + PostgreSQL** (adapter `pg`)
- **Mercado Pago** Checkout Pro + webhook
- Auth admin propia con JWT (jose) + bcrypt

## Estructura
```
src/app
├── page.tsx              Home (storefront)
├── tienda/              Catálogo con filtros
├── producto/[slug]/     Detalle + compra (BuyBox)
├── checkout/            Éxito / error / pendiente / demo
├── admin/
│   ├── login/           Acceso admin
│   └── (dash)/          Panel protegido (sidebar)
│       ├── page.tsx     Dashboard (métricas, stock bajo, pedidos)
│       ├── productos/   Lista + carga/edición + imágenes
│       ├── inventario/  Ajuste de stock en vivo
│       └── pagos/       Pedidos, estados, detalle
└── api/
    ├── upload/          Subida de imágenes (public/uploads)
    ├── checkout/        Crea orden + preferencia MP
    └── mercadopago/webhook/  Actualiza pago + descuenta stock
```

## Desarrollo local

1. **Base de datos** (Postgres en Docker):
   ```bash
   docker run -d --name luci-pg -e POSTGRES_USER=luci -e POSTGRES_PASSWORD=luci \
     -e POSTGRES_DB=luci -p 5433:5432 postgres:16-alpine
   ```
2. **Variables** — ver `.env` (ya configurado para local). Completar `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY` con credenciales reales de Mercado Pago. Sin credenciales, el checkout entra en **modo demo** (`/checkout/demo`) para probar el flujo completo.
3. **Migrar + seed**:
   ```bash
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```
4. **Correr**:
   ```bash
   npm run dev
   ```

### Acceso admin
- URL: `/admin` → `/admin/login`
- Usuario seed: **admin@luci.com** / **admin1234** (cambiar en producción)

## Deploy en EC2 (resumen)
1. Instalar Node 20+, clonar repo, `npm ci`.
2. Postgres: instancia RDS o Postgres en la misma EC2. Setear `DATABASE_URL`.
3. `AUTH_SECRET`: generar uno largo aleatorio (`openssl rand -base64 48`).
4. `NEXT_PUBLIC_SITE_URL`: dominio público (necesario para back_urls y webhook de MP).
5. `npx prisma migrate deploy` && `npm run build` && `npm start` (bajo PM2/systemd).
6. Nginx como reverse proxy + certificado TLS (Let's Encrypt).
7. En el panel de Mercado Pago, configurar la URL de webhook: `https://TU_DOMINIO/api/mercadopago/webhook`.

> **Imágenes**: en dev se guardan en `public/uploads`. Para producción conviene migrar `src/app/api/upload/route.ts` a S3 (mismo contrato: devuelve `{ url }`).

## Datos: precios
Todos los precios se guardan en **centavos** (Int). Helpers en `src/lib/money.ts`.
# tienda-luci
