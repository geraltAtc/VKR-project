"use client";

import { useEffect, useState } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSupported] = useState<boolean>(
    typeof window !== "undefined" && "onLine" in navigator,
  );

  useEffect(() => {
    // Установить начальный статус
    if (isSupported) {
      setIsOnline(navigator.onLine);
    }

    // Обработчик события онлайн
    const handleOnline = () => setIsOnline(true);

    // Обработчик события оффлайн
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Очистка слушателей
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isSupported]);

  return { isOnline, isSupported };
};
