# Iteracion 2026-05-07 - Shell y UI base inspirado en EROSAI

## Alcance previsto
- Corregir el problema de la barra lateral que no permitia ver ni scrollear todos los modulos.
- Revisar el proyecto EROSAI en `F:\Desktop\FLOR\IA FLOR` como referencia estructural y visual.
- Ajustar el shell de Market Pulse para que sea mas denso, legible y consistente antes de retomar la revision manual por secciones.

## Referencia tomada de EROSAI
- Sidebar con grupos claros.
- Navegacion mas compacta, con item activo bien marcado.
- Layout principal con sidebar + top bar + contenido.
- Scroll global y local mas cuidado.
- Superficies oscuras sobrias, bordes finos y sombra contenida.

## Decisiones iniciales
- Mantener la paleta de Market Pulse (`Noche Mineral + Cobre`) en lugar de copiar la paleta violeta de EROSAI.
- No agregar nuevas areas de producto.
- Priorizar estructura y usabilidad sobre microinteracciones.
- No depender de iconos externos si la mejora se puede resolver con componentes existentes y texto compacto.

## Resultado logrado
- Se compacto la navegacion lateral para evitar tarjetas demasiado altas por item.
- Se agruparon los modulos en `Principal`, `Nucleo causal`, `Contexto` y `Sistema`.
- Se agrego scroll interno a la barra lateral con `overflow-y-auto`, manteniendo el sidebar sticky en desktop.
- Se separo el shell en sidebar + top bar + contenido principal, siguiendo la estructura general de EROSAI.
- Se elimino el ancho maximo artificial del shell para aprovechar mejor el espacio horizontal.
- Se ajustaron `PageHeader`, `SectionCard`, `MetricCard` y `DataTablePreview` hacia paneles mas compactos.
- Se agregaron estilos globales de scrollbar en modo oscuro.

## Archivos modificados
- `src/components/layout/app-shell.tsx`
- `src/lib/navigation.ts`
- `src/app/globals.css`
- `src/components/ui/page-header.tsx`
- `src/components/ui/section-card.tsx`
- `src/components/ui/metric-card.tsx`
- `src/components/ui/data-table-preview.tsx`
- `PLAN.md`
- `.logs/2026-05-07-shell-ui-erosai.md`

## Validacion
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `git diff --check`: correcto.
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados dentro de `tmp/home`.
- Dev server local en `http://127.0.0.1:3000`.
- Rutas principales verificadas por HTTP:
  - `/dashboard`: 200
  - `/proyectos`: 200
  - `/publicaciones`: 200
  - `/cambios`: 200
  - `/importaciones`: 200
  - `/competencia`: 200
  - `/oportunidades`: 200
  - `/ayuda`: 200
  - `/configuracion`: 200

## Limites conocidos
- El ajuste toma inspiracion estructural de EROSAI, pero conserva la paleta y el posicionamiento de Market Pulse.
- No se reviso visualmente cada pagina una por una; queda para el QA manual posterior.
- No se agregaron iconos externos para evitar sumar dependencias solo por estetica.
