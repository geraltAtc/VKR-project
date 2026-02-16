import Link from "next/link";
import { Header } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b172a] via-[#1A2B48] to-[#020617] text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <section>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Цифровой компас для путешествий
          </h1>
          <p className="text-sm md:text-base text-white/80 mb-6">
            Lite.Travel — прогрессивное веб‑приложение туристического агентства:
            офлайн‑доступ, умный поиск туров, 
						{/* интерактивные карты,  */}
						корзина,
            избранное и сравнение предложений.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tours"
              className="px-5 py-3 rounded-xl bg-[#00D4FF] text-[#0b172a] text-sm font-semibold"
            >
              Перейти к турам
            </Link>
            <Link
              href="/search"
              className="px-5 py-3 rounded-xl border border-white/30 text-sm"
            >
              Поиск туров
            </Link>
            <Link
              href="/profile"
              className="px-5 py-3 rounded-xl border border-white/20 text-sm"
            >
              Личный кабинет
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4">
            <h3 className="font-semibold mb-1">Работа офлайн</h3>
            <p className="text-xs text-white/80">
              Избранное, корзина и сравнение сохраняются локально и доступны
              без интернета.
            </p>
          </div>
          {/* <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4">
            <h3 className="font-semibold mb-1">Интерактивные карты</h3>
            <p className="text-xs text-white/80">
              Leaflet‑карты с ценами и локациями туров на одном экране.
            </p>
          </div> */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4">
            <h3 className="font-semibold mb-1">Умный поиск</h3>
            <p className="text-xs text-white/80">
              Фильтры по цене, длительности, рейтингу и строка поиска по
              локациям.
            </p>
          </div>
          {/* <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4">
            <h3 className="font-semibold mb-1">Бронирование и оплаты</h3>
            <p className="text-xs text-white/80">
              Модуль бронирования с интеграцией Stripe в тестовом режиме.
            </p>
          </div> */}
        </section>
      </main>
    </div>
  );
}
