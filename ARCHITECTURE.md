# ARCHITECTURE.md

## Objetivo arquitectonico
Preparar una app web real que corra primero en una sola PC, sin hosting obligatorio, pero que despues pueda crecer a un despliegue remoto sin reescritura total.

## Principios de arquitectura
- Local-first en la etapa 1
- Persistencia local simple y explicita
- Separacion clara entre UI, dominio y acceso a datos
- Dependencias minimas al comienzo
- Evolucion incremental, no sobrearquitectura

## Stack actual
- `Next.js` con App Router
- `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite`

## Decision de esta iteracion
Se agrego una primera capa usable de competencia acotada sin cambiar el modelo de datos:

- busquedas monitoreadas editables
- snapshots manuales por fecha
- resultados observados cargados manualmente
- competidores simples reutilizables
- comparacion entre dos snapshots de una misma busqueda
- share of shelf simple basado en resultados cargados

La decision se mantiene alineada con el producto: competencia es contexto operativo para la bitacora causal, no una suite de market intelligence.

## Capas actuales
### 1. Presentacion
Responsable de:

- layout general
- navegacion principal
- vistas iniciales por modulo
- componentes visuales reutilizables
- UI minima de importacion CSV para preview, mapping y resultado

Ubicacion:

- `src/app/`
- `src/components/`

### 2. Dominio liviano
Responsable de:

- configuracion de modulos
- metadata de navegacion
- decisiones de copy y foco de producto en la UI base
- parseo, mapping y validacion de CSV de metricas
- comparacion simple entre snapshots de busqueda
- calculo de presencia propia, presencia por competidor y entradas/salidas entre snapshots

Ubicacion:

- `src/lib/`

### 3. Persistencia
Responsable de:

- esquema de datos de etapa 1
- cliente Prisma generado localmente
- migraciones versionadas
- SQLite local con datos demo

Ubicacion:

- `prisma/schema.prisma`
- `prisma/migrations/`
- `prisma/seed.mjs`
- `src/generated/prisma/`
- `src/lib/prisma.ts`
- `scripts/db.mjs`
- `data/market-pulse.local.db`

## Modelo de datos de esta iteracion
### Nucleo causal
- `Project`: espacio de trabajo que agrupa publicaciones, busquedas, imports, insights y oportunidades.
- `Listing`: publicacion propia vinculada a un proyecto, con campos operativos de referencia como `externalId`, `sku`, `title`, `currentPrice` y `availableStock`.
- `ListingMetricSnapshot`: snapshot por fecha para una publicacion. Guarda visitas, ventas en unidades, conversion, facturacion, stock, precio, gasto publicitario y notas.
- `ChangeEvent`: evento operativo sobre una publicacion. Guarda fecha, tipo, detalle, valor anterior, valor nuevo, comentario, responsable e hipotesis.

### Contexto competitivo minimo
- `TrackedSearch`: busqueda monitoreada por proyecto.
- `SearchSnapshot`: snapshot temporal de una busqueda monitoreada.
- `SearchResultItem`: resultado observado dentro de un snapshot, con posicion, titulo observado, precio observado, vendedor observado, flags visibles y vinculos opcionales a competidor o publicacion propia.
- `Competitor`: competidor observado a nivel proyecto. Se conecta a las busquedas a traves de resultados observados, sin forzar una relacion artificial extra.

### Soporte operativo
- `CsvImport`: registro simple de importaciones CSV con tipo, archivo, estado y conteo de filas.
- `Insight`: lectura heuristica o futura salida de IA vinculable a proyecto y opcionalmente a publicacion o busqueda.
- `OpportunitySignal`: senal accionable vinculable a proyecto y opcionalmente a publicacion o busqueda.

## Importacion CSV de metricas
La importacion de metricas se mantiene dentro del monolito local-first:

- endpoints locales en `src/app/api/importaciones/metricas/`
- parser y mapping en `src/lib/csv/`
- persistencia via Prisma en SQLite
- UI minima en `src/components/imports/`

El flujo no usa APIs externas ni scraping. Cada fila valida termina asociada a un `Listing` existente o, si el usuario lo habilita, a un `Listing` creado durante la importacion. Los snapshots se guardan con upsert sobre `listingId + snapshotDate` para que reimportar un archivo corrija valores sin duplicar fechas.

