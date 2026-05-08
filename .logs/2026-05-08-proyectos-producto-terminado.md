# Refinamiento integral del modulo Proyectos

Fecha: 2026-05-08

## Objetivo

Cerrar el modulo `Proyectos` como una seccion de producto mas clara, navegable y consistente dentro de la etapa 1 local-first.

## Alcance previsto

- aclarar el concepto de proyecto como espacio de trabajo para marca, seller o cuenta operativa
- mejorar copy visible en listado, alta y edicion
- reducir friccion del formulario con defaults y campos controlados
- impedir `Archivado` como estado inicial
- mejorar validaciones y feedback
- agregar busqueda y filtros basicos
- hacer el proyecto mas navegable y con mas contexto operativo
- separar mejor archivar de eliminar, sin agregar borrado

## Decisiones iniciales

- No se cambia el modelo Prisma: `ARCHIVED` sigue existiendo como estado de ciclo de vida.
- El refinamiento se limita a `Proyectos` y a enlaces minimos hacia modulos existentes.
- No se agregan dependencias nuevas.

## Mejoras implementadas

- Se aclaro el concepto de proyecto como espacio de trabajo para marca, seller o cuenta operativa.
- Se mejoro el copy de `/proyectos`, `/proyectos/nuevo`, `/proyectos/[id]` y `/proyectos/[id]/editar`.
- El formulario quedo dividido en `Identidad y contexto` y `Configuracion operativa`.
- `Marketplace`, `Moneda` y `Estado` tienen defaults razonables.
- El selector de marketplace fue ampliado con opciones regionales y plataformas ecommerce frecuentes.
- `Moneda` paso de input libre a select controlado.
- `Archivado` ya no aparece como estado posible al crear un proyecto.
- El servidor rechaza un alta con estado `ARCHIVED` aunque llegue manipulado por formulario.
- La validacion de `Nombre` ahora cubre vacio y longitud minima.
- Al crear o editar, el usuario vuelve al detalle del proyecto, no a una lista generica.
- El listado suma busqueda por nombre, filtro por estado y filtro por marketplace.
- Las filas muestran contexto operativo: publicaciones, busquedas, imports y actualizado relativo + exacto.
- Los contadores de publicaciones, busquedas e imports del listado ahora son accesos directos filtrados por proyecto.
- El nombre del proyecto y la accion principal abren el detalle.
- `Editar`, `Ver publicaciones` y `Archivar` quedan como acciones secundarias en un menu simple.
- El archivado pide confirmacion y explica que conserva historial.
- Se agrego la vista de detalle del proyecto con identidad, conteos, publicaciones recientes, cambios recientes, busquedas, imports y ciclo de vida.
- El detalle del proyecto suma accesos rapidos a publicaciones, busquedas e imports filtrados.
- `Importaciones` acepta `projectId`, filtra el historial y preselecciona el proyecto en el panel de importacion.
- Los indicadores tecnicos del header se relegaron a `Configuracion local`.

## Decisiones tomadas

- No se implemento eliminacion: archivar conserva memoria y evita romper relaciones con publicaciones, cambios, imports y contexto competitivo.
- No se agrego una alerta compleja de cambios sin guardar; se dejo aviso textual en el formulario para no meter logica global de navegacion.
- No se agregaron migraciones: el schema actual ya soporta la mejora.
- No se agregaron filtros complejos ni ordenamientos avanzados para mantener el modulo liviano.
- No se tocaron competencia, oportunidades ni importaciones salvo enlaces de navegacion hacia flujos existentes.

## Adaptaciones por restricciones

- La busqueda del listado se limita a nombre, como pidio el alcance, y no busca en notas.
- La vista de detalle usa datos existentes y conteos simples; no crea nuevas entidades ni nuevas metricas.
- El filtro de marketplace combina opciones conocidas con marketplaces ya presentes en la base.

## Validacion realizada

- lint
- TypeScript
- build
- seed o consulta Prisma basica
- rutas principales del modulo Proyectos

Resultado:

- `npm test`: correcto
- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- `npm run db:reset` + `npm run db:seed`: correctos contra `tmp/proyectos-validation.db`
- rutas `/proyectos`, `/proyectos?q=Tienda`, `/proyectos?status=ARCHIVED`, `/proyectos/nuevo`, `/proyectos/[id]`, `/proyectos/[id]/editar` y `/publicaciones?projectId=[id]`: 200
- navegador interno: listado, filtro con resultado, filtro sin resultado, alta sin `Archivado`, edicion con moneda controlada y detalle del proyecto

## Pendiente para revision manual frontend

- Revisar si la densidad del detalle del proyecto se siente adecuada en tu pantalla grande.
- Revisar si el menu `Mas` en tabla te resulta suficientemente claro o preferis otro patron visual.
- Revisar copy fino de las ayudas del formulario.

## Criterio de cierre

El modulo `Proyectos` queda cerrado para etapa 1 como base organizativa navegable, con alta, edicion, listado, filtros, detalle, feedback y archivado coherentes con el producto local-first.
