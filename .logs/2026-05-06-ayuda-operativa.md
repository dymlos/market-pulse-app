# Iteracion 2026-05-06 - Seccion de ayuda operativa

## Alcance previsto
- Agregar una seccion interna de ayuda/manual para explicar que se puede hacer en cada parte de la app.
- Integrarla a la navegacion principal sin abrir nuevos frentes de producto.
- Mantener el tono operativo: memoria, cambios, metricas, contexto competitivo manual y oportunidades.
- Validar que la ruta compile y que la app siga consistente.

## Decisiones iniciales
- Implementar la ayuda como pagina estatica local en `/ayuda`.
- Reusar componentes existentes (`PageHeader`, `SectionCard`) para no sumar estilos ni refactors visuales.
- Evitar documentacion tecnica profunda dentro de la app; el foco es guiar al usuario en la demo y en el uso diario.

## Resultado logrado
- Se agrego la ruta `/ayuda` como manual operativo interno.
- Se agrego `Ayuda` a la navegacion principal.
- La pagina cubre dashboard, proyectos, publicaciones, cambios, importaciones, competencia, oportunidades y configuracion.
- Cada modulo incluye acciones disponibles, flujo sugerido y limites.
- Se agrego un checklist corto para probar la demo local de punta a punta.

## Archivos modificados
- `src/app/(workspace)/ayuda/page.tsx`
- `src/lib/navigation.ts`
- `README.md`
- `PLAN.md`
- `.logs/2026-05-06-ayuda-operativa.md`

## Validacion
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `git diff --check`: correcto.
- Dev server local levantado en `http://127.0.0.1:3000`.
- `/ayuda`: respondio 200.

## Limites conocidos
- Es ayuda estatica; no detecta automaticamente el estado de datos cargados.
- No reemplaza el README tecnico para setup, comandos y regeneracion de base.
- No agrega nuevos flujos de producto; solo documenta los existentes.
