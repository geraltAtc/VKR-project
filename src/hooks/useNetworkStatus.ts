"use client";

import { useEffect, useState } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSupported] = useState<boolean>(
    typeof globalThis !== "undefined" &&
      "onLine" in (globalThis.navigator || {}),
  );

  useEffect(() => {
    // Установить начальный статус
    if (isSupported) {
      setIsOnline((globalThis.navigator as any).onLine ?? true);
    }

    // Обработчик события онлайн
    const handleOnline = () => setIsOnline(true);

    // Обработчик события оффлайн
    const handleOffline = () => setIsOnline(false);

    globalThis.addEventListener("online", handleOnline as EventListener);
    globalThis.addEventListener("offline", handleOffline as EventListener);

    // Очистка слушателей
    return () => {
      globalThis.removeEventListener("online", handleOnline as EventListener);
      globalThis.removeEventListener("offline", handleOffline as EventListener);
    };
  }, [isSupported]);

  return { isOnline, isSupported };
};
