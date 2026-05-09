# Iteracion 2026-05-08 - Refinamiento de Carga de datos / Importaciones

## Alcance previsto
- Reforzar la seccion `Importaciones` como entrada de evidencia para el nucleo causal.
- Mantener la ruta `/importaciones` y el modelo `CsvImport`.
- Mejorar flujo CSV, feedback post-importacion, historial y copy.
- No abrir IA, scraping, nuevos modulos ni nuevas migraciones.

## Decision de producto
- La seccion sigue teniendo sentido como independiente porque una carga CSV puede afectar muchas publicaciones y necesita preview, mapping, validaciones e historial.
- Se renombra visualmente como `Carga de datos` para que no compita con Publicaciones o Cambios como modulo de analisis.
- La funcion queda clara: convertir CSV locales en snapshots metricos que alimentan Publicaciones, Cambios, timeline causal e insights.

## Mejoras implementadas
- Navegacion lateral y header pasan a mostrar `Carga de datos`, manteniendo `/importaciones`.
- Copy principal orientado a evidencia antes/despues y no a consola tecnica.
- Panel CSV con pasos visibles: elegir proyecto, subir CSV, previsualizar, resolver columnas, importar y revisar.
- Ayuda de formato esperado con sample local recomendado.
- Mapping de columnas con ayudas por campo y obligatoriedad mas clara.
- Explicacion de la opcion de crear publicaciones faltantes como registros minimos a completar luego.
- Resultado post-importacion con conteos, rango de snapshots, publicaciones afectadas, filas observadas y acciones siguientes.
- Acciones post-importacion hacia publicaciones con metricas, historial filtrado y nueva carga.
- Historial con filtros por archivo/proyecto, proyecto, estado y periodo.
- Filas del historial con evidencia cargada, rango de fechas, publicaciones afectadas, observaciones y detalle expandible.

## Cambios tecnicos
- `CsvImport.summary` ahora puede guardar metadata extendida para nuevas cargas: rango de snapshots y publicaciones afectadas.
- No se cambio el schema Prisma.
- Los imports antiguos siguen funcionando; si no tienen metadata extendida, el historial muestra fallback.
- Se oculto el ID interno de `CsvImport` de la experiencia principal.

## Limites conocidos
- La importacion sigue cubriendo snapshots metricos de publicaciones, no cambios ni resultados competitivos.
- Las publicaciones creadas desde CSV son minimas y conviene completarlas despues desde `Publicaciones`.
- El historial no tiene una pagina de detalle propia; usa detalle expandible en la tabla.
- Los archivos de sample siguen como archivos locales del repo, no como descarga publica desde la app.

## Validacion ejecutada
- `npm run lint`: correcto.
- `npm test`: correcto.
- `npx tsc --noEmit --pretty false`: correcto.
- `git diff --check`: correcto.
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`.
- Dev server reiniciado en `http://127.0.0.1:3000`.
- Rutas `/importaciones`, `/importaciones?status=PROCESSED`, `/importaciones?q=sample` y `/importaciones?projectId=[id]&timeframe=LAST_30_DAYS`: 200.
- API preview CSV: 200 con 3 filas validas sobre `samples/csv/metric-snapshots.sample.csv`.
- API importacion CSV: validada con proyecto temporal y borrado posterior; resultado `PROCESSED`, 2 filas guardadas, 2 publicaciones afectadas y rango de fechas persistido en `CsvImport.summary`.
- Browser interno: `/importaciones` renderizo `Carga de datos`, flujo guiado e historial sin errores de consola.

## Que revisar manualmente en frontend
- Si el nombre `Carga de datos` resulta mas claro que `Importaciones` en la sidebar.
- Si el flujo de pasos no ocupa demasiado espacio en pantallas chicas.
- Si el detalle expandible del historial es suficiente o conviene una pagina dedicada mas adelante.
- Si la opcion de crear publicaciones minimas queda lo bastante prudente.
