# Iteracion 2026-04-29 - Importacion CSV de metricas

## Alcance previsto
- Implementar importacion CSV real para `ListingMetricSnapshot`.
- Mantener el foco en la bitacora causal local-first.
- Agregar solo la UI minima necesaria en Importaciones.
- No implementar IA, timeline causal, competencia, oportunidades, scraping ni graficos avanzados.

## Decisiones iniciales
- Separar parseo, mapping, validacion y persistencia en modulos distintos.
- Reusar el modelo `CsvImport` existente sin migracion nueva.
- Registrar filas omitidas dentro de `CsvImport.summary`, porque el schema actual solo tiene `totalRows`, `validRows` e `invalidRows`.
- Usar endpoints locales para preview e importacion, manteniendo el archivo en memoria del navegador durante el flujo.

## Pendiente de completar al cierre
- Registrar archivos implementados.
- Registrar validaciones ejecutadas.
- Dejar limitaciones conocidas y pasos para probar el flujo.

## Implementado
- Parser CSV local en `src/lib/csv/parser.ts` con soporte para comillas, separadores `,`, `;` y tab.
- Mapping sugerido en `src/lib/csv/metric-mapping.ts` para nombres de columnas no exactos.
- Validacion en `src/lib/csv/metric-validation.ts` para:
  - fecha
  - vinculacion con publicacion
  - enteros no negativos
  - decimales con coma o punto
  - conversion como ratio o porcentaje
  - filas duplicadas dentro del mismo archivo
- Servicio de importacion en `src/lib/csv/metric-import-service.ts`.
- Endpoints:
  - `POST /api/importaciones/metricas/preview`
  - `POST /api/importaciones/metricas`
- UI minima en `Importaciones` para:
  - seleccionar proyecto
  - subir archivo
  - ver preview
  - ajustar mapping
  - resolver publicaciones no encontradas
  - permitir creacion de publicaciones faltantes
  - ver resultado de la importacion
- Listado de importaciones recientes desde `CsvImport`.
- Samples:
  - `samples/csv/metric-snapshots.sample.csv`
  - `samples/csv/metric-snapshots-alternative-headers.sample.csv`
  - `samples/csv/metric-snapshots-invalid.sample.csv`
- Test simple en `tests/csv-import.test.mjs` para parser y mapping.

## Decisiones tomadas
- No se agrego migracion: se reutilizo `CsvImport.summary` para guardar `skippedRows`, `createdListings` e issues.
- La importacion de snapshots usa upsert por `listingId + snapshotDate`.
- Las filas invalidas u omitidas no frenan las filas validas.
- La creacion de publicaciones faltantes queda opt-in en la UI.
- La UI se mantuvo funcional y minima; la revision visual queda para el usuario.

## Validacion ejecutada
- `npm run lint`: correcto.
- `npm test`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `npm run build`: bloqueado por `EPERM` de Windows al escanear `C:\Users\user\Configuracion local`.

## Verificacion funcional
- Durante la iteracion se verifico por API local que un CSV valido:
  - previsualiza 3 filas validas
  - importa 3 snapshots
  - registra `CsvImport` con estado `PROCESSED`
- Tambien se verifico un CSV mixto:
  - 1 fila valida
  - 1 fila invalida
  - 1 fila omitida por publicacion inexistente
  - `CsvImport` con estado `PARTIAL`

Al cierre, nuevas escrituras SQLite desde comandos locales quedaron bloqueadas por `disk I/O error`, incluso sobre una base aislada de verificacion. No se insistio para evitar mas errores de entorno. Conviene reiniciar procesos dev antes de la proxima prueba manual.

## Como probar manualmente
1. Reiniciar procesos dev si la base local muestra `disk I/O error`.
2. Correr `npm run dev`.
3. Abrir `http://localhost:3000/importaciones`.
4. Seleccionar el proyecto demo.
5. Subir `samples/csv/metric-snapshots.sample.csv`.
6. Previsualizar y confirmar el mapping sugerido.
7. Importar snapshots.
8. Revisar el resultado en la misma pantalla y los snapshots en el detalle de publicaciones.
9. Repetir con `samples/csv/metric-snapshots-invalid.sample.csv` para validar estado parcial.

## Limitaciones conocidas
- No importa eventos de cambio CSV.
- No hay timeline causal todavia.
- No hay graficos avanzados.
- La experiencia visual de la pantalla de importaciones queda pendiente de revision manual.
- `CsvImport` no tiene columna dedicada `skippedRows`; ese dato queda en `summary`.

## Proximo paso recomendado
Construir timeline simple por publicacion usando `ChangeEvent` y `ListingMetricSnapshot`.
