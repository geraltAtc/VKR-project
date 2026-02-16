"use client";

import { useEffect, useState } from "react";
import { useFavoriteStore } from "@/store";
import { Header } from "@/components";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const { favorites, clearFavorites } = useFavoriteStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUserEmail(data.user?.email ?? null);
      })
      .catch(() => {
        setUserEmail(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Личный кабинет</h2>

        <section className="mb-6">
          <h3 className="font-semibold mb-2">Профиль</h3>
          {supabase ? (
            <p className="text-sm text-muted-foreground">
              {userEmail
                ? `Вы вошли как ${userEmail} (Supabase Auth)`
                : "Гость. Подключите Supabase Auth, чтобы сохранять историю заказов в PostgreSQL."}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {/* Supabase ещё не сконфигурирован. Задайте
              NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY, чтобы
              включить авторизацию и хранение данных в PostgreSQL. */}
            </p>
          )}
        </section>

        <section className="mb-6">
          <h3 className="font-semibold mb-2">Избранное ({favorites.length})</h3>
          {favorites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              У вас ещё нет избранных туров.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((f) => (
                <li key={f.id} className="p-3 bg-white rounded-2xl shadow-sm">
                  {f.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <button
              onClick={() => clearFavorites()}
              className="px-3 py-2 border rounded"
            >
              Очистить избранное
            </button>
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-2">История заказов (локально)</h3>
          <p className="text-sm text-muted-foreground">
            История доступна офлайн и хранится локально в браузере.
          </p>
        </section>
      </main>
    </div>
  );
}