Las filas invalidas u omitidas no cortan toda la carga. `CsvImport` guarda `totalRows`, `validRows`, `invalidRows`, `status` y un `summary` JSON con `skippedRows`, `createdListings` e issues compactos.

## Competencia acotada
La capa competitiva usa las entidades existentes:

- `TrackedSearch`: busqueda monitoreada editable por proyecto.
- `SearchSnapshot`: captura manual o CSV de una busqueda en una fecha.
- `SearchResultItem`: resultado observado con posicion, precio, vendedor, flags visibles y vinculos opcionales.
- `Competitor`: competidor simple del proyecto para evitar duplicar nombres al cargar resultados.

Las mutaciones viven en `src/lib/market-actions.ts` y las lecturas en `src/lib/market-data.ts`. La comparacion pura vive en `src/lib/search-snapshot-comparison.ts` para mantenerla testeable sin Prisma ni UI.

En esta etapa, share of shelf significa conteos visibles sobre lo cargado manualmente:

- total de resultados cargados
- apariciones propias
- apariciones por competidor o seller visible
- presencia propia en top 5 y top 10
- competidores nuevos o desaparecidos entre snapshots
- cambios simples de precio cuando el resultado se puede matchear por publicacion propia, ID externo, competidor+titulo o vendedor+titulo

No se implementa scraping, crawling, automatizacion externa, share of shelf ponderado ni integracion profunda con el timeline causal.

## Relaciones clave
- `Project -> Listing` es la relacion principal del MVP.
- `Listing -> ListingMetricSnapshot` y `Listing -> ChangeEvent` modelan la memoria operativa antes/despues.
- `Project -> TrackedSearch -> SearchSnapshot -> SearchResultItem` modela el contexto competitivo minimo.
- `SearchResultItem` puede apuntar a `Competitor` o a `Listing` para distinguir presencia propia y ajena en una misma observacion.
- `Insight` y `OpportunitySignal` se cuelgan del proyecto y opcionalmente de una publicacion o busqueda para evitar sobreacoplar la capa explicativa.

## Decisiones de naming
- Se reemplazo `MetricSnapshot` por `ListingMetricSnapshot` para dejar explicito que el snapshot pertenece a una publicacion propia.
- Se reemplazo `ImportJob` por `CsvImport` porque en etapa 1 se prioriza registro de importaciones locales simples, no pipelines complejos.
- Se reemplazo `CompetitionSnapshot` por `SearchSnapshot` y se agrego `SearchResultItem` para representar mejor snapshots de busqueda y share of shelf visible.
- Se reemplazo `Opportunity` por `OpportunitySignal` para reflejar que se modelan senales operativas, no oportunidades concluyentes.
- En metricas se uso `salesUnits` y `revenue` para separar claramente ventas en unidades de facturacion.

## Propuesta de crecimiento
### Nucleo causal
- proyectos
- publicaciones propias
- eventos de cambio
- snapshots metricos
- timeline causal
- insights probabilisticos

### Contexto competitivo minimo
- busquedas monitoreadas
- snapshots manuales de resultados
- competidores observados
- share of shelf simple por snapshot

### Oportunidades
- reglas heuristicas simples
- senales accionables
- estados de revision

## Flujo local-first esperado
En esta etapa, el flujo ideal es:

1. El usuario corre la app en localhost.
2. La base se crea desde migraciones versionadas y seed demo local.
3. La app guarda datos en SQLite local.
4. Los imports entran por carga manual o CSV.
5. Los snapshots y cambios quedan disponibles para timeline e insights.
6. Todo puede probarse sin servidor publico.

## Que no hacer por ahora
- no introducir microservicios
- no separar frontend y backend sin necesidad
- no depender de colas, webhooks o scraping complejo
- no optimizar para SaaS enterprise antes de validar el MVP

## Observacion sobre UI
La interfaz base se piensa como herramienta operativa:

- desktop-first
- sobria
- legible
- preparada para tablas, timelines y filtros

No se busca una demo visual recargada, sino una base clara para trabajo diario.
