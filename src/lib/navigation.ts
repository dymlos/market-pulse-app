export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  shortLabel: string;
  group: "Principal" | "Nucleo causal" | "Contexto" | "Sistema";
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Inicio",
    group: "Principal",
    description: "Resumen local con proyectos, publicaciones, cambios recientes y actividad.",
  },
  {
    href: "/proyectos",
    label: "Proyectos",
    shortLabel: "Proyectos",
    group: "Nucleo causal",
    description: "Espacio para agrupar sellers, marcas o cuentas de trabajo.",
  },
  {
    href: "/publicaciones",
    label: "Publicaciones",
    shortLabel: "Publicaciones",
    group: "Nucleo causal",
    description: "Base para registrar publicaciones propias y su contexto operativo.",
  },
  {
    href: "/cambios",
    label: "Cambios",
    shortLabel: "Cambios",
    group: "Nucleo causal",
    description: "Bitacora de eventos operativos sobre publicaciones propias.",
  },
  {
    href: "/importaciones",
    label: "Carga de datos",
    shortLabel: "Datos",
    group: "Nucleo causal",
    description: "Entrada local para CSV de metricas que alimentan publicaciones y timeline.",
  },
  {
    href: "/competencia",
    label: "Competencia",
    shortLabel: "Competencia",
    group: "Contexto",
    description: "Busquedas monitoreadas y snapshots manuales como contexto minimo.",
  },
  {
    href: "/oportunidades",
    label: "Oportunidades",
    shortLabel: "Oportunidades",
    group: "Contexto",
    description: "Senales accionables conectadas a cambios propios y contexto cargado.",
  },
  {
    href: "/ayuda",
    label: "Ayuda",
    shortLabel: "Manual",
    group: "Sistema",
    description: "Manual operativo de etapa 1 para recorrer cada flujo de la app.",
  },
  {
    href: "/configuracion",
    label: "Configuracion",
    shortLabel: "Config",
    group: "Sistema",
    description: "Resumen tecnico de la app base, persistencia y comandos locales.",
  },
];

export const navigationGroups: NavigationItem["group"][] = [
  "Principal",
  "Nucleo causal",
  "Contexto",
  "Sistema",
];
