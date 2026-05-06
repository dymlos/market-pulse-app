# Iteracion 2026-05-05 - Oportunidades operativas y senales contextuales

## Alcance previsto
- Implementar una primera version usable del modulo de oportunidades.
- Reutilizar `OpportunitySignal` sin convertirlo en radar generico ni motor opaco.
- Detectar senales accionables desde cambios, metricas, busquedas monitoreadas y snapshots competitivos cargados manualmente.
- Agregar filtros, lectura de explicacion y cambio simple de estado.

## Decisiones iniciales
- No agregar IA, scraping, scheduler ni librerias nuevas.
- Separar reglas puras, persistencia, acciones server y presentacion.
- Mantener schema estable por ahora: la generacion idempotente va a comparar proyecto/publicacion/busqueda/tipo/explicacion para evitar duplicados sin agregar una columna de deduplicacion.
- No borrar senales existentes durante el recalculo para respetar estados revisados, descartados o accionados.
- Usar una accion manual de "Detectar senales" en la vista de oportunidades en lugar de mutar datos al cargar la pagina.

## Validacion planificada
- `npm run lint`
- `npm test`
- `npx tsc --noEmit --incremental false`
- Verificar generacion de senales sobre datos demo o base temporal.
- Levantar la app y comprobar que `/oportunidades` responda.

## Pendiente de completar al cierre
- Registrar reglas finales.
- Registrar criterios de severidad.
- Registrar archivos modificados.
- Documentar pasos manuales de prueba y limitaciones.

## Implementado
- Vista `/oportunidades` conectada a `OpportunitySignal`.
- Filtros por:
  - proyecto
  - publicacion
  - busqueda monitoreada
  - prioridad/severidad
  - estado
- Accion manual `Detectar senales`.
- Cambio de estado por senal desde la tabla.
- Reglas puras en `src/lib/opportunity-rules.ts`.
- Persistencia idempotente en `src/lib/opportunity-service.ts`.
- Tests simples de reglas agregados al flujo `npm test`.

## Reglas que generan oportunidades
- Busqueda monitoreada sin snapshots.
- Busqueda monitoreada sin snapshots recientes.
- Snapshot mas reciente sin resultados cargados.
- Ausencia total propia en busqueda monitoreada.
- Baja presencia propia sobre resultados observados.
- Concentracion competitiva de pocos sellers o competidores.
- Hueco visible de precio entre resultados observados.
- Competidor con disponibilidad dudosa o mencion de stock.
- Perdida de presencia propia en top 5 o top 10 entre snapshots.
- Competidor que desaparece entre dos snapshots.
- Publicacion con snapshots insuficientes.
- Cambio propio sin snapshot posterior dentro de 14 dias.
- Buena conversion con poca visibilidad.
- Metricas estancadas y pocos cambios recientes.
- Varios cambios sin mejora visible.
- Actividad operativa alta con resultados dudosos.
- Publicacion con cambios pero sin contexto competitivo reciente.

## Priorizacion
- `HIGH`: ausencia propia en busqueda monitoreada o perdida fuerte de top 5.
- `MEDIUM`: hueco de precio, salida/debilidad de competidor, actividad alta con resultados dudosos, cambios sin seguimiento o buena conversion con poca visibilidad.
- `LOW`: datos desactualizados, estancamiento suave o falta de contexto competitivo.

## Archivos principales
- `src/lib/opportunity-rules.ts`
- `src/lib/opportunity-service.ts`
- `src/lib/market-actions.ts`
- `src/lib/market-data.ts`
- `src/lib/market-labels.ts`
- `src/app/(workspace)/oportunidades/page.tsx`
- `tests/csv-import.test.mjs`
- `README.md`
- `ARCHITECTURE.md`
- `PLAN.md`

## Validacion ejecutada
- `npm run lint`: correcto.
- `npm test`: correcto.
- `npx tsc --noEmit --incremental false`: correcto.
- `npm run build`: bloqueado por `EPERM` de Windows al escanear `C:\Users\user\Configuracion local`, mismo limite ya documentado.
- Base local por defecto: sigue con `disk I/O error` de SQLite.
- Base temporal `tmp/opportunity-validation.db`:
  - schema aplicado con Prisma.
  - seed demo cargado correctamente.
  - primera deteccion: 6 senales nuevas sobre 6 candidatas.
  - segunda deteccion: 0 nuevas y 6 existentes, validando idempotencia.
  - cambio de estado validado de `NEW` a `REVIEWED`.
- Dev server temporal:
  - `/oportunidades`: 200.
  - `/oportunidades?status=REVIEWED`: 200.

## Como probar paso a paso
1. Levantar la app con `npm run dev`.
2. Abrir `http://localhost:3000/oportunidades`.
3. Usar `Detectar senales`.
4. Revisar la tabla de senales detectadas.
5. Filtrar por proyecto, publicacion, busqueda, prioridad o estado.
6. Abrir los vinculos a publicacion o busqueda cuando existan.
7. Cambiar el estado de una senal a `Revisada` o `Descartada` y guardar.
8. Volver a ejecutar `Detectar senales` para confirmar que no se duplican las mismas explicaciones.

## Limitaciones conocidas
- No hay `ruleKey` persistido; la deduplicacion actual usa alcance + tipo + explicacion.
- No se recalculan ni cierran senales viejas automaticamente.
- No hay scheduler ni deteccion automatica al entrar a la pantalla.
- No hay IA, scraping ni recomendaciones predictivas.
- La UI es funcional y basica; queda pendiente revision visual manual.
- La base local por defecto necesita resolver el `disk I/O error` del entorno antes de una prueba manual fluida.

## Siguiente paso recomendado
Conectar una senal revisada con el workflow operativo: por ejemplo convertirla en cambio planificado, nota de aprendizaje o contexto visible dentro del timeline causal de una publicacion.
