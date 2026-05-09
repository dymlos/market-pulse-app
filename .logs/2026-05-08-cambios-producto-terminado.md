# Refinamiento integral del modulo Cambios

Fecha: 2026-05-08

## Objetivo

Cerrar `Cambios` como bitacora operativa central de etapa 1: no una tabla administrativa, sino el lugar donde queda registrado que se toco, cuando, por que, que antes/despues habia y si ya existen datos posteriores para revisar impacto probable.

## Contexto revisado

- `AGENTS.md`
- `README.md`
- `PLAN.md`
- `ARCHITECTURE.md`
- todos los archivos de `Documentacion/`
- logs markdown y logs de dev en `.logs/`
- estado real de Git
- pantallas y server actions actuales de `Cambios`
- relacion con `Publicaciones`, snapshots metricos, timeline causal e importaciones

## Cambios implementados

- La pantalla se reposiciono como `Bitacora de cambios`.
- Se agrego busqueda por descripcion, comentario, hipotesis, responsable, publicacion, SKU e ID externo.
- Se agrego filtro rapido por periodo:
  - ultimos 7 dias
  - ultimos 30 dias
  - este mes
- El listado muestra mejor:
  - fecha relativa + fecha exacta
  - tipo de cambio
  - publicacion y proyecto
  - responsable/comentario cuando existe
  - antes/despues cuando existe
  - estado de seguimiento posterior
- La accion principal paso de `Detalle` a `Abrir cambio`.
- Las acciones secundarias conectan con:
  - timeline causal de la publicacion
  - importaciones filtradas por proyecto
  - edicion de la memoria del cambio
- El detalle se reorganizo como lectura de producto:
  - decision registrada
  - fecha, tipo, responsable, proyecto y publicacion
  - antes/despues
  - hipotesis
  - contexto operativo
  - snapshots anterior y posterior cuando existen
- Se eliminaron textos tecnicos como "SQLite local via Prisma" de la experiencia principal.
- El formulario refuerza memoria operativa con ayudas, ejemplos de antes/despues y placeholders mas accionables.
- Los links desde `Publicaciones` hacia `Registrar cambio` incluyen retorno al timeline causal.

## Seguimiento posterior

No se agrego un estado persistido nuevo. La senal se calcula con snapshots existentes:

- `Sin seguimiento`: no hay `ListingMetricSnapshot` posterior al `ChangeEvent`.
- `Con seguimiento`: hay snapshot posterior.
- `Lectura disponible`: hay snapshot anterior y posterior al cambio.

Esta decision evita migraciones y mantiene la etapa 1 simple. La lectura sigue siendo prudente: orienta revision operativa, no prueba causalidad.

## Validaciones agregadas

- Fecha futura no permitida.
- Descripcion obligatoria con minimo de 8 caracteres.
- Si se carga solo valor anterior o solo valor nuevo para tipos donde el antes/despues suele importar, el servidor pide completar ambos.
- Se preserva el retorno contextual cuando el alta viene desde una publicacion o desde el listado filtrado.

## Decisiones tomadas

- No se cambio el schema Prisma.
- No se agregaron dependencias.
- No se implemento scoring ni estados persistidos `abierto/en seguimiento/cerrado`.
- No se agregaron graficos ni analitica compleja.
- El rango temporal se resolvio con periodos rapidos para mantener bajo costo y claridad.

## Validacion realizada

- `npm run lint`: correcto.
- `npm test`: correcto.
- `npx tsc --noEmit --pretty false`: correcto.
- `git diff --check`: correcto.
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`.
- Dev server reiniciado en `http://127.0.0.1:3000`.
- Rutas verificadas con respuesta 200:
  - `/cambios`
  - `/cambios?q=stock`
  - `/cambios?timeframe=LAST_30_DAYS`
  - `/cambios?projectId=[id]&type=STOCK_UPDATE`
  - `/cambios?listingId=[id]`
  - `/cambios/[changeId]`
  - `/cambios/[changeId]/editar`
  - `/cambios/nuevo?listingId=[id]&returnTo=[publicacion#timeline]`
  - `/publicaciones/[listingId]#timeline-causal`
- Navegador interno:
  - listado renderiza `Bitacora de cambios`, `Buscar`, `Periodo`, `Antes / despues`, `Seguimiento` y `Abrir cambio`
  - detalle renderiza `Lectura del cambio`, `Decision registrada`, `Seguimiento posterior`, `Snapshot anterior` y `Snapshot posterior`
  - formulario renderiza `Registrar cambio operativo`, `Memoria del cambio`, `Antes y despues` e `Hipotesis y contexto`
  - sin errores de consola en la verificacion

## Para revisar manualmente en frontend

- Si el listado queda con densidad adecuada en tu pantalla.
- Si la etiqueta `Lectura disponible / Con seguimiento / Sin seguimiento` comunica bien el estado de cada cambio.
- Si el menu `Mas` de cada fila resulta claro para timeline, importaciones y edicion.
- Si el detalle del cambio ayuda a entender la decision sin sentirse como ficha administrativa.
