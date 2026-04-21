# Log - Scaffold app base

Fecha: 2026-04-21
Bloque: scaffold tecnico inicial de la app web local-first

## Objetivo
Dejar Market Pulse funcionando localmente con un scaffold real basado en `Next.js`, `TypeScript`, `Tailwind`, `Prisma` y `SQLite`, sin meternos todavia en la logica de negocio profunda.

## Lo creado
- Scaffold base de `Next.js` con App Router en la raiz del repo.
- Configuracion de `TypeScript`, `Tailwind CSS`, `PostCSS` y `ESLint`.
- Configuracion de `Prisma` con `SQLite` local.
- Cliente Prisma reusable en `src/lib/prisma.ts`.
- Layout general con sidebar, header y contenedor principal.
- Navegacion principal para:
  - Dashboard
  - Proyectos
  - Publicaciones
  - Cambios
  - Importaciones
  - Competencia
  - Oportunidades
  - Configuracion
- Componentes UI simples para encabezados, tarjetas y tablas de preview.
- Actualizacion de `README.md`, `PLAN.md` y `ARCHITECTURE.md` para reflejar el nuevo estado del repo.

## Decisiones tomadas
- Se uso `npm` como flujo operativo verificado porque `pnpm` no estaba instalado en este entorno.
- Se mantuvo una UI sobria, desktop-first y orientada a tablas, lectura y operacion, evitando una demo recargada.
- Se definio un esquema Prisma inicial alineado al dominio esperado, pero sin implementar todavia CRUD ni heuristicas causales profundas.
- Se priorizo una estructura simple con `src/app`, `src/components`, `src/lib` y `prisma/`, evitando capas innecesarias.
- Se mantuvo competencia como modulo complementario y no como centro del scaffold.
- Se reemplazo el `db:push` directo de Prisma por un bootstrap local compatible con este entorno, generando SQL desde el esquema Prisma y aplicandolo sobre SQLite con `node:sqlite`.

## Como correr la app
```bash
npm install
npm run db:push
npm run dev
```

Abrir despues:

```text
http://localhost:3000
```

## Verificaciones realizadas
- `npm install`: OK
- `prisma generate` por `postinstall`: OK
- `npm run db:push`: OK
- creacion de `data/market-pulse.db`: OK
- `npm run lint`: OK
- `npm run build`: OK
- arranque de `npm run dev`: OK

## Observacion de verificacion local
Durante la comprobacion de `npm run dev`, el puerto `3000` ya estaba ocupado en esta maquina y Next.js levanto automaticamente en `http://localhost:3001`.

La app igualmente arranco sin errores. Si el puerto `3000` esta libre, el comportamiento esperado sigue siendo abrir en `http://localhost:3000`.

## Limites conocidos al cerrar este bloque
- No hay CRUD real todavia.
- No hay importacion CSV implementada.
- No hay timeline causal ni insights heurísticos reales.
- Las paginas usan contenido base y placeholders operativos.

## Que queda listo para el siguiente bloque
- Afinar el modelo del nucleo causal.
- Implementar CRUD de proyectos y publicaciones.
- Empezar el registro real de cambios operativos.
- Preparar el flujo de snapshots metricos e importacion CSV.
