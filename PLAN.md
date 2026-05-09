# PLAN.md

## Estado general
Objetivo actual: cerrar la etapa 1 con hardening, QA, validaciones minimas, demo local confiable y documentacion operativa clara, sin abrir nuevos frentes de producto.

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
Estado: completada en esta iteracion

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

## Etapa 9 - Hardening, QA y cierre de etapa 1
Estado: completada en esta iteracion

Objetivo:

- revisar flujos criticos de etapa 1
- corregir fallas o fragilidades sin refactors masivos
- mejorar validaciones y errores entendibles
- asegurar que el seed deje una demo local clara
- ampliar pruebas donde aporten mas valor con bajo costo
- documentar como levantar, regenerar base y probar la demo

Resultado esperado:

- etapa 1 consistente, usable y demostrable localmente

Alcance de la iteracion actual:

- formularios y server actions del nucleo operativo
- importacion CSV de snapshots metricos
- timeline causal por publicacion
- competencia acotada con snapshots comparables
- oportunidades operativas y cambio de estado
- README, PLAN y log de cierre

Restricciones:

- sin IA
- sin scraping
- sin nuevos modulos
- sin rediseño visual ni refactor frontend grande

Resultado logrado:

- validaciones server-side agregadas para proyectos, publicaciones, cambios, busquedas monitoreadas, snapshots, resultados observados y estado de oportunidades
- errores no silenciosos para IDs inexistentes, proyectos archivados, numeros invalidos, posiciones repetidas y acciones sobre entidades faltantes
- importador CSV mas robusto ante errores de red local, respuestas no JSON y respuestas incompletas
- samples CSV reales agregados para demo: valido, headers alternativos y filas invalidas
- seed demo ajustado con snapshots competitivos comparables y resultados observados suficientes para probar comparaciones y oportunidades
- README actualizado con setup desde cero, regeneracion de base, flujo recomendado de demo y limitaciones actuales
- pruebas ampliadas para resumen de metricas, comparacion de snapshots y senales de oportunidad

Validacion:

- `npm test`: correcto
- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `npm run build`: correcto al aislar `HOME` y `USERPROFILE` dentro de `tmp/home`, evitando el `EPERM` de Windows al escanear carpetas protegidas del perfil
- `npm run db:reset`: correcto contra base temporal fuera del sandbox
- `npm run db:seed`: correcto contra base temporal fuera del sandbox
- app levantada en `http://127.0.0.1:3000` contra base temporal de validacion, con dev server reiniciado limpio despues del build
- rutas principales de dashboard, proyectos, publicaciones, cambios, importaciones, competencia, snapshot competitivo, oportunidades y configuracion respondieron 200
- API de preview CSV respondio 200 con mapping sugerido
- API de importacion CSV respondio 200 con resultado `PROCESSED`

Limites conocidos:

- el sandbox de Codex sigue generando `disk I/O error` con SQLite; la validacion real de base se hizo fuera del sandbox contra una base temporal local
- en este Windows, `npm run build` puede fallar si Next hereda `HOME` o `USERPROFILE` del perfil del usuario y trata de tracear carpetas protegidas como `Configuracion local`
- las oportunidades siguen siendo heuristicas prudentes, no causalidad estadistica
- la competencia sigue siendo contexto manual, sin scraping ni automatizacion externa
- la UI queda funcional y coherente para demo, pero pendiente de revision visual manual fina

## Seccion de ayuda operativa
Estado: completada en esta iteracion

Objetivo:

- agregar una seccion interna de ayuda que funcione como manual de uso de etapa 1
- explicar que se puede hacer en cada modulo sin convertirlo en documentacion tecnica extensa
- mantener la ayuda como soporte operativo de la demo local-first

Alcance:

- nueva ruta de ayuda dentro del workspace
- entrada en la navegacion principal
- resumen por seccion: objetivo, acciones disponibles, flujo recomendado y limites

Restricciones:

