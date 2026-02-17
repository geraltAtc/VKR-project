"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks";

export const Header: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installedHandler = () => setInstalled(true);

    globalThis.addEventListener(
      "beforeinstallprompt",
      handler as EventListener,
    );
    globalThis.addEventListener(
      "appinstalled",
      installedHandler as EventListener,
    );

    return () => {
      globalThis.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      );
      globalThis.removeEventListener(
        "appinstalled",
        installedHandler as EventListener,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt?.userChoice;
    if (choice?.outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-white/60 backdrop-blur-md glass-shadow">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1A2B48] to-[#00D4FF] flex items-center justify-center text-white font-bold">
            🧭
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1A2B48]">Lite.Travel</h1>
            <p className="text-xs text-muted-foreground">
              Цифровой компас — Многослойное стекло
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex items-center gap-6 text-sm">
        <Link href="/tours" className="text-[#1A2B48] hover:text-[#00D4FF]">
          Туры
        </Link>
        <Link href="/search" className="text-[#1A2B48] hover:text-[#00D4FF]">
          Поиск
        </Link>
        <Link href="/profile" className="text-[#1A2B48] hover:text-[#00D4FF]">
          Профиль
        </Link>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${isOnline ? "bg-cyan-400" : "bg-gray-400"}`}
            ></span>
            <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
          </div>

          {deferredPrompt && !installed && (
            <button
              onClick={handleInstall}
              className="px-3 py-1 rounded-lg bg-cyan-400 text-white text-xs"
            >
              Установить
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
