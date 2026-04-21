# Arquitectura de etapa 1 (local-first)

## Filosofía técnica
La etapa 1 debe ser **usable localmente en una sola PC**, sin necesidad de servidor ni dependencias complejas.

## Stack recomendado
- Next.js
- TypeScript
- Tailwind
- Prisma
- SQLite local
- Git
- Codex como asistente de desarrollo

## Motivo de este stack
- rápido de levantar
- simple para iterar con Codex
- suficiente para CRUD, timelines, importaciones y vistas comparativas
- fácil de migrar más adelante a una base o deploy más grande

## Módulos técnicos esperados
### Datos propios
- proyectos
- publicaciones
- eventos de cambio
- snapshots métricos
- insights

### Competencia
- búsquedas monitoreadas
- snapshots de búsqueda
- resultados observados
- competidores

### Oportunidades
- reglas simples
- señales guardadas
- estado revisada / descartada / pendiente

## Restricciones técnicas importantes
- No depender de webhooks públicos en etapa 1
- No asumir disponibilidad estable de scraping
- No bloquear el flujo si faltan integraciones externas
- Priorizar importación manual o CSV

## Filosofía de fuentes de datos
En etapa 1, el orden de preferencia es:
1. Carga manual
2. CSV / exportaciones
3. Google Sheets u hojas similares
4. Integraciones externas futuras

## Principio de diseño técnico
Si una solución hace el proyecto más frágil y no aumenta mucho el valor del MVP, evitarla.