- sin nuevos flujos de producto
- sin IA, scraping ni automatizaciones
- sin rediseño visual grande

Resultado logrado:

- nueva ruta `/ayuda` con manual operativo por seccion
- entrada `Ayuda` agregada a la navegacion principal
- recorrido recomendado de demo de punta a punta
- explicacion por modulo de acciones disponibles, flujo sugerido y limites

Validacion:

- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `/ayuda` respondio 200 en dev server local

## Ajuste de shell y UI base inspirado en EROSAI
Estado: completada en esta iteracion

Objetivo:

- corregir la barra lateral para que todos los modulos sean accesibles con scroll
- tomar inspiracion estructural y visual del proyecto EROSAI sin copiar su dominio ni abrir nuevos frentes
- mejorar densidad, jerarquia y consistencia del shell para continuar QA manual por secciones

Alcance:

- layout general del workspace
- navegacion lateral y encabezado superior
- componentes visuales base compartidos
- estilos globales de fondo y scroll

Restricciones:

- sin cambios de producto ni datos
- sin IA, scraping ni automatizaciones
- mantener la app como herramienta operativa sobria

Resultado logrado:

- sidebar agrupada por `Principal`, `Nucleo causal`, `Contexto` y `Sistema`
- barra lateral con scroll interno para que todos los modulos sean accesibles en pantallas bajas
- navegacion mas compacta, inspirada en la estructura de EROSAI
- top bar separada del sidebar y contenido principal sin ancho maximo artificial
- paneles base, metric cards, headers y tablas ajustados a una estetica mas densa y consistente
- scrollbar global estilizado para modo oscuro

Validacion:

- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `git diff --check`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- dev server en `http://127.0.0.1:3000`
- rutas `/dashboard`, `/proyectos`, `/publicaciones`, `/cambios`, `/importaciones`, `/competencia`, `/oportunidades`, `/ayuda` y `/configuracion`: 200

## Dashboard navegable e iconografia operativa
Estado: completada en esta iteracion

Objetivo:

- hacer que los indicadores del dashboard funcionen como accesos directos a sus secciones
- sumar iconografia inspirada en EROSAI para mejorar orientacion visual
- mantener el dashboard como panel operativo, no como dashboard generico pesado

Alcance:

- metric cards del dashboard
- navegacion lateral
- dependencia liviana de iconos si hace falta

Restricciones:

- sin cambios de datos ni flujos nuevos
- sin IA, scraping ni rediseño profundo de paginas internas

Resultado logrado:

- indicadores del dashboard convertidos en links a `/proyectos`, `/publicaciones`, `/cambios` y `/competencia`
- iconos agregados a los indicadores del dashboard
- iconos agregados a la navegacion lateral
- `lucide-react` incorporado como dependencia liviana, siguiendo la referencia de EROSAI
- dev server reiniciado limpio despues del build para evitar chunks mezclados de Next

Validacion:

- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `git diff --check`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- rutas `/dashboard`, `/proyectos`, `/publicaciones`, `/cambios` y `/competencia`: 200 despues de reiniciar dev server

## Ajustes UX en Proyectos
Estado: completada en esta iteracion

Objetivo:

- corregir detalles detectados durante la revision manual de `Proyectos`
- mejorar claridad de formulario, labels, feedback y acciones sensibles
- mantener la seccion como base organizativa del MVP

Alcance:

- pagina `/proyectos`
- paginas de crear/editar proyecto
- formulario de proyecto
- mensaje contextual del header superior

Restricciones:

- sin cambios de datos ni arquitectura
- sin abrir nuevos modulos
- sin rediseño profundo fuera de la correccion detectada

Resultado logrado:

- placeholder de nombre reemplazado por ejemplo generico
- marketplace mostrado como label legible (`Mercado Libre`) en listado y formulario
- mensaje de exito agregado para creacion, actualizacion y archivado
- header superior ahora usa descripcion contextual de la seccion activa
- formulario de proyecto limitado a un ancho operativo en desktop
- boton de archivado con tono de advertencia y copy mas explicito

