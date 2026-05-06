# PLAN.md

## Estado general
Objetivo actual: implementar oportunidades operativas simples y explicables a partir de metricas propias, cambios registrados y contexto competitivo cargado, sin convertir el producto en una suite generica de inteligencia.

## Ajuste visual transversal - Paleta oscura
Estado: completado en esta iteracion

Objetivo:

- aplicar la paleta `Noche Mineral + Cobre`
- mejorar contraste y lectura en modo oscuro
- mantener la interfaz como herramienta operativa sobria, no como demo decorativa

Alcance:

- tema base de Tailwind y estilos globales
- shell, tarjetas, tablas, formularios, badges y estados visuales existentes
- sin cambios funcionales ni nuevas dependencias

Resultado logrado:

- paleta `Noche Mineral + Cobre` aplicada al shell y componentes base
- superficies claras reemplazadas por paneles oscuros en tablas, filtros, formularios y estados
- acento cobre reservado para acciones principales y foco

Validacion:

- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `npm run build`: bloqueado por `EPERM` de Windows al escanear carpetas protegidas del perfil del usuario, igual que en iteraciones previas
- dev server local: intento realizado, pero no llego a exponer puerto `3000` en este entorno durante la verificacion automatica

## Etapa 1 - Preparacion del repo
Estado: completada

Incluye:

- relevamiento de la carpeta actual
- estructura base de directorios
- documentacion raiz y operativa
- reglas para trabajo con Codex
- base de entorno y versionado
- inicializacion de Git local

## Etapa 2 - Scaffold de app
Estado: completada en esta iteracion

Objetivo:

- crear la app base con `Next.js + TypeScript + Tailwind`
- preparar `Prisma + SQLite`
- dejar scripts de desarrollo local
- definir shell general de navegacion

Resultado logrado:

- app ejecutable en localhost
- layout base con sidebar, header y contenedor principal
- paginas iniciales para los modulos principales
- Prisma configurado sobre SQLite local
- estructura simple preparada para crecer

Entregables principales:

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `prisma/schema.prisma`
- `src/app/`
- `src/components/`
- `src/lib/`
- `.logs/2026-04-21-scaffold-app-base.md`

## Etapa 3 - Modelo de datos del nucleo causal
Estado: completada en esta iteracion

Objetivo:

- afinar entidades del nucleo causal
- modelar proyectos, publicaciones, eventos de cambio y snapshots metricos
- dejar migraciones y seed demo consistentes con la etapa 1 local-first

Resultado esperado:

- esquema coherente con la tesis del producto
- persistencia local mantenible
- base lista para CRUD real
- datos demo utiles para explorar el MVP sin dependencias externas

Resultado logrado:

- esquema Prisma alineado al circuito causal del MVP
- migracion inicial versionada en `prisma/migrations/`
- seed demo local con proyectos, publicaciones, cambios, snapshots, competencia, insights y oportunidades
- SQLite local recreable con comandos del repo

## Etapa 4 - CRUD base
Estado: implementada en esta iteracion, pendiente de validacion visual manual en localhost

Objetivo:

- CRUD de proyectos
- CRUD de publicaciones propias
- carga y consulta de cambios operativos
- dashboard con datos reales del SQLite local
- base simple de busquedas monitoreadas y snapshots de competencia

Resultado esperado:

- primera experiencia usable para registrar memoria operativa

Resultado logrado:

- dashboard conectado a datos reales de SQLite
- listado, alta, edicion y archivado suave de proyectos
- listado, filtro por proyecto, alta, edicion y detalle de publicaciones
- listado, filtros, alta, edicion y detalle de cambios operativos
- listado, alta y detalle simple de busquedas monitoreadas

Validacion:

- `npm run lint` ejecutado correctamente
- `npm run build` queda bloqueado en este entorno por `EPERM` al intentar escanear carpetas protegidas del perfil de Windows durante webpack

## Etapa 5 - Importacion CSV
Estado: implementada en esta iteracion, pendiente de revision visual manual

Objetivo:

- importar snapshots metricos
- registrar imports CSV locales
- validar formatos y errores comunes

Resultado esperado:

- flujo local simple para cargar datos reales sin APIs externas

Alcance de la iteracion actual:

- importar metricas historicas como `ListingMetricSnapshot`
- previsualizar filas del CSV
- mapear columnas flexibles a campos internos
- validar fechas, numeros y vinculacion con publicaciones existentes
- registrar validas, invalidas y omitidas en `CsvImport.summary`
- dejar eventos de cambio CSV fuera de alcance por ahora

Resultado logrado:

- parser CSV local con deteccion de separador `,`, `;` o tab
- mapping sugerido por aliases de columnas frecuentes
- validacion de fechas, enteros, decimales y conversion con coma, punto o porcentaje
- vinculacion automatica por `listingId`, `externalId`, `sku`, titulo o referencia generica
- resolucion manual minima y opcion de crear publicaciones faltantes
- persistencia por upsert en `ListingMetricSnapshot` usando `listingId + snapshotDate`
- registro de `CsvImport` con estado `PROCESSED`, `PARTIAL` o `FAILED`
- samples CSV validos, con headers alternativos y con filas invalidas

Validacion:

- `npm run lint`: correcto
- `npm test`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `npm run build`: bloqueado por `EPERM` de Windows al escanear `C:\Users\user\Configuracion local`, mismo problema de entorno ya observado
- verificacion de persistencia: flujo validado por API durante la iteracion; al cierre, SQLite quedo bloqueado por `disk I/O error` incluso en una base aislada, por lo que conviene reiniciar procesos dev antes de una nueva prueba manual

