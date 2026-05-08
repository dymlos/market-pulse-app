"use client";

import Link from "next/link";
import {
  ClipboardList,
  FolderOpen,
  Gauge,
  HelpCircle,
  Lightbulb,
  Package,
  Search,
  Settings,
  Upload,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { navigationGroups, navigationItems } from "@/lib/navigation";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navigationIcons = {
  "/dashboard": Gauge,
  "/proyectos": FolderOpen,
  "/publicaciones": Package,
  "/cambios": ClipboardList,
  "/importaciones": Upload,
  "/competencia": Search,
  "/oportunidades": Lightbulb,
  "/ayuda": HelpCircle,
  "/configuracion": Settings,
};

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const currentItem =
    navigationItems.find((item) => isActivePath(pathname, item.href)) ?? navigationItems[0];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-line/80 bg-shell/95 text-muted md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
            <div className="space-y-3 px-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                    Local-first
                  </div>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    Market Pulse
                  </h1>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 font-mono text-sm font-semibold text-accent shadow-[0_18px_42px_-30px_rgba(192,132,87,0.9)]">
                  MP
                </div>
              </div>
              <p className="max-w-xs text-sm leading-6 text-muted">
                Bitacora causal para entender que se toco, que cambio despues y que contexto habia.
              </p>
            </div>

            <nav className="mt-7 space-y-6">
              {navigationGroups.map((group) => {
                const items = navigationItems.filter((item) => item.group === group);

                return (
                  <div key={group} className="space-y-2">
                    {group !== "Principal" ? (
                      <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted/70">
                        {group}
                      </div>
                    ) : null}
                    <div className="space-y-1.5">
                      {items.map((item) => {
                        const active = isActivePath(pathname, item.href);
                        const Icon = navigationIcons[item.href as keyof typeof navigationIcons];

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            title={item.description}
                            className={[
                              "group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition",
                              active
                                ? "border-accent/55 bg-accent/[0.12] text-ink shadow-[inset_-3px_0_0_rgba(192,132,87,0.95)]"
                                : "border-transparent text-muted hover:border-line/80 hover:bg-panel/80 hover:text-ink",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border font-mono text-[11px]",
                                active
                                  ? "border-accent/35 bg-accent/15 text-accent"
                                  : "border-line/70 bg-panel/70 text-muted group-hover:text-accent",
                              ].join(" ")}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl border border-line/80 bg-panel/70 p-4 text-sm leading-6 text-muted shadow-[0_20px_60px_-44px_rgba(0,0,0,0.95)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Etapa 1
              </div>
              <p className="mt-2">
                Manual, datos demo y flujos locales listos para revisar cada modulo.
              </p>
              <Link className="mt-3 inline-flex text-sm font-semibold text-accent hover:text-ink" href="/ayuda">
                Abrir ayuda
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-canvas/80">
          <header className="border-b border-line/80 bg-shell/70 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  {currentItem.label}
                </div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {currentItem.description}
                </h2>
              </div>

              <Link
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-line/80 bg-panel/60 px-4 py-2.5 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
                href="/configuracion"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Configuración local
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 space-y-6 px-5 py-5 md:px-8 md:py-7 2xl:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
