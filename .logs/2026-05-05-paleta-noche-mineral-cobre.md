# Paleta Noche Mineral + Cobre

## Objetivo
Aplicar una paleta oscura con mejor contraste antes de avanzar con nuevos bloques funcionales.

## Decision
Se elige `Noche Mineral + Cobre` para reforzar una experiencia de herramienta operativa:

- fondo principal: `#0E1111`
- sidebar: `#090B0B`
- paneles: `#171B1A`
- panel destacado: `#202725`
- bordes: `#333D39`
- texto principal: `#F2F5F3`
- texto secundario: `#AAB4AF`
- acento principal: `#C08457`
- evidencia/contexto: `#5EEAD4`
- oportunidad: `#FACC15`
- caida/riesgo: `#F87171`
- mejora: `#4ADE80`

## Alcance previsto
- Ajustar tokens de color en Tailwind.
- Reemplazar superficies claras por paneles oscuros.
- Mantener contraste alto en tablas, formularios, badges y mensajes.
- No modificar flujos ni datos.

## Implementado
- Se actualizaron tokens de Tailwind para `canvas`, `shell`, `panel`, `panel-raised`, `ink`, `muted`, `line`, `accent`, `info`, `warning`, `danger` y `success`.
- Se cambio el `color-scheme` global a dark y se reemplazo el fondo beige por una base mineral oscura.
- Se ajustaron sidebar, header, metric cards, section cards, badges, tablas, mensajes, formularios y botones principales.
- Se reemplazaron superficies `white`/`slate` claras por paneles oscuros en las paginas principales existentes.
- Se mantuvo el alcance en UI visual; no se agregaron dependencias ni funcionalidades.

## Validacion
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `npm run build`: bloqueado por `EPERM` al escanear carpetas protegidas del perfil de Windows (`C:\Users\user\Configuración local` / `C:\Users\user\Cookies`), mismo limite ya documentado en bloques previos.
- Dev server: se intento levantar `localhost:3000`, pero Next no llego a dejar un puerto escuchando durante la verificacion automatica de esta sesion.

## Limites
- Esta iteracion no rediseña la estructura visual completa.
- La validacion visual manual en navegador queda recomendada al cierre.
