# Auditoria y cierre adicional del modulo Proyectos

Fecha: 2026-05-08

## Objetivo

Releer contexto completo del repo y auditar el modulo `Proyectos` contra el checklist de refinamiento integral pedido para dejarlo cerrado como producto de etapa 1.

## Contexto revisado

- `AGENTS.md`
- `README.md`
- `PLAN.md`
- `ARCHITECTURE.md`
- todos los archivos de `Documentación/`
- logs markdown y logs de dev en `.logs/`
- estado real de Git y archivos actuales del modulo

## Hallazgo principal

El refinamiento ya cubria casi todo el alcance, pero quedaba una inconsistencia de ciclo de vida:

- el alta no permitia `Archivado`
- existia accion de archivado con confirmacion
- pero la edicion de un proyecto activo o pausado todavia podia enviar `ARCHIVED` desde el select/server action

## Correcciones aplicadas

- La edicion de proyectos activos o pausados ya no muestra `Archivado` como opcion de estado.
- El server action `updateProject` rechaza `ARCHIVED` si el proyecto no estaba previamente archivado.
- Para archivar un proyecto activo o pausado, el usuario debe usar la accion `Archivar` con confirmacion.
- Los proyectos ya archivados conservan la posibilidad de editarse y volver al flujo si se cambia su estado.
- Se actualizo la documentacion para dejar explicita la decision.

## Validacion pendiente al crear el log

- lint
- TypeScript
- build
- rutas principales de Proyectos
- flujo visual minimo en navegador

## Validacion realizada

- `npm test`: correcto.
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `npm run db:reset` + `npm run db:seed`: correcto contra `tmp/proyectos-auditoria-validation.db`.
- Primer intento de `npm run build` fallo porque se ejecuto en paralelo con el dev server y dejo `.next` inconsistente.
- Se paro el proceso de `localhost:3000`, se elimino solo `.next` dentro del repo y se repitio build.
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`.
- Dev server reiniciado en `http://127.0.0.1:3000`.
- Rutas 200:
  - `/proyectos`
  - `/proyectos?q=Tienda`
  - `/proyectos?status=ARCHIVED`
  - `/proyectos/nuevo`
  - `/proyectos/[id]`
  - `/proyectos/[id]/editar`
  - `/publicaciones?projectId=[id]`
  - `/competencia?projectId=[id]`
  - `/importaciones?projectId=[id]`

## Verificacion visual minima

- En alta de proyecto no aparece `Archivado`.
- En edicion de un proyecto activo no aparece `Archivado`.
- El selector de moneda sigue controlado.
- El selector de marketplace muestra opciones ampliadas como Amazon, Shopify y Tiendanube.
- Los contadores de publicaciones, busquedas e imports del listado son links filtrados.

## Pendiente para revision manual del usuario

- Revisar si los chips-link de actividad se entienden como accesos o si conviene reforzarlos visualmente.
- Revisar si el detalle del proyecto queda con densidad adecuada.
- Revisar si el copy de ciclo de vida de archivado resulta claro.
