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
- primera version del timeline causal por publicacion
- competencia acotada con busquedas monitoreadas, snapshots manuales, resultados observados y comparacion simple
- primera version de oportunidades operativas con reglas explicitas, filtros y gestion de estado

La base queda preparada para cargar datos reales y cruzar mas adelante contexto competitivo con el timeline causal, sin prometer causalidad absoluta.

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

## Como levantar el proyecto desde cero
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

Si ya tenes dependencias instaladas y solo queres regenerar la demo local:

```bash
npm run db:reset
npm run db:seed
npm run dev
```

En Windows, si `npm run build` falla con `EPERM` intentando escanear carpetas protegidas del perfil del usuario, ejecutar el build con `HOME` y `USERPROFILE` apuntando a una carpeta temporal dentro del repo. Por ejemplo en PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path ".\tmp\home" | Out-Null
$env:HOME = "$PWD\tmp\home"
$env:USERPROFILE = "$PWD\tmp\home"
npm run build
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

## Competencia acotada
La pantalla `Competencia` permite trabajar con contexto competitivo manual y comparable:

1. Crear una busqueda monitoreada por proyecto.
2. Editar nombre, query, notas y estado activo/inactivo.
3. Crear snapshots manuales por fecha.
4. Cargar resultados observados dentro de cada snapshot.
5. Vincular un resultado a una publicacion propia o a un competidor conocido.
6. Crear competidores simples desde la seccion de competencia o durante la carga de resultados.
7. Comparar dos snapshots de una misma busqueda.

El share of shelf de esta etapa es deliberadamente simple:

- apariciones propias cargadas
- apariciones por competidor o seller visible
- presencia propia en top 5 y top 10
- competidores que entran o desaparecen entre dos snapshots
- cambios de precio observados cuando se puede comparar el mismo resultado

No hay scraping, automatizaciones externas, IA ni inteligencia competitiva masiva. El modulo existe como contexto operativo para explicar mejor que pudo haber pasado.

## Oportunidades operativas
La pantalla `Oportunidades` permite generar y gestionar `OpportunitySignal` desde reglas transparentes.

Flujo soportado:

1. Filtrar por proyecto, publicacion, busqueda monitoreada, prioridad o estado.
2. Ejecutar `Detectar senales` para evaluar reglas sobre datos locales cargados.
3. Revisar explicacion, prioridad, proyecto y vinculos a publicacion o busqueda.
4. Marcar cada senal como nueva, revisada, descartada o accionada.

Reglas iniciales:

- busquedas sin snapshots o sin snapshots recientes
- ausencia o baja presencia propia en busquedas monitoreadas
- salida de competidores visibles entre snapshots
- concentracion de pocos competidores
- huecos observables de precio
- competidores con disponibilidad dudosa o senales de stock
- cambios de presencia propia en top 5/top 10
- publicaciones con cambios sin mejora visible
- publicaciones con buena conversion y poca visibilidad
- metricas estancadas con poca actividad reciente
- cambios sin seguimiento posterior
- publicaciones con cambios pero sin contexto competitivo reciente

La generacion es manual e idempotente: no borra senales existentes ni pisa estados revisados o descartados. No usa IA, scraping, scheduler ni scoring opaco.

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
- 4 snapshots de competencia con 20 resultados observados
- 2 registros de importacion CSV
- 3 insights
- 2 senales de oportunidad

La deteccion manual de oportunidades puede crear senales adicionales sobre esos mismos datos demo, segun las reglas vigentes y la fecha de evaluacion.

## Flujo recomendado para demo local
1. Abrir `Dashboard` para ver que los datos locales cargaron.
2. Abrir `Ayuda` si queres seguir el manual operativo integrado en la app.
3. Ir a `Publicaciones` y abrir `Mate termico acero inoxidable 1L pico cebador`.
4. Revisar resumen de metricas, insights heuristicos y timeline causal.
5. Entrar a `Cambios` y registrar un cambio nuevo sobre una publicacion.
6. Ir a `Importaciones` y probar `samples/csv/metric-snapshots.sample.csv`.
7. Entrar a `Competencia`, abrir una busqueda monitoreada y comparar dos snapshots.
8. Abrir un snapshot competitivo y cargar un resultado observado manual.
9. Ir a `Oportunidades`, ejecutar `Detectar senales` y cambiar el estado de una senal.

Ese recorrido cubre el objetivo de etapa 1: ver que se toco, que cambio despues en metricas, que contexto competitivo habia y que senales accionables quedan para revisar.

## Limitaciones actuales de etapa 1
- No hay IA, scraping, scheduler ni automatizaciones externas.
- La carga competitiva es manual; no mide market share real ni hace crawling.
- Las explicaciones son heuristicas prudentes, no causalidad estadistica.
- La importacion CSV implementada cubre snapshots metricos de publicaciones, no cambios ni resultados competitivos.
- La deduplicacion de oportunidades usa alcance + tipo + explicacion; todavia no existe `ruleKey` persistido.
- No hay multiusuario, permisos avanzados ni sincronizacion remota.
- La UI es funcional y basica; queda pensada para revision manual del usuario antes de pulido visual.

## Que sigue despues de este bloque
El siguiente bloque recomendado es conectar oportunidades con aprendizaje operativo:

- permitir convertir una senal revisada en un cambio planificado o nota de aprendizaje
- mostrar senales cercanas dentro del timeline causal de una publicacion
- mejorar carga manual de snapshots competitivos sin abrir scraping ni automatizaciones externas