Validacion:

- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `git diff --check`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- dev server reiniciado limpio en `http://127.0.0.1:3000`
- rutas `/proyectos`, `/proyectos?updated=1`, `/proyectos/nuevo`, `/proyectos/[id]/editar` y `/dashboard`: 200

## Refinamiento integral del modulo Proyectos
Estado: completada en esta iteracion

Objetivo:

- cerrar el modulo `Proyectos` como una seccion de producto mas clara, navegable y consistente
- aclarar el concepto de proyecto como espacio de trabajo para marca, seller o cuenta operativa
- reducir friccion en alta/edicion sin cambiar el modelo de datos
- mejorar listado, filtros, acciones, estados vacios y ciclo de vida

Alcance:

- copy visible de `/proyectos`, alta, edicion y detalle
- formulario de proyecto
- listado con busqueda y filtros simples
- navegacion hacia una vista de contexto del proyecto
- confirmacion de archivado y feedback de acciones

Restricciones:

- sin IA
- sin scraping
- sin nuevos modulos
- sin migraciones salvo necesidad real
- sin redisenar el sistema completo

Resultado logrado:

- copy del modulo ajustado para explicar `Proyecto` como espacio de trabajo de marca, seller o cuenta operativa
- formulario de alta/edicion reorganizado en identidad/contexto y configuracion operativa
- marketplace, moneda y estado con defaults razonables
- moneda convertida en select controlado
- estado `Archivado` bloqueado en alta y mantenido como estado posterior de ciclo de vida
- edicion de proyectos activos/pausados ya no permite usar `Archivado` como atajo sin confirmacion
- validacion server-side mas clara para nombre obligatorio y nombre demasiado corto
- alta redirige al detalle del proyecto para dejar un siguiente paso util
- listado con busqueda por nombre, filtro por estado y filtro por marketplace
- filas enriquecidas con publicaciones, busquedas monitoreadas, imports y fecha relativa + exacta
- contadores de publicaciones, busquedas e imports convertidos en accesos filtrados por proyecto
- proyecto navegable por nombre y accion principal `Abrir`
- acciones secundarias movidas a menu simple
- archivado separado de la edicion normal, con confirmacion y copy que aclara que conserva memoria
- nueva vista de detalle del proyecto con identidad, conteos, actividad reciente y ciclo de vida
- detalle del proyecto con accesos rapidos a publicaciones, busquedas e imports filtrados
- `Importaciones` acepta `projectId`, filtra historial y preselecciona proyecto
- indicadores tecnicos del header relegados a `Configuracion local`

Validacion:

- `npm test`: correcto
- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- `npm run db:reset` + `npm run db:seed`: correctos contra `tmp/proyectos-validation.db`
- rutas `/proyectos`, `/proyectos?q=Tienda`, `/proyectos?status=ARCHIVED`, `/proyectos/nuevo`, `/proyectos/[id]`, `/proyectos/[id]/editar` y `/publicaciones?projectId=[id]`: 200
- navegador interno: validado listado, filtros, alta sin opcion `Archivado`, edicion con moneda controlada y detalle del proyecto
- auditoria adicional: validado que edicion de proyecto activo no muestra `Archivado` y que los accesos a publicaciones, busquedas e imports son links filtrados

## Refinamiento integral del modulo Publicaciones
Estado: completada en esta iteracion

Objetivo:

- cerrar `Publicaciones` como unidad de analisis operativo de etapa 1
- mejorar listado, busqueda, filtros, acciones y senales de seguimiento
- reforzar el detalle como lugar donde convergen cambios, snapshots, timeline y lectura probable
- ordenar formularios y validaciones sin cambiar el modelo de datos

Alcance previsto:

