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
    description: "Vista operativa general del proyecto y del stack local-first.",
  },
  {
    href: "/proyectos",
    label: "Proyectos",
    shortLabel: "Proyectos",
    description: "Espacio para agrupar sellers, marcas o cuentas antes del CRUD real.",
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
    description: "Bitacora inicial para futuros eventos operativos y su impacto probable.",
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
    description: "Contexto competitivo minimo, pensado como complemento y no como nucleo.",
  },
  {
    href: "/oportunidades",
    label: "Oportunidades",
    shortLabel: "Oportunidades",
    description: "Senales accionables conectadas a cambios propios y contexto cargado.",
  },
  {
    href: "/configuracion",
    label: "Configuracion",
    shortLabel: "Config",
    description: "Resumen tecnico de la app base, persistencia y comandos locales.",
  },
];
