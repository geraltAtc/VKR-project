"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useNetworkStatus } from "@/hooks";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { isOnline } = useNetworkStatus();
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const installPwa = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("lite.travel:theme", next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/tours" className="group flex items-center gap-3">
          <div className="pulse-shadow flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16345F] text-lg text-white transition group-hover:rotate-6 dark:bg-slate-100 dark:text-slate-900">
            🧭
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-[#16345F] dark:text-slate-100">
              lite.travel
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              электронный гид туриста
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { href: "/tours", label: "Мои туры" },
            { href: "/profile", label: "Чек-листы" },
          ].map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-[#16345F] text-white shadow dark:bg-slate-200 dark:text-slate-900"
                    : "text-slate-700 hover:bg-white/70 hover:text-[#16345F] dark:text-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/65 px-2.5 py-1 text-xs text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800/80"
          >
            {theme === "dark" ? "Светлая" : "Темная"}
          </button>

          <span className="ml-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/65 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            {isOnline ? "Online" : "Offline"}
          </span>

          {installEvent && !installed && (
            <button
              onClick={installPwa}
              className="rounded-full bg-[#00D4FF] px-3 py-1.5 text-xs font-semibold text-[#123256] transition hover:brightness-95 dark:bg-slate-200 dark:text-slate-900"
            >
              Установить
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
