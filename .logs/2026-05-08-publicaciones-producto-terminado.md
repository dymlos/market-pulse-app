# Refinamiento integral del modulo Publicaciones

Fecha: 2026-05-08

## Objetivo

Cerrar `Publicaciones` como una seccion de producto terminada para etapa 1: la unidad de analisis donde convergen cambios propios, snapshots metricos, timeline causal y lectura probable.

## Alcance previsto

- mejorar copy visible del listado, alta, edicion y detalle
- sumar busqueda por titulo, SKU e ID externo
- sumar filtros simples por proyecto, estado y condicion operativa
- enriquecer filas con ultimo cambio, ultimo snapshot y estado de seguimiento
- mejorar jerarquia de acciones: analisis primero, cambio segundo, edicion como secundaria
- fortalecer resumen superior del detalle
- aclarar narrativa de metricas, insights y timeline
- ordenar formularios y validar inputs sensibles

## Decisiones iniciales

- No se cambia el schema Prisma.
- No se agrega IA, scraping, scheduler ni nuevas dependencias.
- No se abre un modulo nuevo: los links van a flujos existentes como cambios e importaciones.
- El refinamiento visual queda acotado a Publicaciones y componentes propios de ese modulo.

## Contexto revisado

- `AGENTS.md`
- `README.md`
- `PLAN.md`
- `ARCHITECTURE.md`
- todos los archivos de `Documentacion/`
- logs markdown y logs de dev en `.logs/`
- estado real de Git
- pantallas, componentes y helpers actuales de Publicaciones, timeline, insights, cambios e importaciones

## Estado al iniciar

- El listado existia, pero se leia como tabla administrativa.
- La busqueda solo filtraba por proyecto.
- La accion principal decia `Detalle`, sin comunicar valor de analisis.
- La columna `Datos` solo mostraba conteos.
- El detalle ya tenia timeline, insights y snapshots, pero el resumen superior era basico.
- El boton `Ver timeline` era redundante porque el timeline vive en la misma pagina.
- Los formularios funcionaban, pero necesitaban mejor copy, agrupacion y ayudas.
- La validacion server-side de precio y stock existia; faltaba validar URL de link.

## Plan inicial

- Implementar mejoras.
- Validar lint, tests, TypeScript, build y rutas principales.
- Actualizar README, ARCHITECTURE y PLAN con resultado final.
- Registrar decisiones, limites y revision manual sugerida.

## Mejoras implementadas

- El listado de `Publicaciones` se reposiciono como seguimiento operativo, no como tabla administrativa.
- Se agrego busqueda por titulo, SKU e ID externo.
- Se agregaron filtros por proyecto, estado y condicion operativa:
  - con cambios
  - sin cambios
  - con snapshots
  - sin snapshots
  - stock bajo
  - con senales
- Las filas muestran precio/stock, conteos, ultimo cambio, ultimo snapshot y estado de seguimiento.
- La accion principal paso de `Detalle` a `Abrir analisis`.
- `Registrar cambio` queda como accion secundaria visible.
- `Editar datos`, `Importar metricas` e `Ir al timeline` quedan en menu secundario.
- El estado vacio empuja a crear publicacion o importar metricas.
- El detalle suma un resumen superior con proyecto, estado, precio/stock, ultimo cambio, ultimo snapshot, seguimiento y lectura heuristica actual.
- Se elimino el boton redundante `Ver timeline` del detalle.
- El resumen de metricas ahora explica que compara primer snapshot visible contra ultimo snapshot cargado.
- Si faltan snapshots suficientes, el detalle empuja a importar metricas.
- Los insights usan `confianza baja/media/alta` y ocultan el bloque de insights guardados cuando no hay datos.
- El timeline se convirtio en una secuencia visual que diferencia cambios manuales y snapshots metricos.
- El formulario de publicacion se reorganizo en identidad operativa, seguimiento operativo y contexto.
- El formulario de cambio se reorganizo como memoria operativa, con antes/despues e hipotesis.
- Se agrego validacion server-side para links de publicacion.
- El marketplace de la publicacion se alinea al marketplace del proyecto para evitar inconsistencias.

## Decisiones tomadas

- No se agrego vista nueva ni modulo nuevo: el analisis sigue viviendo en el detalle de publicacion.
- No se agrego scoring complejo de atencion. El listado usa senales simples: snapshots ausentes, cambio sin seguimiento, datos desactualizados y stock bajo.
- No se agregaron graficos ni dependencias visuales nuevas.
- No se cambio el schema Prisma.
- No se implemento borrado ni archivado especifico de publicaciones en esta iteracion.

## Adaptaciones por restricciones

- La condicion `seguimiento desactualizado` se muestra como estado de lectura, pero no se agrego como filtro para no complejizar consultas por ultimo snapshot en esta etapa.
- Los links hacia snapshots apuntan al timeline/detalle porque no existe una pantalla separada de snapshots metricos.
- El flujo de imports sigue filtrado por proyecto, no por publicacion individual, porque la UI actual de importaciones trabaja a nivel proyecto.

## Validacion realizada

- `npm test`: correcto.
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`.
- `npm run db:reset` + `npm run db:seed`: correctos contra `tmp/publicaciones-validation.db`.
- Dev server levantado en `http://127.0.0.1:3000` contra `tmp/publicaciones-validation.db`.
- Rutas verificadas por HTTP:
  - `/publicaciones`
  - `/publicaciones?q=Mate`
  - `/publicaciones?dataState=WITH_SNAPSHOTS`
  - `/publicaciones?projectId=[id]&status=ACTIVE&dataState=LOW_STOCK`
  - `/publicaciones/[listingId]`
  - `/publicaciones/[listingId]/editar`
  - `/publicaciones/nueva?projectId=[id]`
  - `/cambios/nuevo?listingId=[id]`
  - `/importaciones?projectId=[id]`
- Navegador interno:
  - listado con buscador, filtros y acciones visibles
  - filtro por busqueda `Mate`
  - detalle con resumen, metricas, insights y timeline
  - alta de publicacion con grupos de campos
  - formulario de cambio con grupos de memoria operativa
- Flujo real validado en base temporal:
  - crear publicacion
  - editar publicacion
  - registrar cambio vinculado a esa publicacion
- Al cierre se detuvo el dev server temporal y se reinicio `http://127.0.0.1:3000` en modo normal con `.env`.

## Pendiente para revision manual frontend

- Revisar densidad de la tabla de publicaciones en tu pantalla grande.
- Confirmar si el menu `Mas` te resulta claro para edicion, importaciones y timeline.
- Revisar si el estado de seguimiento por fila comunica bien prioridad sin necesitar un scoring.
- Revisar copy fino de ayudas en formularios.

## Criterio de cierre

El modulo `Publicaciones` queda cerrado para etapa 1 como unidad de analisis operativo: listado con busqueda/filtros, detalle con resumen causal, timeline legible, insights prudentes, formularios claros y acciones conectadas a cambios e importaciones.
