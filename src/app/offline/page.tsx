"use client";

import { Header } from "@/components";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A2B48] to-[#0b172a] text-white">
      <Header />
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Вы офлайн — работаем из кеша
        </h2>
        <p className="text-sm text-white/80 mb-6">
          lite.travel продолжает работать в автономном режиме. Уже открытые туры,
          карта, чек-листы и информация о стране останутся доступными без интернета.
          Когда соединение появится, данные обновятся автоматически.
        </p>
      </main>
    </div>
  );
}
