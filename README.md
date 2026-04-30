# Market Pulse

Market Pulse es una app web **local-first** para analisis operativo ecommerce, pensada primero para Mercado Libre.

La tesis del producto sigue siendo la misma:

> **No construir otra suite generica de market intelligence, sino una bitacora causal operativa que registre cambios, mida impacto y explique que probablemente paso, usando competencia y oportunidades como contexto.**

## Estado actual del repositorio
El repositorio ya tiene una base local-first en funcionamiento con:

- `Next.js` + `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite` local
- migracion inicial versionada
- seed demo realista para explorar el dominio
- layout general con sidebar, header y contenedor principal
- navegacion inicial para los modulos del MVP
- CRUD operativo inicial para proyectos, publicaciones y cambios
- importacion CSV de metricas historicas como snapshots reales

Todavia no se implementa timeline causal ni explicacion profunda. La base queda preparada para cargar datos reales y construir la vista antes/despues por publicacion.

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
- `npm test`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:reset`
- `npm run db:seed`

## Importacion CSV de metricas
La pantalla `Importaciones` permite cargar snapshots historicos de publicaciones desde CSV y guardarlos como `ListingMetricSnapshot`.

Flujo soportado:

1. Seleccionar proyecto.
2. Subir CSV.
3. Previsualizar filas.
4. Revisar o ajustar mapping de columnas.
5. Resolver publicaciones no encontradas o permitir crearlas.
6. Importar snapshots validos.
7. Registrar el resultado en `CsvImport`.

Campos soportados:

- fecha
- publicacion por ID interno, ID externo, SKU, titulo o referencia generica
- visitas
- ventas en unidades
- conversion
- facturacion
- stock
- precio
- gasto ads
- notas

El parser acepta separadores `,`, `;` y tab, comillas CSV, headers alternativos, fechas ISO o `dd/mm/yyyy`, numeros con coma o punto y conversion en ratio o porcentaje.

Samples utiles:

- `samples/csv/metric-snapshots.sample.csv`
- `samples/csv/metric-snapshots-alternative-headers.sample.csv`
- `samples/csv/metric-snapshots-invalid.sample.csv`

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
El siguiente bloque recomendado es construir el **timeline simple por publicacion**:

- listar cambios y snapshots en orden cronologico
- comparar ventanas antes/despues de un cambio
- mostrar copy prudente de impacto probable
- dejar la base lista para insights heuristicos posteriores
