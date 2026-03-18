import Link from "next/link";
import { Header } from "@/components";

const features = [
  {
    title: "Отель и трансфер",
    text: "Все данные о заселении, встрече в аэропорту и важных контактах в одном месте.",
  },
  {
    title: "Яндекс.Карты",
    text: "Отель, достопримечательности и удобные ориентиры с интерактивными метками.",
  },
  {
    title: "Чек-лист перед вылетом",
    text: "Отмечайте, что уже собрали: документы, одежду, деньги, электронику.",
  },
  {
    title: "Страна и город",
    text: "Ключевая информация о валюте, языке, транспорте, безопасности и культуре.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF4FF] via-white to-[#F6FBFF]">
      <Header />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2">
        <section className="rounded-3xl bg-[#1A2B48] p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-wide text-white/70">
            lite.travel
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            Электронный гид для туриста: до вылета и на месте
          </h1>
          <p className="mt-4 text-sm text-white/85">
            Приложение помогает подготовиться к поездке, ориентироваться в городе и
            пользоваться ключевой информацией даже без интернета.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tours"
              className="rounded-xl bg-[#00D4FF] px-5 py-2.5 text-sm font-semibold text-[#1A2B48]"
            >
              Открыть мои туры
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Панель администратора
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#1A2B48]">{feature.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{feature.text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

