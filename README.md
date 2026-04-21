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
- layout general con sidebar, header y contenedor principal
- navegacion inicial para los modulos del MVP

Todavia no se implementa la logica profunda del negocio. El objetivo de este bloque fue dejar una base clara, ejecutable y preparada para crecer sin sobreconstruccion.

## Stack elegido
- `Next.js` con App Router
- `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite`
- `npm` como flujo operativo disponible en este entorno

`pnpm` sigue siendo una opcion valida a futuro, pero en esta maquina el scaffold queda verificado con `npm`.

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
|   `-- schema.prisma
|-- public/
|-- src/
|   |-- app/
|   |   |-- (workspace)/
|   |   `-- globals.css
|   |-- components/
|   |   |-- layout/
|   |   `-- ui/
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

2. Generar Prisma Client y crear la base SQLite local:

```bash
npm run db:push
```

3. Levantar la app:

```bash
npm run dev
```

4. Abrir en:

```text
http://localhost:3000
```

## Scripts disponibles
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run db:generate`
- `npm run db:push`

## Persistencia local
La base de datos local se crea en:

```text
data/market-pulse.db
```

La idea sigue siendo local-first:

- datos en la misma PC
- sin dependencia obligatoria de APIs externas
- sin scraping masivo como base del MVP
- preparada para crecer despues a un deploy real si hiciera falta

## Que sigue despues de este bloque
El siguiente bloque recomendado es construir el **nucleo causal minimo**:

- modelo de datos afinado
- CRUD de proyectos
- CRUD de publicaciones
- registro de cambios operativos
- primer flujo real de memoria operativa

Despues de eso ya conviene pasar a snapshots metricos, importacion CSV y timeline causal.
