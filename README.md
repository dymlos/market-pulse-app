# Market Pulse

Market Pulse es una app web **local-first** para analisis operativo ecommerce, pensada primero para Mercado Libre.

La tesis del producto sigue siendo la misma:

> **No construir otra suite generica de market intelligence, sino una bitacora causal operativa que registre cambios, mida impacto y explique que probablemente paso, usando competencia y oportunidades como contexto.**

## Estado actual del repositorio
Esta iteracion deja funcionando la **app base en localhost** con:

- `Next.js` + `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite` local
- migracion inicial versionada
- seed demo realista para explorar el dominio
- layout general con sidebar, header y contenedor principal
- navegacion inicial para los modulos del MVP

Todavia no se implementa el CRUD completo ni la logica profunda del negocio. El objetivo de este bloque fue dejar una base clara, ejecutable y preparada para crecer sin sobreconstruccion.

## Stack elegido
- `Next.js` con App Router
- `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite`
- `npm` como flujo operativo disponible en este entorno

`pnpm` sigue siendo una opcion valida a futuro, pero en esta maquina el flujo verificado queda con `npm`.

## Modulos iniciales de navegacion
La app incluye paginas base para:

- Dashboard
- Proyectos
- Publicaciones
- Cambios
- Importaciones
- Competencia
- Oportunidades
- Configuracion

Estas paginas ya tienen estructura visual, copy alineado al producto y placeholders operativos para avanzar luego con CRUD, imports y timeline.

## Estructura principal
```text
.
|-- .logs/
|-- Documentación/
|-- data/
|-- prisma/
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed.mjs
|-- scripts/
|-- src/
|   |-- app/
|   |   |-- (workspace)/
|   |   `-- globals.css
|   |-- components/
|   |   |-- layout/
|   |   `-- ui/
|   |-- generated/
|   `-- lib/
|-- .env.example
|-- ARCHITECTURE.md
|-- AGENTS.md
|-- PLAN.md
|-- eslint.config.mjs
|-- next.config.ts
|-- package.json
|-- postcss.config.mjs
|-- tailwind.config.ts
`-- tsconfig.json
```

## Como correr la app
1. Instalar dependencias:

```bash
npm install
```

2. Generar Prisma Client:

```bash
npm run db:generate
```

3. Recrear la base local desde migraciones:

```bash
npm run db:reset
```

4. Cargar datos demo:

```bash
npm run db:seed
```

5. Levantar la app:

```bash
npm run dev
```

6. Abrir en:

```text
http://localhost:3000
```

## Flujo de base de datos
- `npm run db:push`: aplica migraciones versionadas pendientes sin borrar la base si ya esta alineada.
- `npm run db:reset`: recrea la SQLite local desde cero usando las migraciones versionadas.
- `npm run db:seed`: inserta datos demo del MVP.
- `npm run db:generate`: regenera el client de Prisma en `src/generated/prisma`.

Si venis de una base anterior del scaffold sin historial de migraciones, conviene usar `npm run db:reset` y despues `npm run db:seed`.

## Scripts disponibles
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:reset`
- `npm run db:seed`

## Persistencia local
La base de datos operativa se crea en:

```text
data/market-pulse.local.db
```

Tambien queda preservada la base previa del scaffold como referencia local:

```text
data/market-pulse.db
```

La idea sigue siendo local-first:

- datos en la misma PC
- sin dependencia obligatoria de APIs externas
- sin scraping masivo como base del MVP
- preparada para crecer despues a un deploy real si hiciera falta

## Datos demo incluidos
El seed actual crea:

- 1 proyecto demo
- 3 publicaciones propias
- 9 snapshots metricos
- 6 eventos de cambio
- 2 busquedas monitoreadas
- 3 competidores
- 2 snapshots de competencia con resultados observados
- 2 registros de importacion CSV
- 3 insights
- 2 senales de oportunidad

## Que sigue despues de este bloque
El siguiente bloque recomendado es construir el **CRUD base del nucleo causal**:

- CRUD de proyectos
- CRUD de publicaciones
- registro de cambios operativos
- consulta de snapshots metricos y timeline

Despues de eso ya conviene pasar a importacion CSV real y vista causal antes/despues.
