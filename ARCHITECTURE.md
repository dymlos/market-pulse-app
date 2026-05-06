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

## Decisiones recientes
### Hardening y cierre de etapa 1
Se cerro la etapa 1 sin cambiar el schema ni abrir nuevos modulos:

- validaciones server-side mas explicitas en acciones principales
- errores redirigidos a mensajes de formulario en lugar de fallas silenciosas o errores crudos de Prisma
- importador CSV con manejo basico de fallas de red/respuesta invalida
- seed demo ajustado para incluir snapshots competitivos comparables en una misma busqueda
- pruebas ampliadas sobre timeline, comparacion de snapshots y oportunidades

La decision es mantener arquitectura simple y local-first: los cambios refuerzan robustez del flujo existente, no agregan capas nuevas.

### Oportunidades operativas
Se agrego una primera capa usable de oportunidades operativas sin cambiar el modelo de datos:

- reglas puras y testeables para detectar senales
- persistencia idempotente en `OpportunitySignal`
- filtros por proyecto, publicacion, busqueda, severidad y estado
- cambio simple de estado: nueva, revisada, descartada o accionada
- explicaciones legibles y prudentes conectadas a datos cargados

La decision se mantiene alineada con el producto: oportunidades son senales operativas derivadas del contexto real cargado, no un radar generico ni una recomendacion automatica.

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
- reglas explicitas para oportunidades operativas y priorizacion simple

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

## Oportunidades operativas
La capa de oportunidades reutiliza `OpportunitySignal` y agrega dos piezas:

- `src/lib/opportunity-rules.ts`: reglas puras sin Prisma ni UI, pensadas para testear deteccion y prioridad.
- `src/lib/opportunity-service.ts`: carga contexto desde Prisma, ejecuta reglas y persiste senales nuevas sin duplicar las ya existentes.

La generacion se dispara manualmente desde la pantalla `Oportunidades`. No hay scheduler ni mutacion al cargar la pagina.

La deduplicacion actual evita repetir senales comparando:

- proyecto
- publicacion opcional
- busqueda opcional
- tipo
- explicacion

Esto mantiene el schema estable en esta etapa. Si mas adelante hace falta trazabilidad fina, se puede agregar una columna explicita de `ruleKey` o `sourceRule`.

La priorizacion es cualitativa y visible:

- `HIGH`: ausencia propia en una busqueda monitoreada o perdida fuerte de top 5.
- `MEDIUM`: huecos de precio, disponibilidad dudosa de competidor, actividad operativa con resultados dudosos, cambios sin seguimiento o baja visibilidad con buena conversion.
- `LOW`: datos desactualizados, estancamiento suave o falta de contexto competitivo.

No se implementa IA, scoring opaco, scraping, prediccion ni recomendaciones automaticas complejas.

## Relaciones clave
- `Project -> Listing` es la relacion principal del MVP.
- `Listing -> ListingMetricSnapshot` y `Listing -> ChangeEvent` modelan la memoria operativa antes/despues.
- `Project -> TrackedSearch -> SearchSnapshot -> SearchResultItem` modela el contexto competitivo minimo.
- `SearchResultItem` puede apuntar a `Competitor` o a `Listing` para distinguir presencia propia y ajena en una misma observacion.
- `Insight` y `OpportunitySignal` se cuelgan del proyecto y opcionalmente de una publicacion o busqueda para evitar sobreacoplar la capa explicativa.
- `OpportunitySignal` conserva estado de revision para no mezclar senales nuevas con senales ya revisadas, descartadas o accionadas.

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
