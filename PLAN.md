# PLAN.md

## Estado general
Objetivo actual: convertir la base tecnica ejecutable en una herramienta usable para registrar proyectos, publicaciones y cambios operativos con persistencia local.

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
