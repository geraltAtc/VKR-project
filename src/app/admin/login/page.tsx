import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

const LoginFallback = () => (
  <main className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
    <h1 className="text-2xl font-semibold text-[#1A2B48]">Вход в админ-панель</h1>
    <p className="mt-2 text-sm text-slate-600">Загрузка формы входа...</p>
  </main>
);

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <Suspense fallback={<LoginFallback />}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
