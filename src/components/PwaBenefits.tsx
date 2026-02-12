export const PwaBenefits: React.FC = () => {
  return (
    <section className="w-full px-6 pb-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm p-4">
          <h3 className="font-semibold mb-2">Работа в офлайне</h3>
          <p className="text-sm text-muted-foreground">
            Туркаталог, избранное и корзина доступны даже без интернета
            благодаря Service Worker и кешированию.
          </p>
        </div>
        <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm p-4">
          <h3 className="font-semibold mb-2">PWA-уведомления</h3>
          <p className="text-sm text-muted-foreground">
            Получайте напоминания о бронировании и обновления по турам как
            пуш-уведомления (готово к интеграции).
          </p>
        </div>
        <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm p-4">
          <h3 className="font-semibold mb-2">Установка как приложение</h3>
          <p className="text-sm text-muted-foreground">
            Добавьте VKR Tours на главный экран и используйте как нативное
            приложение с быстрым запуском.
          </p>
        </div>
      </div>
    </section>
  );
}

