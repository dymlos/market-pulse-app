import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

type HelpSection = {
  id: string;
  title: string;
  route: string;
  summary: string;
  actions: string[];
  recommendedFlow: string[];
  limits: string[];
};

const helpSections: HelpSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    route: "/dashboard",
    summary:
      "Punto de entrada para entender rapidamente cuanta memoria operativa hay cargada y que paso recientemente.",
    actions: [
      "Ver cantidad de proyectos, publicaciones, cambios recientes y busquedas monitoreadas.",
      "Abrir cambios recientes para revisar que se toco y sobre que publicacion.",
      "Saltar a publicaciones nuevas o proyectos recientes desde los enlaces.",
    ],
    recommendedFlow: [
      "Entrar despues de levantar la demo local.",
      "Revisar si hay cambios recientes.",
      "Abrir una publicacion con actividad para mirar su timeline causal.",
    ],
    limits: [
      "No es un dashboard exhaustivo de metricas.",
      "Resume actividad local; no consulta APIs externas.",
    ],
  },
  {
    id: "proyectos",
    title: "Proyectos",
    route: "/proyectos",
    summary:
      "Agrupa el trabajo por seller, marca, cliente o cuenta. Todo lo demas cuelga de un proyecto.",
    actions: [
      "Crear un proyecto nuevo.",
      "Editar nombre, descripcion, marketplace, pais, moneda y estado.",
      "Archivar proyectos sin perder la memoria ya cargada.",
      "Filtrar listados por proyecto desde otros modulos.",
    ],
    recommendedFlow: [
      "Crear primero el proyecto si vas a cargar datos propios.",
      "Usar nombres claros para poder leer la demo sin contexto externo.",
      "Archivar solo cuando ya no quieras usarlo como base activa.",
    ],
    limits: [
      "No hay multiusuario ni permisos avanzados.",
      "El archivado conserva datos; no es borrado definitivo.",
    ],
  },
  {
    id: "publicaciones",
    title: "Publicaciones",
    route: "/publicaciones",
    summary:
      "Base de publicaciones propias. Es el centro para cambios, snapshots metricos, timeline causal e insights.",
    actions: [
      "Crear publicaciones propias con external id, SKU, titulo, categoria, marca, precio y stock.",
      "Editar datos operativos de una publicacion.",
      "Abrir el detalle para ver metricas, insights heuristicos y timeline.",
      "Usar la publicacion como referencia en cambios, CSV y resultados competitivos.",
    ],
    recommendedFlow: [
      "Cargar una publicacion por SKU o external id reconocible.",
      "Registrar cambios sobre esa publicacion.",
      "Importar snapshots metricos historicos.",
      "Volver al detalle para ver el timeline causal.",
    ],
    limits: [
      "Las metricas no se sincronizan solas.",
      "El timeline explica impacto probable, no causalidad absoluta.",
    ],
  },
  {
    id: "cambios",
    title: "Cambios",
    route: "/cambios",
    summary:
      "Bitacora de acciones propias: precio, titulo, fotos, stock, pauta, promociones u otros cambios operativos.",
    actions: [
      "Registrar un cambio con fecha, tipo, detalle, hipotesis y notas.",
      "Editar cambios existentes.",
      "Abrir el detalle de un cambio para revisar contexto.",
      "Alimentar el timeline causal de cada publicacion.",
    ],
    recommendedFlow: [
      "Registrar cambios apenas ocurren o al reconstruir la semana.",
      "Escribir una hipotesis corta sobre lo que esperabas que pasara.",
      "Revisar dias despues si las metricas posteriores muestran impacto probable.",
    ],
    limits: [
      "Un cambio sin snapshots posteriores queda como memoria, pero no permite inferir impacto.",
      "La app no afirma causa exacta; usa lenguaje prudente.",
    ],
  },
  {
    id: "importaciones",
    title: "Importaciones",
    route: "/importaciones",
    summary:
      "Carga CSV local de snapshots metricos para publicaciones propias, sin depender de APIs externas.",
    actions: [
      "Seleccionar proyecto y archivo CSV.",
      "Previsualizar separador, headers, mapping sugerido y filas detectadas.",
      "Resolver referencias a publicaciones por SKU, external id, titulo o seleccion manual.",
      "Importar snapshots metricos como visitas, ventas, conversion, ingresos, precio y stock.",
      "Revisar historial de imports y errores de validacion.",
    ],
    recommendedFlow: [
      "Probar primero `samples/csv/metric-snapshots.sample.csv`.",
      "Confirmar el mapping sugerido.",
      "Importar y volver al detalle de una publicacion para ver metricas nuevas.",
    ],
    limits: [
      "Hoy importa snapshots metricos, no cambios ni resultados competitivos.",
      "Las filas invalidas se informan, pero no se corrigen automaticamente.",
    ],
  },
  {
    id: "competencia",
    title: "Competencia",
    route: "/competencia",
    summary:
      "Contexto competitivo minimo: busquedas monitoreadas, snapshots manuales y resultados observados.",
    actions: [
      "Crear una busqueda monitoreada por keyword, categoria, marketplace y proyecto.",
      "Crear snapshots manuales para una busqueda en distintas fechas.",
      "Cargar resultados observados con posicion, titulo, precio y seller.",
      "Marcar resultados como propios o vincularlos a competidores.",
      "Comparar snapshots para ver entradas, salidas, presencia propia y cambios de precio.",
    ],
    recommendedFlow: [
      "Crear una busqueda importante para una publicacion propia.",
      "Tomar un snapshot manual antes o durante una accion.",
      "Tomar otro snapshot despues.",
      "Comparar ambos para sumar contexto al aprendizaje.",
    ],
    limits: [
      "No hay scraping ni medicion automatica de market share.",
      "La competencia es contexto, no el nucleo del producto.",
    ],
  },
  {
    id: "oportunidades",
    title: "Oportunidades",
    route: "/oportunidades",
    summary:
      "Senales accionables derivadas de lo que ya cargaste: cambios, metricas y contexto competitivo.",
    actions: [
      "Detectar senales desde datos locales existentes.",
      "Filtrar por proyecto, publicacion, busqueda, prioridad y estado.",
      "Cambiar estado de una oportunidad para marcar revision o descarte.",
      "Usar la explicacion como apoyo para decidir la proxima accion.",
    ],
    recommendedFlow: [
      "Cargar primero publicaciones, cambios, metricas y competencia manual.",
      "Ejecutar deteccion de senales.",
      "Revisar prioridad y evidencia.",
      "Cambiar estado despues de decidir que hacer.",
    ],
    limits: [
      "No hay IA ni recomendaciones generativas.",
      "Las senales son heuristicas y pueden tener atribucion debil o moderada.",
    ],
  },
  {
    id: "configuracion",
    title: "Configuracion",
    route: "/configuracion",
    summary:
      "Resumen tecnico local: stack, persistencia y comandos utiles para levantar o validar la app.",
    actions: [
      "Revisar stack actual.",
      "Consultar comandos locales principales.",
      "Confirmar que la app trabaja con SQLite local.",
    ],
    recommendedFlow: [
      "Usarla cuando alguien nuevo levanta el proyecto.",
      "Complementarla con README para regenerar base y seed.",
    ],
    limits: [
      "No administra preferencias avanzadas.",
      "No cambia configuraciones de negocio desde la UI.",
    ],
  },
];

