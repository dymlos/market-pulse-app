# Iteracion 2026-05-05 - Timeline causal por publicacion

## Alcance previsto
- Mejorar el detalle de publicacion para que sea la entrada principal al timeline causal.
- Unificar `ChangeEvent` y `ListingMetricSnapshot` en una lectura cronologica simple.
- Agregar resumen operativo de metricas y cambios.
- Implementar una primera capa de insights heuristicos sin IA ni causalidad estadistica fuerte.
- Usar `Insight` como memoria complementaria cuando existan lecturas guardadas.

## Decisiones iniciales
- Generar las lecturas heuristicas en tiempo de consulta para evitar jobs o pipelines prematuros.
- Mantener `Insight` como lecturas guardadas/manuales existentes, sin persistir automaticamente cada lectura heuristica en esta iteracion.
- Separar acceso a datos, motor heuristico y presentacion.
- Evitar graficos y dependencias nuevas: la visualizacion sera tabla/timeline textual.
- Mantener copy prudente: impacto probable, posible influencia, lectura mixta o sin evidencia suficiente.

## Validacion planificada
- `npm run lint`
- `npm test`
- `npx tsc --noEmit --incremental false`
- verificar que el detalle de una publicacion real cargue datos desde SQLite local
- intentar levantar la app localmente y abrir el flujo si el entorno lo permite

## Pendiente de completar al cierre
- Registrar archivos implementados.
- Documentar reglas heuristicas finales.
- Documentar niveles de confianza.
- Registrar limitaciones y pasos manuales de prueba.
