# Iteracion 2026-05-07 - Ajustes UX en Proyectos

## Alcance previsto
- Corregir seis puntos detectados durante la revision manual de la seccion `Proyectos`.
- Mejorar claridad sin cambiar modelo de datos ni abrir nuevos flujos.

## Puntos a corregir
- Placeholder confuso del campo `Nombre`.
- Marketplace visible como valor tecnico.
- Falta de feedback al volver con `?updated=1`.
- Header superior demasiado generico para cada seccion.
- Formulario demasiado estirado en desktop ancho.
- Accion `Archivar` demasiado parecida a acciones normales.

## Decisiones iniciales
- Reusar `FormMessage` agregandole tonos para exito/error.
- Agregar helper de labels para marketplace, sin migrar datos.
- Limitar ancho del formulario de proyecto desde el componente de formulario.
- Mantener el archivado como server action existente, pero darle tono de advertencia.

## Resultado logrado
- Placeholder de `Nombre` cambiado de `Tienda Andina Outdoor` a `Ej. Marca outdoor Argentina`.
- `Marketplace` se muestra como `Mercado Libre` en listado y formulario, manteniendo el valor interno `mercado-libre`.
- Se agregaron mensajes de exito en `/proyectos` para:
  - proyecto creado
  - proyecto actualizado
  - proyecto archivado
- El header superior del shell ahora usa la descripcion contextual de la seccion activa, en lugar de un texto generico fijo.
- El formulario de proyecto quedo limitado a `max-w-5xl` para evitar inputs excesivamente largos en desktop ancho.
- El boton `Archivar` paso a tono de advertencia y copy `Archivar proyecto`, con aclaracion en `title`.

## Archivos modificados
- `src/app/(workspace)/proyectos/page.tsx`
- `src/components/forms/project-form.tsx`
- `src/components/layout/app-shell.tsx`
- `src/components/ui/form-message.tsx`
- `src/lib/market-labels.ts`
- `PLAN.md`
- `.logs/2026-05-07-proyectos-ux-ajustes.md`

## Validacion
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `git diff --check`: correcto.
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados dentro de `tmp/home`.
- Dev server reiniciado limpio en `http://127.0.0.1:3000`.
- Rutas verificadas:
  - `/proyectos`: 200
  - `/proyectos?updated=1`: 200
  - `/proyectos/nuevo`: 200
  - `/proyectos/cmokeb7iu0000vauselkz0mmw/editar`: 200
  - `/dashboard`: 200

## Observaciones de QA manual
- Verificar visualmente que el mensaje verde de exito no compita demasiado con el listado.
- Confirmar si `Archivar proyecto` se entiende mejor o si luego conviene sumar confirmacion modal.
- La lista de marketplaces sigue acotada al MVP y no pretende cubrir integraciones reales.