## Etapa 6 - Timeline causal
Estado: en progreso en esta iteracion

Objetivo:

- construir la vista cronologica
- relacionar cambios con metricas antes y despues
- generar explicaciones probables con nivel de confianza

Resultado esperado:

- nucleo del MVP funcionando

Alcance de la iteracion actual:

- mejorar el detalle de publicacion como entrada al timeline causal
- combinar `ChangeEvent` y `ListingMetricSnapshot` en una secuencia cronologica simple
- mostrar resumen operativo de snapshots, cambios, ultima fecha con datos y variaciones basicas
- generar lecturas heuristicas en tiempo de consulta con categorias prudentes: probable, posible, mixta y no concluyente
- mostrar insights guardados del modelo `Insight` como memoria complementaria
- mantener la UI minima, sin graficos ni nuevas dependencias

## Etapa 7 - Competencia
Estado: implementada en esta iteracion, pendiente de revision visual manual

Objetivo:

- busquedas monitoreadas
- snapshots manuales o semi-manuales
- comparacion simple de share of shelf

Resultado esperado:

- contexto competitivo minimo sin desviar el foco principal

Alcance de la iteracion actual:

- listar, crear y editar busquedas monitoreadas
- crear snapshots manuales por fecha
- cargar resultados observados de forma manual
- vincular resultados a publicaciones propias o competidores
- listar y crear competidores de forma simple
- comparar dos snapshots de una misma busqueda
- mostrar presencia propia, presencia por competidor y cambios basicos de precio

Restricciones:

- sin scraping
- sin IA
- sin automatizaciones externas
- sin dashboards competitivos pesados

Resultado logrado:

- flujo de busquedas monitoreadas con listado, alta, edicion y detalle
- flujo de snapshots manuales por busqueda
- detalle de snapshot con carga manual de resultados observados
- vinculacion opcional de resultados a `Listing` o `Competitor`
- alta y listado simple de competidores
- comparacion entre dos snapshots de una misma busqueda
- share of shelf simple: apariciones propias, apariciones por competidor, top 5/top 10 y entradas/salidas
- helper puro de comparacion con validacion automatizada

Validacion:

- `npm run lint`: correcto
- `npm test`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- validacion Prisma temporal: correcta para crear busqueda, dos snapshots y resultados observados
- app levantada en `http://localhost:3000` contra base temporal de validacion: rutas de competencia respondieron 200
- `npm run build`: bloqueado por `EPERM` de Windows al escanear `C:\Users\user\Configuracion local`, igual que en iteraciones previas
- base local por defecto `data/market-pulse.local.db`: sigue presentando `disk I/O error` de SQLite, problema ya observado en logs previos

## Etapa 8 - Oportunidades
Estado: implementada en esta iteracion, pendiente de revision visual manual

Objetivo:

- detectar senales accionables derivadas de cambios propios y contexto externo
- clasificar oportunidades por estado y prioridad

Resultado esperado:

- capa de accion complementaria al nucleo causal

Alcance de la iteracion actual:

- listar `OpportunitySignal` con filtros por proyecto, publicacion, busqueda, severidad y estado
- generar senales mediante reglas explicitas y transparentes
- persistir senales de forma idempotente sin borrar estados revisados o descartados
- permitir marcar senales como nuevas, revisadas, descartadas o accionadas
- cubrir baja/ausencia de presencia propia, competidores que salen, concentracion competitiva, huecos de precio, cambios de top 5/top 10, publicaciones con cambios sin mejora, conversion con baja visibilidad, estancamiento, datos insuficientes y falta de seguimiento posterior

Restricciones:

- sin IA
- sin scraping
- sin scheduler
- sin scoring opaco
- UI minima basada en filtros, tabla y detalle textual

Resultado logrado:

- vista `/oportunidades` conectada a `OpportunitySignal`
- filtros por proyecto, publicacion, busqueda monitoreada, prioridad y estado
- accion manual para detectar senales
- reglas puras en `src/lib/opportunity-rules.ts`
- persistencia idempotente en `src/lib/opportunity-service.ts`
- cambio de estado por senal desde la tabla
- tests de reglas para ausencia propia, huecos de precio y cambios sin seguimiento

Validacion:

- `npm run lint`: correcto
- `npm test`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- validacion Prisma contra base temporal `tmp/opportunity-validation.db`: seed demo correcto, primera deteccion creo 6 senales nuevas y segunda deteccion creo 0 duplicados
- cambio de estado validado en base temporal de `NEW` a `REVIEWED`
- dev server temporal en `http://127.0.0.1:3010`: `/oportunidades` respondio 200 y `/oportunidades?status=REVIEWED` respondio 200
- `npm run build`: bloqueado por `EPERM` de Windows al escanear `C:\Users\user\Configuracion local`, mismo limite de entorno documentado en iteraciones previas

Limites conocidos:

- la base local por defecto `data/market-pulse.local.db` sigue mostrando `disk I/O error` de SQLite en este entorno
- la deduplicacion usa alcance + tipo + explicacion porque el schema aun no tiene `ruleKey`
- no hay conversion de senal a tarea/cambio planificado
- no hay edicion ni archivado masivo de senales
- no hay automatizacion programada

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
