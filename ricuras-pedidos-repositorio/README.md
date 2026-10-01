# Sistema de Pedidos en Línea — Ricuras Colombianas

Proyecto final de Metodología y Diseño de Sistemas II (UNADECA). Continúa el DEDS entregado en Metodología y Diseño de Sistemas I.

**Stack:** React · Node.js/Express · PostgreSQL · Socket.IO · Stripe (modo prueba) · Jest · Supertest · Playwright.

## Puesta en marcha
```bash
docker compose up -d                  # PostgreSQL local
cd backend && cp .env.example .env
npm install && npm test               # prueba de humo + pruebas de pagos
npm run dev                           # API en http://localhost:3000/api/health
cd ../frontend && npm install && npm run dev
```

## Ramas
`main` (estable) · `develop` (integración) · `feature/RFxx-descripcion`

## Estructura
- `backend/src/modules/`: siete módulos (auth, catalogo, carrito, pedidos, pagos, notificaciones, panel)
- `backend/tests/`: unit, integration y sandbox (pasarela)
- `frontend/`: interfaz mobile-first
- `e2e/`: pruebas de sistema
- `docs/`: DEDS, Plan de Pruebas y backlog
