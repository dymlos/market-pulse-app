# Log - Modelo de datos etapa 1

Fecha: 2026-04-21
Bloque: modelo de datos local-first para el MVP causal

## Objetivo
Implementar una base de datos Prisma + SQLite alineada al nucleo del producto:

- bitacora causal operativa
- snapshots metricos
- contexto competitivo minimo
- importaciones CSV
- insights y oportunidades como capas complementarias

## Estado de trabajo
Completado.

## Entidades creadas o consolidadas
- `Project`
- `Listing`
- `ListingMetricSnapshot`
- `ChangeEvent`
- `TrackedSearch`
- `Competitor`
- `SearchSnapshot`
- `SearchResultItem`
- `CsvImport`
- `Insight`
- `OpportunitySignal`

## Relaciones clave
- `Project -> Listing`
- `Listing -> ListingMetricSnapshot`
- `Listing -> ChangeEvent`
- `Project -> TrackedSearch -> SearchSnapshot -> SearchResultItem`
- `SearchResultItem -> Competitor?`
- `SearchResultItem -> Listing?` para reconocer presencia propia en resultados
- `Project -> CsvImport`
- `Project -> Insight -> Listing? / TrackedSearch?`
- `Project -> OpportunitySignal -> Listing? / TrackedSearch?`

## Decisiones de naming
- Se adopto `ListingMetricSnapshot` en lugar de `MetricSnapshot` para explicitar que el snapshot pertenece a una publicacion propia.
- Se adopto `CsvImport` en lugar de `ImportJob` porque el MVP registra importaciones locales simples y no pipelines complejos.
- Se adopto `SearchSnapshot` y `SearchResultItem` para modelar competencia desde snapshots de busqueda, no como un modulo abstracto y sobredimensionado.
- Se adopto `OpportunitySignal` para mantener un lenguaje prudente y consistente con la tesis del producto.
- En metricas se uso `salesUnits` y `revenue` para separar ventas en unidades de facturacion.

## Campos importantes
- `Listing` guarda `externalId`, `sku`, `title`, `categoryName`, `brand`, `currentPrice`, `availableStock` y `notes`.
- `ListingMetricSnapshot` guarda `snapshotDate`, `visits`, `salesUnits`, `conversionRate`, `revenue`, `availableStock`, `price`, `adSpend` y `notes`.
- `ChangeEvent` guarda `occurredAt`, `type`, `detail`, `previousValue`, `newValue`, `comment`, `actorName` y `hypothesis`.
- `SearchResultItem` guarda `position`, `observedTitle`, `observedPrice`, `observedSellerName`, `visibleFlags`, `isOwnListing`, `isSponsored`, `hasFreeShipping`, `hasFull` e `isCatalogListing`.
- `CsvImport` registra `type`, `fileName`, `status`, `totalRows`, `validRows`, `invalidRows` y `summary`.
- `Insight` y `OpportunitySignal` permiten estado, nivel de confianza/severidad y texto explicativo prudente.

## Migracion y seed
- Se creo la migracion inicial `prisma/migrations/202604211700_stage1_local_first_core/migration.sql`.
- Se agrego `prisma/seed.mjs` con datos demo para explorar el flujo causal y el contexto competitivo minimo.
- Se dejo `scripts/db.mjs` para aplicar o recrear la SQLite local desde migraciones versionadas.
- Se movio la base operativa por defecto a `data/market-pulse.local.db` para no pisar el archivo previo del scaffold.

## Datos demo cargados
- 1 proyecto: `Tienda Andina Outdoor`
- 3 publicaciones activas
- 9 snapshots metricos
- 6 eventos de cambio
- 2 busquedas monitoreadas
- 3 competidores
- 2 snapshots manuales de competencia con 6 resultados observados
- 2 registros de importacion CSV
- 3 insights
- 2 senales de oportunidad

## Verificaciones realizadas
- `npm exec prisma validate`: OK
- `npm run db:generate`: OK
- `npm run db:reset`: OK
- `npm run db:seed`: OK
- consulta Prisma de conteos demo: OK
- `npm run build`: OK

## Limitaciones actuales
- El esquema ya existe, pero todavia no hay CRUD real ni vistas conectadas a base.
- `CsvImport` solo registra metadatos de importacion; no existe todavia el parser real ni la validacion de columnas.
- Los flags visibles de competencia se guardan como resumen simple (`visibleFlags`) y algunos booleanos, sin normalizacion extra.
- `Insight` y `OpportunitySignal` todavia dependen de seed/manualidad; no hay motor heuristico implementado.
- Quedo preservada la base previa del scaffold (`data/market-pulse.db`) como referencia local, pero ya no es la base operativa por defecto.

## Proximos pasos recomendados
- Construir CRUD de `Project`, `Listing`, `ChangeEvent` y `ListingMetricSnapshot`.
- Exponer una timeline basica por publicacion uniendo cambios y snapshots.
- Implementar importacion CSV real para snapshots metricos y eventos de cambio.
- Recien despues sumar lectura de snapshots competitivos dentro de la UI causal.
