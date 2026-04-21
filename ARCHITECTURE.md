# ARCHITECTURE.md

## Objetivo arquitectonico
Preparar una app web real que corra primero en una sola PC, sin hosting obligatorio, pero que despues pueda crecer a un despliegue remoto sin reescritura total.

## Principios de arquitectura
- Local-first en la etapa 1.
- Persistencia local simple y explicita.
- Separacion clara entre UI, logica de dominio y acceso a datos.
- Dependencias minimas al comienzo.
- Evolucion incremental, no sobrearquitectura.

## Stack propuesto para la siguiente etapa
- `Next.js` con App Router
- `TypeScript`
- `Tailwind CSS`
- `Prisma`
- `SQLite`

## Por que este stack
- Permite una app web moderna con buena experiencia local.
- Prisma + SQLite son suficientes para el MVP local-first.
- Next.js permite convivir con UI, rutas servidoras, imports y futuras necesidades de despliegue.
- El stack es razonable para trabajar de forma iterativa con Codex.

## Decision de esta iteracion
Todavia **no se scaffoldea** la app.

Razon:

- primero convenia fijar contexto, reglas, roadmap y arquitectura
- evita generar codigo base que despues haya que desarmar
- mantiene limpia la separacion entre preparacion del repo y construccion del producto

## Propuesta de capas
### 1. Capa de presentacion
Responsable de:

- vistas operativas
- formularios
- tablas
- timelines
- filtros
- feedback de importaciones

Tecnologia prevista:

- `src/app/`
- componentes UI en `src/components/`
- features por dominio en `src/features/`

### 2. Capa de dominio
Responsable de:

- reglas de negocio
- heuristicas causales
- validacion de imports
- calculo de ventanas antes/despues
- clasificacion de insights

Tecnologia prevista:

- servicios y casos de uso en `src/lib/` o `src/features/<dominio>/`
- esquemas y validaciones con librerias livianas solo si realmente aportan

### 3. Capa de persistencia
Responsable de:

- esquema de datos
- consultas locales
- migraciones
- acceso a snapshots y eventos

Tecnologia prevista:

- `prisma/schema.prisma`
- archivo SQLite local en `data/market-pulse.db`

## Modulos funcionales previstos
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
En etapa 1, el flujo ideal es:

1. El usuario corre la app en localhost.
2. La app guarda datos en SQLite local.
3. Los imports entran por carga manual o CSV.
4. Los snapshots y cambios quedan disponibles para timeline e insights.
5. Todo puede probarse sin servidor publico.

## Estrategia de crecimiento
Esta arquitectura deberia permitir luego:

- mover SQLite a Postgres si el producto escala
- desplegar la misma app en un hosting real
- agregar autenticacion o multiusuario mas adelante
- sumar integraciones externas sin romper el flujo manual base

## Que no hacer por ahora
- no introducir microservicios
- no separar frontend y backend sin necesidad
- no depender de colas, webhooks o scraping complejo
- no optimizar para SaaS enterprise antes de validar el MVP

## Preview o demo estatica
Si mas adelante hace falta una salida estatica, deberia limitarse a:

- documentacion
- landing
- demo visual acotada

No deberia condicionar la arquitectura del producto principal, que sigue pensada como app web real con persistencia.
