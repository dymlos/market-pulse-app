# Guía para prompts en Codex

## Regla general
Los prompts deben ser **grandes, claros y orientados a bloques funcionales**, no microtareas sueltas.

## Cada prompt debería pedir
- leer `AGENTS.md`
- leer `Documentación/`
- revisar `PLAN.md`
- crear o actualizar un log en `.logs/`
- implementar un bloque coherente de punta a punta
- compilar / verificar
- resumir lo hecho

## Qué recordar siempre en los prompts
- El foco principal es causalidad operativa
- Competencia y oportunidades entran como contexto o capas posteriores
- No abrir frentes innecesarios
- Mantener la etapa 1 local-first
- Preferir soluciones simples y mantenibles

## Frases útiles para encauzar a Codex
### Para evitar dispersión
- “No abras un frente nuevo. Terminá solo lo pedido.”
- “Priorizá claridad y ejecución local sobre sofisticación.”
- “No conviertas esto en una suite general de inteligencia competitiva.”

### Para reforzar la tesis del producto
- “Recordá que el núcleo del MVP es la bitácora causal operativa.”
- “Competencia y oportunidades son contexto, no producto principal en esta etapa.”
- “No prometas causalidad exacta; usá explicaciones probables con nivel de confianza.”

### Para cerrar bien cada bloque
- “Verificá que compile.”
- “Documentá decisiones y límites.”
- “Indicá próximos pasos concretos.”
