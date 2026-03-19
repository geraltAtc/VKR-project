"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Ошибка входа.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Ошибка входа.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <main className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#1A2B48]">Вход в админ-панель</h1>
        <p className="mt-2 text-sm text-slate-600">
          Введите токен администратора, чтобы открыть раздел управления турами.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="ADMIN_DASHBOARD_TOKEN"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-[#00D4FF] focus:ring-2"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || token.trim().length === 0}
            className="w-full rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isLoading ? "Проверяем..." : "Войти"}
          </button>
        </form>
      </main>
    </div>
  );
}

