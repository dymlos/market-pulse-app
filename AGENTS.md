# AGENTS.md

## Proposito del proyecto
Este repositorio contiene una app web **local-first** para analisis ecommerce, pensada primero para **Mercado Libre** y luego adaptable a otros marketplaces.

La tesis central del producto es:

> **No construir otra herramienta generica de inteligencia para Mercado Libre, sino una bitacora causal operativa que registre cambios, mida impacto y explique que probablemente paso, usando competencia y oportunidades como contexto.**

## Prioridad estrategica
Si hay dudas sobre que construir primero, la prioridad es siempre:

1. **Bitacora causal operativa**: cambios propios, metricas, timeline, explicacion probable.
2. **Contexto competitivo minimo**: snapshots manuales, busquedas monitoreadas, comparacion simple.
3. **Oportunidades operativas**: senales accionables derivadas del contexto cargado.

## Posicionamiento que no debe romperse
No convertir el producto en:

- otra suite de market intelligence para Mercado Libre
- otro dashboard generico de metricas
- otro repricer
- otro radar de productos ganadores
- otra app de optimizacion basica de publicaciones

Posicionamiento recomendado:

> **La bitacora causal de Mercado Libre para sellers y agencias: registra cambios, entiende que paso y explica por que vendiste mas o menos.**

## Principios de producto
1. Memoria + explicacion + workflow antes que mas dashboards.
2. No vender causalidad absoluta.
3. Competencia como contexto, no como nucleo inicial.
4. Oportunidades conectadas a accion y aprendizaje.
5. Local-first en etapa 1.
6. Priorizar inputs manuales, CSV y fuentes simples.
7. Mantener baja friccion para cargar datos y entender resultados.

## Alcance esperado de la etapa 1
La etapa 1 debe poder funcionar completamente en local y cubrir:

- proyectos
- publicaciones propias
- cambios registrados
- snapshots de metricas
- importacion CSV
- timeline causal
- insights heuristicos
- busquedas monitoreadas
- snapshots manuales de competencia
- oportunidades simples derivadas del contexto cargado

## Restricciones tecnicas de etapa 1
- Local-first
- Sin dependencia obligatoria de APIs externas
- Sin scraping masivo como base del MVP
- Sin multiusuario complejo ni permisos avanzados
- Sin prometer automatizacion total
- Sin arquitectura enterprise innecesaria

## Flujo obligatorio para futuros agentes / Codex
Antes de tocar codigo o estructura:

1. Leer `AGENTS.md`.
2. Leer `README.md`.
3. Leer `PLAN.md`.
4. Leer `ARCHITECTURE.md`.
5. Leer la carpeta `Documentación/`, empezando por `00-indice.md`.

Antes de implementar un bloque:

1. Actualizar `PLAN.md` si cambia el estado o el alcance.
2. Crear o actualizar un log en `.logs/`.
3. Verificar si ya existe una decision documentada para no duplicarla.

Al cerrar un bloque importante:

1. Verificar compilacion si aplica.
2. Verificar navegacion basica si aplica.
3. Registrar lo hecho en `.logs/`.
4. Dejar limites conocidos y proximos pasos.

## Reglas de implementacion
- Priorizar siempre la bitacora causal local-first como nucleo del MVP.
- No abrir frentes nuevos sin cerrar el bloque actual.
- No hacer refactors gigantes innecesarios.
- Mantener arquitectura simple, mantenible y git-friendly.
- No introducir dependencias complejas sin justificar su impacto en el MVP.
- No sobreconstruir infraestructura para escenarios que todavia no existen.
- Mantener nombres de entidades, vistas y conceptos consistentes con `Documentación/`.
- Si una decision tecnica cambia el alcance del producto, documentarla explicitamente.

## Regla de UX
La app debe sentirse como una herramienta de analisis operativa, no como una demo linda vacia.

Priorizar:

- claridad
- flujos concretos
- tablas legibles
- timelines utiles
- filtros simples
- explicaciones entendibles
- baja friccion para cargar datos

## Regla de copy
Usar lenguaje prudente, por ejemplo:

- impacto probable
- explicacion mixta
- sin evidencia suficiente
- resultado posiblemente influido por competencia
- atribucion debil / moderada / fuerte

Evitar:

- esta fue la causa exacta
- demostrado
- certeza total
- Mercado Libre hizo X sin evidencia observable

## Regla de decision cuando haya ambiguedad
Si hay que elegir entre:

- una feature vistosa de competencia
- una mejora de causalidad o memoria operativa

Elegir siempre la mejora de causalidad o memoria operativa.

## Definicion operativa del MVP ganador
El MVP ganador de este repositorio debe ayudar a responder en minutos:

> **Que tocamos esta semana, que cambio despues en ventas, visitas, conversion o posicion, que hizo la competencia y que aprendemos para la proxima accion.**

Si una implementacion no mejora esa respuesta, probablemente no sea prioridad.