- copy visible de `/publicaciones`, alta, edicion y detalle
- listado con busqueda por titulo, SKU o ID externo
- filtros simples por proyecto, estado y condicion operativa
- filas con ultimo cambio, ultimo snapshot, frescura y accion principal clara
- detalle con resumen superior mas informativo, metricas mejor explicadas, insights mas legibles y timeline mas claro
- formularios de publicacion y cambio con microcopy operativo y validaciones razonables

Restricciones:

- sin IA
- sin scraping
- sin nuevos modulos
- sin migraciones salvo necesidad real
- sin refactor visual general del sistema

Resultado logrado:

- copy del modulo ajustado para presentar `Publicaciones` como unidad de analisis operativo
- listado con busqueda por titulo, SKU e ID externo
- filtros por proyecto, estado y condicion operativa
- filas enriquecidas con conteos, ultimo cambio, ultimo snapshot, senales y estado de seguimiento
- accion principal renombrada a `Abrir analisis`
- accion `Registrar cambio` queda visible y edicion/importacion/timeline quedan en menu secundario
- estado vacio mejorado con CTA a crear publicacion o importar metricas
- detalle con resumen superior de estado, proyecto, precio/stock, ultimo cambio, ultimo snapshot, seguimiento y lectura actual
- boton redundante `Ver timeline` removido del detalle
- resumen de metricas aclara que compara primer snapshot visible vs ultimo snapshot cargado
- insights muestran `confianza baja/media/alta` y ocultan el bloque de guardados cuando no hay contenido
- timeline causal reemplazado por secuencia visual diferenciada entre cambios manuales y snapshots metricos
- formularios de alta/edicion reorganizados en identidad, seguimiento y contexto
- formulario de cambio reorganizado como memoria operativa con antes/despues e hipotesis
- validacion server-side agregada para URL de publicacion
- marketplace de `Listing` alineado al marketplace del proyecto

Validacion:

- `npm test`: correcto
- `npm run lint`: correcto
- `npx tsc --noEmit --incremental false`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- `npm run db:reset` + `npm run db:seed`: correctos contra `tmp/publicaciones-validation.db`
- rutas `/publicaciones`, busqueda, filtros, detalle, edicion, alta, cambio nuevo e importaciones filtradas: 200
- navegador interno: validado listado, filtro por busqueda, detalle, formularios de publicacion/cambio y ausencia del boton redundante `Ver timeline`
- flujo real en base temporal: crear publicacion, editarla y registrar cambio conectado

## Refinamiento integral del modulo Cambios
Estado: completada en esta iteracion

Objetivo:

- cerrar `Cambios` como bitacora operativa central de etapa 1
- reforzar que cada cambio registra accion, fecha, intencion, contexto y antes/despues
- conectar mejor cada cambio con Publicaciones, timeline causal e importaciones
- mostrar si ya hay snapshots posteriores para revisar impacto probable

Alcance:

- copy visible de listado, alta, edicion y detalle
- busqueda por descripcion, comentario, hipotesis, responsable, publicacion, SKU o ID externo
- filtros por proyecto, publicacion, tipo y periodo rapido
- listado enriquecido con antes/despues y estado de seguimiento calculado
- detalle narrativo con decision, hipotesis, contexto y snapshots alrededor del cambio
- formulario con mejores ayudas y validaciones server-side

Restricciones:

- sin IA
- sin scraping
- sin nuevas migraciones
- sin scoring complejo ni estados persistidos nuevos
- sin rediseño general del sistema

Resultado logrado:

- la pantalla ahora se presenta como `Bitacora de cambios`
- el listado incorpora buscador y filtro de periodo (`ultimos 7 dias`, `ultimos 30 dias`, `este mes`)
- las filas muestran tipo, detalle, responsable/comentario, publicacion, antes/despues y seguimiento posterior
- la accion principal paso de `Detalle` a `Abrir cambio`
- acciones secundarias conectan con timeline causal, importaciones y edicion
- el estado de seguimiento se calcula desde snapshots:
  - `Sin seguimiento`: no hay snapshot posterior
  - `Con seguimiento`: hay snapshot posterior
  - `Lectura disponible`: hay snapshot anterior y posterior
