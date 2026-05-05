# Iteracion 2026-05-05 - Competencia acotada: busquedas monitoreadas y snapshots comparables

## Alcance previsto
- Implementar un flujo manual usable para busquedas monitoreadas.
- Crear snapshots manuales por fecha.
- Cargar resultados observados dentro de cada snapshot.
- Vincular resultados a publicaciones propias o competidores.
- Listar y crear competidores sin gestion avanzada.
- Comparar dos snapshots de una misma busqueda.
- Mostrar share of shelf simple y honesto.

## Decisiones iniciales
- Reusar `TrackedSearch`, `SearchSnapshot`, `SearchResultItem` y `Competitor` sin migraciones.
- Mantener competencia como contexto operativo, no como suite de inteligencia competitiva.
- Separar acceso a datos, acciones de persistencia, helper de comparacion y presentacion.
- Usar tablas y formularios basicos; no invertir en pulido visual ni nuevas librerias.
- No implementar scraping, automatizaciones externas, IA ni oportunidades avanzadas.

## Validacion planificada
- `npm run lint`
- `npm test`
- `npx tsc --noEmit --incremental false`
- `npm run build` si el entorno lo permite
- levantar la app localmente
- probar creacion de busqueda, snapshot, resultados y comparacion

## Pendiente de completar al cierre
- Registrar archivos implementados.
- Documentar que significa share of shelf en esta etapa.
- Registrar limitaciones.
- Dejar pasos manuales de prueba.

## Implementado
- Listado de busquedas monitoreadas con filtro por proyecto.
- Alta de busqueda monitoreada.
- Edicion de nombre, query, marketplace, estado y notas.
- Detalle de busqueda con datos basicos, lista de snapshots y formulario de nuevo snapshot.
- Detalle de snapshot con resumen, share of shelf simple, carga manual de resultados y tabla de resultados.
- Alta y listado simple de competidores desde `Competencia`.
- Alta de competidor desde la carga de resultados cuando no existe uno reutilizable.
- Vinculacion de resultado observado a:
  - publicacion propia (`Listing`)
  - competidor (`Competitor`)
  - seller/titulo observado sin vinculo formal
- Comparacion entre dos snapshots de una misma busqueda.
- Helper puro `src/lib/search-snapshot-comparison.ts` con cobertura en `npm test`.

## Archivos principales
- `src/lib/search-snapshot-comparison.ts`
- `src/lib/market-data.ts`
- `src/lib/market-actions.ts`
- `src/components/forms/tracked-search-form.tsx`
- `src/components/forms/competitor-form.tsx`
- `src/components/forms/search-snapshot-form.tsx`
- `src/components/forms/search-result-item-form.tsx`
- `src/components/competition/search-snapshot-comparison-panel.tsx`
- `src/app/(workspace)/competencia/page.tsx`
- `src/app/(workspace)/competencia/[trackedSearchId]/page.tsx`
- `src/app/(workspace)/competencia/[trackedSearchId]/editar/page.tsx`
- `src/app/(workspace)/competencia/[trackedSearchId]/snapshots/[snapshotId]/page.tsx`
- `tests/csv-import.test.mjs`

## Share of shelf en esta etapa
Share of shelf significa solamente presencia visible dentro de los resultados cargados manualmente:

- cantidad total de resultados cargados
- cantidad de apariciones propias
- cantidad de apariciones ajenas con competidor o seller visible
- apariciones propias en top 5 y top 10
- apariciones por competidor o seller visible
- competidores/sellers que aparecen en un snapshot comparado y no estaban en el base
- competidores/sellers que estaban en el base y no aparecen en el comparado

No es una metrica ponderada, no infiere market share real y no depende de scraping.

## Comparacion entre snapshots
La comparacion usa dos snapshots de la misma busqueda:

- snapshot base
- snapshot comparado

Muestra conteos lado a lado, entradas/salidas de competidores y cambios simples de precio cuando el resultado se puede matchear por:

- publicacion propia vinculada
- ID externo observado
- competidor + titulo observado
- seller visible + titulo observado

## Validacion ejecutada
- `npm run lint`: correcto.
- `npm test`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- Validacion Prisma contra base temporal `tmp/prompt6-validation.db`: correcta para crear busqueda, dos snapshots, dos competidores y cuatro resultados observados; luego se limpiaron los registros temporales.
- Dev server levantado en `http://localhost:3000` contra base temporal de validacion.
- Rutas verificadas por HTTP:
  - `/competencia`: 200
  - `/dashboard`: 200
  - `/competencia/[trackedSearchId]`: 200
  - `/competencia/[trackedSearchId]/editar`: 200
  - `/competencia/[trackedSearchId]/snapshots/[snapshotId]`: 200
- `npm run build`: bloqueado por `EPERM` de Windows al escanear `C:\Users\user\Configuracion local`, mismo limite de entorno documentado en iteraciones previas.

## Limites conocidos
- La base local por defecto `data/market-pulse.local.db` sigue mostrando `disk I/O error` de SQLite en este entorno. Para no tocar datos locales, la validacion de escritura se hizo contra una base temporal.
- La UI es funcional y basica; queda pendiente revision visual manual.
- No hay edicion ni borrado de resultados observados.
- No hay importacion CSV de resultados competitivos en esta iteracion.
- No hay integracion profunda con timeline causal todavia.
- No hay oportunidades avanzadas derivadas de competencia.
- No hay scraping, automatizaciones externas ni IA.

## Como probar paso a paso
1. Abrir `http://localhost:3000/competencia`.
2. Crear una busqueda monitoreada desde `Nueva busqueda`.
3. Entrar al detalle de la busqueda.
4. Crear un snapshot manual con fecha y notas.
5. Entrar al detalle del snapshot.
6. Agregar resultados observados indicando posicion, titulo, precio, seller visible y flags.
7. Para resultados propios, elegir `Publicacion propia` y vincular una `Listing`.
8. Para resultados ajenos, elegir `Competidor` y seleccionar uno existente o cargar un nombre nuevo.
9. Volver al detalle de la busqueda.
10. Crear un segundo snapshot y cargar algunos resultados.
11. Usar `Comparar snapshots` para elegir snapshot base y comparado.
12. Revisar presencia propia, competidores nuevos/desaparecidos, apariciones por competidor y cambios de precio observados.

## Siguiente paso recomendado
Cruzar este contexto competitivo con el timeline causal de forma prudente: por ejemplo, mostrar snapshots cercanos a un cambio propio como contexto, sin afirmar causalidad exacta.
