# ARCHITECTURE.md

## Objetivo arquitectonico
Preparar una app web real que corra primero en una sola PC, sin hosting obligatorio, pero que despues pueda crecer a un despliegue remoto sin reescritura total.

## Principios de arquitectura
- Local-first en la etapa 1
- Persistencia local simple y explicita
- Separacion clara entre UI, dominio y acceso a datos
- Dependencias minimas al comienzo
- Evolucion incremental, no sobrearquitectura

## Stack actual
- `Next.js` con App Router
- `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite`

## Decision de esta iteracion
Se scaffoldeo la base real de la app con el stack definido para dejar:

- entorno ejecutable en localhost
- shell de navegacion base
- estructura preparada para crecimiento incremental
- persistencia local configurada

Todavia no se implementa logica causal profunda ni automatizaciones complejas. Este bloque existe para dejar una fundacion limpia y util.

## Capas actuales
### 1. Presentacion
Responsable de:

- layout general
- navegacion principal
- vistas iniciales por modulo
- componentes visuales reutilizables

Ubicacion:

- `src/app/`
- `src/components/`

### 2. Dominio liviano
Responsable de:

- configuracion de modulos
- metadata de navegacion
- decisiones de copy y foco de producto en la UI base

Ubicacion:

- `src/lib/`

### 3. Persistencia
Responsable de:

- esquema de datos inicial
- cliente Prisma
- conexion a SQLite local

Ubicacion:

- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `data/market-pulse.db`

## Propuesta de crecimiento
### Nucleo causal
- proyectos
- publicaciones propias
- eventos de cambio
- snapshots metricos
- timeline causal
- insights probabilisticos

### Contexto competitivo minimo
- busquedas monitoreadas
- snapshots manuales de resultados
- competidores observados
- share of shelf simple por snapshot

### Oportunidades
- reglas heuristicas simples
- senales accionables
- estados de revision

## Flujo local-first esperado
En esta etapa, el flujo ideal es:

1. El usuario corre la app en localhost.
2. La app guarda datos en SQLite local.
3. Los imports entran por carga manual o CSV.
4. Los snapshots y cambios quedan disponibles para timeline e insights.
5. Todo puede probarse sin servidor publico.

## Que no hacer por ahora
- no introducir microservicios
- no separar frontend y backend sin necesidad
- no depender de colas, webhooks o scraping complejo
- no optimizar para SaaS enterprise antes de validar el MVP

## Observacion sobre UI
La interfaz base se piensa como herramienta operativa:

- desktop-first
- sobria
- legible
- preparada para tablas, timelines y filtros

No se busca una demo visual recargada, sino una base clara para trabajo diario.