const demoChecklist = [
  "Crear o abrir un proyecto.",
  "Crear o abrir una publicacion propia.",
  "Registrar un cambio operativo.",
  "Importar snapshots metricos desde CSV.",
  "Abrir el timeline causal de la publicacion.",
  "Crear o abrir una busqueda monitoreada.",
  "Cargar snapshots competitivos y resultados observados.",
  "Comparar snapshots.",
  "Revisar oportunidades y cambiar su estado.",
];

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-6 text-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AyudaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manual operativo"
        title="Ayuda de etapa 1"
        description="Guia rapida para usar Market Pulse como bitacora causal local-first: que cargar, donde mirarlo y que limites conviene recordar en cada modulo."
      />

      <SectionCard
        eyebrow="Recorrido recomendado"
        title="Como probar la app de punta a punta"
        description="Este orden ayuda a construir memoria operativa antes de mirar explicaciones, competencia u oportunidades."
      >
        <div className="grid gap-3 md:grid-cols-3">
          {demoChecklist.map((item, index) => (
            <div key={item} className="border-b border-line pb-3 md:border-b-0 md:border-l md:pb-0 md:pl-4">
              <div className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</div>
              <div className="mt-1 text-sm leading-6 text-ink">{item}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Indice"
        title="Secciones disponibles"
        description="Accesos directos al manual de cada modulo."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {helpSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-2xl border border-line bg-panel-raised px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent/50 hover:text-accent"
            >
              {section.title}
            </a>
          ))}
        </div>
      </SectionCard>

      <div className="space-y-6">
        {helpSections.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-6">
            <SectionCard
              eyebrow="Modulo"
              title={section.title}
              description={section.summary}
              action={
                <Link
                  href={section.route}
                  className="inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-shell shadow-sm transition hover:bg-accent/90"
                >
                  Abrir
                </Link>
              }
            >
              <div className="grid gap-6 xl:grid-cols-3">
                <div>
                  <div className="mb-3">
                    <Badge>Que podes hacer</Badge>
                  </div>
                  <TextList items={section.actions} />
                </div>

                <div>
                  <div className="mb-3">
                    <Badge>Flujo sugerido</Badge>
                  </div>
                  <TextList items={section.recommendedFlow} />
                </div>

                <div>
                  <div className="mb-3">
                    <Badge>Limites</Badge>
                  </div>
                  <TextList items={section.limits} />
                </div>
              </div>
            </SectionCard>
          </div>
        ))}
      </div>
    </div>
  );
}
