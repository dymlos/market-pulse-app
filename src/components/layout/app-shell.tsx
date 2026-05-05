"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { navigationItems } from "@/lib/navigation";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const currentItem =
    navigationItems.find((item) => isActivePath(pathname, item.href)) ?? navigationItems[0];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-line bg-shell px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
                Local-first
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">Market Pulse</h1>
                <p className="max-w-xs text-sm leading-6 text-muted">
                  Bitacora causal operativa para sellers y agencias. Competencia y oportunidades
                  entran como contexto, no como producto principal.
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "block rounded-2xl border px-4 py-3 transition",
                      active
                        ? "border-accent/60 bg-panel-raised text-ink shadow-panel"
                        : "border-transparent bg-panel/70 text-muted hover:border-line hover:bg-panel-raised hover:text-ink",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span
                        className={[
                          "rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em]",
                          active ? "bg-accent/20 text-accent" : "bg-panel-raised text-muted",
                        ].join(" ")}
                      >
                        {item.shortLabel}
                      </span>
                    </div>
                    <p
                      className={[
                        "mt-2 text-xs leading-5",
                        active ? "text-muted" : "text-muted",
                      ].join(" ")}
                    >
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-line bg-canvas/95 px-5 py-5 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                  {currentItem.label}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">
                    Herramienta operativa para entender que paso y que aprender despues.
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
                    Registra proyectos, publicaciones y cambios para construir memoria operativa
                    antes de avanzar al timeline causal.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-line bg-panel px-4 py-3 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Entorno
                  </div>
                  <div className="mt-2 font-mono text-sm text-ink">http://localhost:3000</div>
                </div>
                <div className="rounded-2xl border border-line bg-panel px-4 py-3 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Persistencia
                  </div>
                  <div className="mt-2 font-mono text-sm text-ink">data/market-pulse.local.db</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
