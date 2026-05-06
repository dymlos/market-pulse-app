export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  shortLabel: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Inicio",
    description: "Resumen local con proyectos, publicaciones, cambios recientes y actividad.",
  },
  {
    href: "/proyectos",
    label: "Proyectos",
    shortLabel: "Proyectos",
    description: "Espacio para agrupar sellers, marcas o cuentas de trabajo.",
  },
  {
    href: "/publicaciones",
    label: "Publicaciones",
    shortLabel: "Publicaciones",
    description: "Base para registrar publicaciones propias y su contexto operativo.",
  },
  {
    href: "/cambios",
    label: "Cambios",
    shortLabel: "Cambios",
    description: "Bitacora de eventos operativos sobre publicaciones propias.",
  },
  {
    href: "/importaciones",
    label: "Importaciones",
    shortLabel: "Importaciones",
    description: "Punto de entrada para CSV y cargas manuales sin depender de APIs externas.",
  },
  {
    href: "/competencia",
    label: "Competencia",
    shortLabel: "Competencia",
    description: "Busquedas monitoreadas y snapshots manuales como contexto minimo.",
  },
  {
    href: "/oportunidades",
    label: "Oportunidades",
    shortLabel: "Oportunidades",
    description: "Senales accionables conectadas a cambios propios y contexto cargado.",
  },
  {
    href: "/ayuda",
    label: "Ayuda",
    shortLabel: "Manual",
    description: "Manual operativo de etapa 1 para recorrer cada flujo de la app.",
  },
  {
    href: "/configuracion",
    label: "Configuracion",
    shortLabel: "Config",
    description: "Resumen tecnico de la app base, persistencia y comandos locales.",
  },
];
