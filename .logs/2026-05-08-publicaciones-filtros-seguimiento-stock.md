# Iteracion: Refinar filtros de Publicaciones - Estado de seguimiento + Stock

Fecha: 2026-05-08

## Objetivo

Separar la semantica del filtro que antes aparecia como "Condicion" en el listado de Publicaciones. Ese nombre podia confundirse con condicion ecommerce del producto (nuevo/usado), pero en realidad agrupaba seguimiento operativo, presencia de metricas, senales y stock.

## Cambios implementados

- Se reemplazo el filtro visible "Condicion" por "Estado de seguimiento".
- El filtro de seguimiento ahora muestra estas opciones:
  - Todas
  - Con cambios registrados
  - Sin cambios registrados
  - Con metricas cargadas
  - Sin metricas cargadas
  - Con senales activas
- Se saco "Stock bajo" del filtro de seguimiento.
- Se agrego un filtro separado llamado "Stock" con:
  - Todos
  - Stock bajo
- Se mantuvo compatibilidad con URLs viejas que usaban `dataState=LOW_STOCK` o `dataState=WITH_OPPORTUNITIES`.

## Logica de filtrado

- "Con cambios registrados": publicaciones con al menos un `ChangeEvent`.
- "Sin cambios registrados": publicaciones sin `ChangeEvent`.
- "Con metricas cargadas": publicaciones con al menos un `ListingMetricSnapshot`.
- "Sin metricas cargadas": publicaciones sin `ListingMetricSnapshot`.
- "Con senales activas": publicaciones con `OpportunitySignal` en estado `NEW` o `REVIEWED`.
- "Stock bajo": publicaciones con `availableStock <= 5`. La regla ya existia de forma implicita en el filtro anterior y ahora quedo centralizada como umbral explicito.

## Decisiones

- No se modifico el modelo de datos ni se agregaron dependencias.
- No se redisenio la tabla ni la jerarquia visual del modulo.
- Se separaron los parametros nuevos como `trackingState` y `stockState`, dejando `dataState` solo como compatibilidad interna.

## Validacion realizada

- `npx tsc --noEmit --pretty false`: OK.
- `npm test`: OK.
- `npm run lint`: OK.
- `npm run build`: bloqueado por el limite de entorno ya documentado en iteraciones previas. Next intento escanear `C:\Users\user\Datos de programa` y fallo con `EPERM` antes de reportar errores de la app.
- Se reinicio el servidor local de Next porque el intento de build dejo `.next` incompleto para la instancia dev.
- Rutas verificadas con respuesta 200:
  - `/publicaciones`
  - `/publicaciones?trackingState=WITH_CHANGES`
  - `/publicaciones?trackingState=WITHOUT_CHANGES`
  - `/publicaciones?trackingState=WITH_SNAPSHOTS`
  - `/publicaciones?trackingState=WITHOUT_SNAPSHOTS`
  - `/publicaciones?trackingState=WITH_ACTIVE_OPPORTUNITIES`
  - `/publicaciones?stockState=LOW_STOCK`
  - `/publicaciones?q=Mate&trackingState=WITH_SNAPSHOTS&stockState=LOW_STOCK`
  - `/publicaciones?dataState=LOW_STOCK`
- Verificacion en navegador local: el formulario renderiza "Estado de seguimiento", "Con metricas cargadas", "Con senales activas", "Stock" y "Stock bajo" sin errores de consola.

## Para revisar manualmente en frontend

- Que el formulario de filtros del listado de Publicaciones se vea legible en desktop.
- Que "Estado de seguimiento" no se confunda con estado/condicion del producto.
- Que "Stock bajo" aparezca separado y pueda combinarse con busqueda, proyecto y estado.
