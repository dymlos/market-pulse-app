# Iteracion 2026-05-05 - Hardening, QA y cierre de etapa 1

## Alcance previsto
- Revisar flujos criticos de etapa 1: proyectos, publicaciones, cambios, importacion CSV, timeline, competencia y oportunidades.
- Corregir fragilidades puntuales sin abrir nuevos frentes.
- Mejorar validaciones server-side y mensajes de error entendibles.
- Ajustar seed/demo si hace falta para que la etapa 1 sea demostrable localmente.
- Agregar pruebas utiles de bajo costo.
- Actualizar README, PLAN y este log con resultados, limites y criterio de cierre.

## Linea base inicial
- `npm test`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- Git inicial: branch `main`, sin cambios previos.

## Decisiones iniciales
- Mantener competencia como contexto manual acotado, no como suite competitiva.
- No tocar estilos salvo lo indispensable para feedback y estados basicos.
- Validar datos en server actions para evitar errores silenciosos o pantallas rotas ante IDs invalidos o numeros negativos.
- Verificar base y seed preferentemente contra base temporal si la base local por defecto sigue bloqueada por el entorno.

## Problemas corregidos
- Las acciones principales dependian demasiado de supuestos optimistas: IDs validos, proyectos activos y numeros bien formados.
- Varias acciones podian fallar con errores tecnicos de Prisma o quedar como fallas poco entendibles para el usuario.
- El importador CSV podia quedar fragil ante caidas de red local, respuestas no JSON o respuestas incompletas.
- README recomendaba archivos `samples/csv/`, pero las muestras no estaban disponibles para probar la demo.
- El seed no dejaba una comparacion competitiva suficientemente clara porque habia pocos snapshots comparables y pocos resultados observados.

## Validaciones agregadas
- Proyecto activo requerido para crear o editar publicaciones, busquedas monitoreadas y competidores.
- Existencia de publicacion requerida antes de registrar o editar cambios.
- Existencia de busqueda monitoreada requerida antes de crear snapshots competitivos.
- Precio actual y precio observado validados como numeros no negativos.
- Stock disponible validado como entero no negativo.
- Posicion observada validada como entero mayor o igual a 1.
- Actualizacion de oportunidades ahora informa si la senal ya no existe.
- Importacion CSV ahora muestra errores comprensibles ante problemas de conexion local o respuesta inesperada.
- Se agregaron samples CSV reales: valido, headers alternativos y filas invalidas.

## Seed y demo local
- El seed demo quedo con 1 proyecto, 3 publicaciones, 9 snapshots metricos, 6 cambios, 2 busquedas monitoreadas, 4 snapshots competitivos, 20 resultados observados, 3 competidores, 2 imports demo, 3 insights y 2 senales iniciales.
- Las busquedas monitoreadas ahora tienen snapshots antes/despues para probar comparaciones, entradas, salidas y cambios de precio.
- Se valido una importacion CSV real contra la app local con resultado `PROCESSED`.

## Pruebas agregadas
- Resumen de metricas por publicacion: deltas first-to-last.
- Comparacion de snapshots: competidores desaparecidos.
- Oportunidades: salida visible de competidor.

## Comandos de validacion
- `npm test`: correcto, 13 tests.
- `npm run lint`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `npm run build`: correcto al ejecutar con `HOME` y `USERPROFILE` aislados dentro de `tmp/home`.
- `npm run db:reset`: correcto contra base temporal fuera del sandbox.
- `npm run db:seed`: correcto contra base temporal fuera del sandbox.
- Rutas principales en `http://127.0.0.1:3000` tras reiniciar dev server limpio: dashboard, proyectos, publicaciones, cambios, importaciones, competencia, snapshot competitivo, oportunidades y configuracion respondieron 200.
- API preview CSV: 200 con mapping sugerido.
- API preview CSV con `samples/csv/metric-snapshots.sample.csv`: 200.
- API importacion CSV: 200 con resultado `PROCESSED`.

## Limitaciones conocidas
- Dentro del sandbox de Codex, SQLite sigue fallando con `disk I/O error`; fuera del sandbox la base temporal valida correctamente.
- En este entorno Windows, `npm run build` puede fallar si Next hereda `HOME` o `USERPROFILE` del perfil real y trata de tracear carpetas protegidas como `Configuracion local`.
- Las oportunidades siguen siendo heuristicas prudentes y no causalidad estadistica.
- La competencia sigue siendo carga manual, sin scraping ni automatizacion externa.
- La UI queda funcional para demo, pero pendiente de revision visual manual fina.

## Criterio de cierre de etapa 1
La etapa 1 queda cerrada funcionalmente para demo local-first: el nucleo de memoria operativa, metricas, cambios, timeline causal, contexto competitivo manual, comparacion de snapshots, oportunidades y cambio de estado esta conectado, probado de forma razonable y documentado.
