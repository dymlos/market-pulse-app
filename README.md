# Market Pulse

Market Pulse es una app web **local-first** pensada para analisis operativo de ecommerce, empezando por Mercado Libre.

La tesis del producto no es construir otra suite generica de inteligencia competitiva, sino una **bitacora causal operativa** que ayude a responder:

> Que cambiamos, que paso despues, que otro contexto pudo influir y que aprendemos para la siguiente accion.

## Estado actual del repositorio
Esta iteracion deja preparado el terreno del proyecto:

- estructura base de carpetas
- documentacion operativa
- convenciones para Codex
- muestras CSV
- configuracion inicial de entorno y versionado

Todavia **no se scaffoldeó la app** ni hay una interfaz ejecutable en esta etapa. Eso queda explicitamente separado para la siguiente iteracion para no sobreconstruir antes de validar la base documental, el roadmap y la arquitectura.

## Stack base recomendado
Para la siguiente etapa se recomienda:

- `Next.js` + `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite` local
- `pnpm` como package manager recomendado

Motivos:

- corre muy bien en local
- sirve para CRUD, imports CSV, timelines y vistas operativas
- Prisma + SQLite simplifican persistencia local-first
- permite crecer despues a un deploy real sin rehacer toda la app

## Estructura actual
```text
.
|-- .codex/
|   `-- config.toml
|-- .logs/
|   `-- 2026-04-21-preparacion-inicial-repo.md
|-- Documentación/
|   |-- 00-indice.md
|   |-- 01-vision-y-tesis-del-producto.md
|   |-- 02-resumen-ejecutivo-analisis-competitivo.md
|   |-- 03-posicionamiento-y-mvp-recomendado.md
|   |-- 04-alcance-funcional-de-la-app.md
|   |-- 05-arquitectura-etapa-1-local-first.md
|   |-- 06-roadmap-por-fases.md
|   |-- 07-riesgos-y-principios-de-diseno.md
|   |-- 08-glosario-y-definiciones.md
|   `-- 09-guia-para-prompts-en-codex.md
|-- data/
|   `-- README.md
|-- e2e/
|   `-- README.md
|-- public/
|   `-- README.md
|-- samples/
|   |-- README.md
|   `-- csv/
|       |-- change-events.sample.csv
|       |-- competitor-snapshot.sample.csv
|       `-- metric-snapshots.sample.csv
|-- scripts/
|   `-- README.md
|-- tests/
|   `-- README.md
|-- .env.example
|-- .gitignore
|-- AGENTS.md
|-- ARCHITECTURE.md
|-- PLAN.md
`-- README.md
```

## Como trabajar localmente hoy
En esta etapa el repositorio es principalmente documental y de preparacion. El flujo local recomendado es:

1. Leer `README.md`, `AGENTS.md`, `PLAN.md`, `ARCHITECTURE.md` y `Documentación/`.
2. Usar la siguiente iteracion de Codex para scaffoldear la app respetando esta base.
3. Mantener logs de trabajo en `.logs/` y actualizar `PLAN.md` por bloque.

Cuando se haga el scaffold de la app, el objetivo sera correrla principalmente en localhost con un flujo similar a este:

```bash
pnpm install
pnpm dev
```

Si preferis `npm`, se puede soportar tambien, pero la recomendacion inicial queda en `pnpm`.

## Ejecucion local vs futura publicacion
**Ejecucion local** significa:

- desarrollo y prueba principal en tu PC
- base de datos local SQLite
- sin depender de hosting ni servidor publico
- posibilidad de iterar rapido con datos de prueba, CSV y snapshots manuales

**Publicacion futura** significa:

- empaquetar la misma app web para un entorno remoto
- eventualmente mover persistencia y secretos a una infraestructura apropiada
- decidir si se despliega solo el frontend o la app completa con backend y base remota

La arquitectura propuesta apunta a que esa transicion sea posible **sin rehacer todo**.

## GitHub no reemplaza hosting
Dejo esto explicito porque es importante para el roadmap:

- GitHub sirve para versionado, colaboracion, issues, PRs y CI.
- GitHub **no reemplaza** un hosting real para una app dinamica con UI interactiva, rutas servidoras y persistencia.
- Subir el codigo a GitHub no vuelve automaticamente accesible la app como producto web.

## Preview o demo estatica opcional
Como opcion futura, se podria agregar alguno de estos caminos sin forzar la arquitectura a ser estatica:

- una landing o documentacion estatica publicada con GitHub Pages
- una demo estatica muy acotada para mostrar pantallas mockeadas
- Storybook o snapshots visuales si despues hacen falta componentes aislados

Eso puede servir para comunicar o revisar UI, pero **no debe empujar el proyecto a convertirse en una app puramente estatica** si eso perjudica el roadmap local-first con persistencia real.

## Como seguir trabajando con Codex
Para futuras iteraciones:

1. Pedir bloques funcionales claros y cerrados.
2. Indicar siempre que lea `AGENTS.md` y `Documentación/`.
3. Pedir que actualice `PLAN.md` y `.logs/`.
4. Mantener el foco en bitacora causal antes que inteligencia competitiva generica.

Ejemplos de siguientes prompts razonables:

- scaffoldear la app base con Next.js, TypeScript, Tailwind, Prisma y SQLite
- definir el modelo de datos del nucleo causal
- crear CRUD inicial de proyectos y publicaciones
- preparar importacion CSV de snapshots metricos

## Commits de checkpoints
Para guardar avances intermedios de forma prolija:

```bash
git status
git add -A
git commit -m "chore: checkpoint repo base"
```

Mas adelante conviene usar mensajes mas especificos, por ejemplo:

- `chore: scaffold next app`
- `feat: add project and listing CRUD`
- `feat: add csv metric import`
- `docs: refine architecture and roadmap`

## Preparacion para GitHub
El nombre esperado del repositorio remoto es:

- `market-pulse`

Si el entorno tiene `gh` instalado y autenticado, se puede crear el remoto privado y empujar `main`.
Si no, este repo igual queda listo para hacerlo manualmente despues.
