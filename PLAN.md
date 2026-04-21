# PLAN.md

## Estado general
Objetivo actual: dejar una base de repo ordenada, documentada y lista para empezar el desarrollo sin improvisacion.

## Etapa 1 - Preparacion del repo
Estado: completada en esta iteracion

Incluye:

- relevamiento de la carpeta actual
- estructura base de directorios
- documentacion raiz y operativa
- reglas para trabajo con Codex
- base de entorno y versionado
- inicializacion de Git local

Entregables de esta etapa:

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `.gitignore`
- `.env.example`
- `.codex/config.toml`
- `.logs/2026-04-21-preparacion-inicial-repo.md`
- carpetas operativas (`scripts/`, `samples/`, `tests/`, `e2e/`, `public/`, `data/`)

## Etapa 2 - Scaffold de app
Estado: pendiente

Objetivo:

- crear la app base con `Next.js + TypeScript + Tailwind`
- preparar `Prisma + SQLite`
- dejar scripts de desarrollo local

Resultado esperado:

- app ejecutable en localhost
- estructura inicial de frontend, dominio y persistencia

## Etapa 3 - Modelo de datos
Estado: pendiente

Objetivo:

- definir entidades del nucleo causal
- modelar proyectos, publicaciones, eventos de cambio y snapshots metricos
- preparar semillas o datos de ejemplo si hace falta

Resultado esperado:

- esquema coherente con la tesis del producto
- persistencia local mantenible

## Etapa 4 - CRUD base
Estado: pendiente

Objetivo:

- CRUD de proyectos
- CRUD de publicaciones propias
- carga y consulta de cambios operativos

Resultado esperado:

- primera experiencia usable para registrar memoria operativa

## Etapa 5 - Importacion CSV
Estado: pendiente

Objetivo:

- importar snapshots metricos
- importar eventos de cambio si aplica
- validar formatos y errores comunes

Resultado esperado:

- flujo local simple para cargar datos reales sin APIs externas

## Etapa 6 - Timeline causal
Estado: pendiente

Objetivo:

- construir la vista cronologica
- relacionar cambios con metricas antes y despues
- generar explicaciones probables con nivel de confianza

Resultado esperado:

- nucleo del MVP funcionando

## Etapa 7 - Competencia
Estado: pendiente

Objetivo:

- busquedas monitoreadas
- snapshots manuales o semi-manuales
- comparacion simple de share of shelf

Resultado esperado:

- contexto competitivo minimo sin desviar el foco principal

## Etapa 8 - Oportunidades
Estado: pendiente

Objetivo:

- detectar senales accionables derivadas de cambios propios y contexto externo
- clasificar oportunidades por estado y prioridad

Resultado esperado:

- capa de accion complementaria al nucleo causal

## Etapa 9 - Pruebas y hardening
Estado: pendiente

Objetivo:

- pruebas unitarias y e2e donde aporte valor
- validaciones de importacion y persistencia
- mejoras de robustez y DX

Resultado esperado:

- base confiable para seguir iterando

## Regla de priorizacion
Si aparece una duda entre construir algo vistoso de competencia o fortalecer causalidad, memoria operativa o carga local de datos:

Elegir siempre lo segundo.
