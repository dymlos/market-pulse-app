# Iteracion 2026-05-07 - Dashboard navegable e iconos

## Alcance previsto
- Convertir los indicadores del dashboard en accesos directos a las secciones correspondientes.
- Agregar iconos a los indicadores y a la navegacion lateral, tomando mas inspiracion estructural de EROSAI.
- Mantener la mejora acotada a orientacion visual y navegacion.

## Decision inicial
- Usar `lucide-react`, la misma familia de iconos usada en EROSAI, como dependencia liviana para reforzar la UI sin dibujar SVGs manuales.
- No cambiar datos, servicios ni reglas de negocio.

## Resultado logrado
- Los cuatro indicadores del dashboard ahora son accesos directos:
  - `Proyectos` -> `/proyectos`
  - `Publicaciones` -> `/publicaciones`
  - `Cambios recientes` -> `/cambios`
  - `Busquedas` -> `/competencia`
- Se agregaron iconos a esos indicadores.
- Se agregaron iconos a la navegacion lateral para acercar la estructura visual al proyecto EROSAI.
- Se agrego `lucide-react` como dependencia liviana.

## Archivos modificados
- `package.json`
- `package-lock.json`
- `src/app/(workspace)/dashboard/page.tsx`
- `src/components/ui/metric-card.tsx`
- `src/components/layout/app-shell.tsx`
- `PLAN.md`
- `.logs/2026-05-07-dashboard-navegable-iconos.md`

## Validacion
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `git diff --check`: correcto.
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados dentro de `tmp/home`.
- Dev server reiniciado limpio en `http://127.0.0.1:3000`.
- Rutas principales de los cards:
  - `/dashboard`: 200
  - `/proyectos`: 200
  - `/publicaciones`: 200
  - `/cambios`: 200
  - `/competencia`: 200

## Observaciones para revision manual
- Confirmar que cada card del dashboard navega al modulo esperado al hacer click.
- Confirmar que los iconos de sidebar y dashboard mejoran orientacion sin sobrecargar la pantalla.
- Si se desea mas cercania con EROSAI, el siguiente ajuste visual deberia concentrarse en botones, tablas y estados vacios, no en nuevos flujos.