- el detalle muestra decision registrada, hipotesis, contexto operativo y snapshots anterior/posterior
- el formulario refuerza memoria operativa, ejemplos de antes/despues y placeholders mas accionables
- se agregaron validaciones para fecha futura, descripcion minima y pares antes/despues incompletos cuando el tipo lo amerita
- los accesos desde Publicaciones hacia nuevo cambio vuelven al timeline causal de la publicacion cuando corresponde

Validacion:

- `npm run lint`: correcto
- `npm test`: correcto
- `npx tsc --noEmit --pretty false`: correcto
- `git diff --check`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- dev server reiniciado en `http://127.0.0.1:3000`
- rutas `/cambios`, busqueda, periodo, filtros por proyecto/tipo, filtro por publicacion, detalle, edicion, alta con retorno y publicacion/timeline: 200
- navegador interno: validado listado, detalle y formulario sin errores de consola

## Refinamiento de Carga de datos / Importaciones
Estado: completada en esta iteracion

Objetivo:

- reforzar `Importaciones` como entrada de evidencia local para el nucleo causal
- mejorar el flujo CSV sin abrir nuevas fuentes ni cambiar el modelo de datos
- hacer que el resultado de una carga deje acciones claras hacia Publicaciones e historial
- enriquecer el historial para entender que entro, que fallo y que queda pendiente

Alcance:

- copy visible de `/importaciones`
- panel de carga CSV, preview, mapping y resultado
- historial de `CsvImport` con filtros y resumen operativo
- navegacion, ayuda y documentacion

Restricciones:

- sin IA
- sin scraping
- sin nuevas migraciones
- sin importar nuevos tipos de CSV fuera de snapshots metricos
- sin convertir la seccion en un modulo de analisis paralelo

Resultado logrado:

- la navegacion muestra `Carga de datos`, manteniendo la ruta `/importaciones`
- la pantalla explica que el CSV alimenta Publicaciones, Cambios, timeline causal e insights
- el panel de importacion muestra pasos, formato recomendado y sample local sugerido
- el mapping de columnas tiene ayudas contextuales y obligatoriedad mas clara
- la opcion de crear publicaciones faltantes aclara que crea registros minimos para completar despues
- el resultado post-importacion oculta IDs tecnicos y muestra filas, rango de snapshots, publicaciones afectadas, errores y acciones siguientes
- las acciones post-importacion conectan con publicaciones con metricas, historial filtrado y nueva carga
- el historial suma filtros por archivo/proyecto, proyecto, estado y periodo
- cada fila del historial muestra evidencia cargada, rango de fechas, publicaciones afectadas, observaciones y detalle expandible
- `CsvImport.summary` guarda metadata extendida para nuevas cargas sin cambiar el schema

Validacion:

- `npm run lint`: correcto
- `npm test`: correcto
- `npx tsc --noEmit --pretty false`: correcto
- `git diff --check`: correcto
- `npm run build`: correcto con `HOME` y `USERPROFILE` aislados en `tmp/home`
- dev server reiniciado en `http://127.0.0.1:3000`
- rutas `/importaciones`, `/importaciones?status=PROCESSED`, `/importaciones?q=sample` y `/importaciones?projectId=[id]&timeframe=LAST_30_DAYS`: 200
- API preview CSV: 200 con 3 filas validas sobre sample local
- API importacion CSV: validada con proyecto temporal y borrado posterior; resultado `PROCESSED`, 2 filas guardadas, 2 publicaciones afectadas y rango de fechas persistido en `CsvImport.summary`
- navegador interno: `/importaciones` renderizo `Carga de datos`, flujo guiado e historial sin errores de consola

## Regla de priorizacion
Si aparece una duda entre construir algo vistoso de competencia o fortalecer causalidad, memoria operativa o carga local de datos:

Elegir siempre lo segundo.
