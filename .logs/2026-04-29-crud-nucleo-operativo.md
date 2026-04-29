# Iteracion 2026-04-29 - CRUD nucleo operativo

## Alcance previsto
- Implementar flujo usable para proyectos, publicaciones y cambios operativos usando Prisma y SQLite local.
- Actualizar dashboard para que lea datos reales.
- Agregar una version minima de competencia con busquedas monitoreadas y lectura de snapshots existentes.
- Mantener la app local-first, sin IA, scraping, predicciones ni analisis causal complejo.

## Decisiones iniciales
- Priorizar formularios simples y tablas legibles sobre visualizaciones complejas.
- Usar soft delete para proyectos mediante estado `ARCHIVED`, porque conserva memoria operativa y evita borrar publicaciones/cambios por accidente.
- Separar consultas y acciones de persistencia en `src/lib/` para no mezclar la UI con acceso a datos.

## Pendiente de completar al cierre
- Registrar pantallas implementadas.
- Registrar validaciones ejecutadas.
- Dejar limites conocidos y proximo paso hacia timeline causal.

## Implementado
- Dashboard con conteos reales de proyectos, publicaciones, cambios recientes y busquedas monitoreadas.
- CRUD operativo de proyectos:
  - listado
  - alta
  - edicion
  - archivado suave mediante `ProjectStatus.ARCHIVED`
  - cantidad de publicaciones asociadas
- Flujo de publicaciones:
  - listado con filtro por proyecto
  - alta
  - edicion
  - detalle con proyecto, ultimos cambios y ultimos snapshots metricos
- Flujo de cambios `ChangeEvent`:
  - listado
  - filtros por proyecto, publicacion y tipo
  - alta rapida
  - edicion basica
  - detalle simple con valores, comentario, responsable e hipotesis
- Competencia minima:
  - listado de `TrackedSearch`
  - alta de busqueda monitoreada
  - detalle con lista de `SearchSnapshot`

## Decisiones tomadas
- Se mantuvo competencia como contexto minimo, sin scraping ni analisis competitivo profundo.
- Se separaron lecturas en `src/lib/market-data.ts` y mutaciones en `src/lib/market-actions.ts`.
- Se usaron server actions de Next para formularios simples y persistencia con Prisma.
- Se evito borrado fisico de proyectos para conservar memoria operativa.
- Se reemplazo `next/font/google` por fuentes del sistema para reducir dependencia externa y friccion local.

## Validacion ejecutada
- `npm run lint`: correcto.
- `npm run build`: bloqueado por `EPERM` de Windows durante webpack al intentar escanear carpetas protegidas del perfil del usuario (`C:\Users\user\Configuración local` / `C:\Users\user\Cookies`). No llego a reportar errores de TypeScript de la app.

## Flujo usable
- Crear un proyecto.
- Crear una publicacion asociada al proyecto.
- Registrar un cambio operativo sobre la publicacion.
- Ver el cambio en dashboard, listado de cambios y detalle de la publicacion.
- Crear una busqueda monitoreada y ver snapshots existentes si los hay.

## Pendiente
- Validacion visual/manual en localhost.
- Resolver o aislar el problema de `next build` con el escaneo de carpetas protegidas de Windows.
- Siguiente bloque funcional: timeline causal simple con ventana antes/despues y copy prudente de impacto probable.
