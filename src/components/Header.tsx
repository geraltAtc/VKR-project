"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const Header: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

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

  const installPwa = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1A2B48] text-lg text-white">
            🧭
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A2B48]">lite.travel</p>
            <p className="text-xs text-slate-500">электронный гид туриста</p>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/tours" className="text-slate-700 hover:text-[#1A2B48]">
            Мои туры
          </Link>
          <Link href="/search" className="text-slate-700 hover:text-[#1A2B48]">
            Поиск мест
          </Link>
          <Link href="/profile" className="text-slate-700 hover:text-[#1A2B48]">
            Чек-листы
          </Link>

          <span className="ml-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`}
            />
            {isOnline ? "Online" : "Offline"}
          </span>

          {installEvent && !installed && (
            <button
              onClick={installPwa}
              className="rounded-xl bg-[#00D4FF] px-3 py-1.5 text-xs font-semibold text-[#1A2B48]"
            >
              Установить
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
