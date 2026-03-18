"use client";

import { FormEvent, useMemo, useState } from "react";
import { Header } from "@/components";
import { tourService } from "@/services";

type Notice = { type: "success" | "error"; text: string } | null;

const numberValue = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [tourForm, setTourForm] = useState({
    id: "",
    title: "",
    city: "",
    country: "",
    startDate: "",
    endDate: "",
    hotelName: "",
    hotelAddress: "",
    hotelPhone: "",
    checkInTime: "",
    checkOutTime: "",
    roomDetails: "",
    transferDetails: "",
    emergencyPhone: "",
    operatorPhone: "",
    hotelLat: "",
    hotelLng: "",
  });

  const [attractionForm, setAttractionForm] = useState({
    tourId: "",
    name: "",
    address: "",
    lat: "",
    lng: "",
    workingHours: "",
    entryPrice: "",
    visitDuration: "",
    description: "",
    tips: "",
    category: "",
  });

  const [countryForm, setCountryForm] = useState({
    tourId: "",
    currencyInfo: "",
    languageInfo: "",
    transportInfo: "",
    climateInfo: "",
    foodInfo: "",
    safetyInfo: "",
    cultureInfo: "",
    usefulContacts: "",
  });

  const [checklistForm, setChecklistForm] = useState({
    tourId: "",
    category: "",
    title: "",
    note: "",
    required: false,
  });

  const canSubmit = useMemo(() => token.trim().length > 0, [token]);

  const handleError = (reason: unknown) => {
    setNotice({
      type: "error",
      text: reason instanceof Error ? reason.message : "Не удалось выполнить запрос.",
    });
  };

  const handleSubmitTour = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.createTour(
        {
          ...tourForm,
          hotelLat: numberValue(tourForm.hotelLat),
          hotelLng: numberValue(tourForm.hotelLng),
        },
        token,
      );
      setNotice({ type: "success", text: response.message });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAttraction = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.createAttraction(
        {
          ...attractionForm,
          lat: numberValue(attractionForm.lat),
          lng: numberValue(attractionForm.lng),
        },
        token,
      );
      setNotice({ type: "success", text: response.message });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCountryInfo = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.upsertCountryInfo(countryForm, token);
      setNotice({ type: "success", text: response.message });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitChecklist = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.createChecklistItem(checklistForm, token);
      setNotice({ type: "success", text: response.message });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-[#1A2B48]">Панель администратора</h1>
        <p className="mt-2 text-sm text-slate-600">
          Здесь можно заполнять данные для туристов, не заходя вручную в Supabase.
        </p>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-sm font-medium text-slate-700">
            Токен администратора (ADMIN_DASHBOARD_TOKEN)
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-[#00D4FF] focus:ring-2"
              placeholder="Введите токен доступа"
            />
          </label>

          {notice && (
            <p
              className={`mt-3 text-sm ${notice.type === "success" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {notice.text}
            </p>
          )}
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <form
            onSubmit={handleSubmitTour}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-[#1A2B48]">1. Тур</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                ["id", "ID тура (например barcelona-hotel)"],
                ["title", "Название тура"],
                ["city", "Город"],
                ["country", "Страна"],
                ["startDate", "Дата начала (YYYY-MM-DD)"],
                ["endDate", "Дата конца (YYYY-MM-DD)"],
                ["hotelName", "Название отеля"],
                ["hotelAddress", "Адрес отеля"],
                ["hotelPhone", "Телефон отеля"],
                ["checkInTime", "Check-in (например 15:00)"],
                ["checkOutTime", "Check-out (например 12:00)"],
                ["emergencyPhone", "Экстренный телефон"],
                ["operatorPhone", "Контакт туроператора"],
                ["hotelLat", "Широта отеля"],
                ["hotelLng", "Долгота отеля"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  value={tourForm[key as keyof typeof tourForm]}
                  onChange={(event) =>
                    setTourForm((prev) => ({
                      ...prev,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              ))}

              <textarea
                value={tourForm.roomDetails}
                onChange={(event) =>
                  setTourForm((prev) => ({ ...prev, roomDetails: event.target.value }))
                }
                placeholder="Что входит в номер"
                className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
              />
              <textarea
                value={tourForm.transferDetails}
                onChange={(event) =>
                  setTourForm((prev) => ({
                    ...prev,
                    transferDetails: event.target.value,
                  }))
                }
                placeholder="Описание трансфера"
                className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
              />
            </div>
            <button
              disabled={!canSubmit || isSubmitting}
              className="mt-4 rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Сохранить тур
            </button>
          </form>

          <form
            onSubmit={handleSubmitAttraction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-[#1A2B48]">
              2. Достопримечательность
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                ["tourId", "ID тура"],
                ["name", "Название места"],
                ["address", "Адрес"],
                ["lat", "Широта"],
                ["lng", "Долгота"],
                ["workingHours", "Часы работы"],
                ["entryPrice", "Цена входа"],
                ["visitDuration", "Время на осмотр"],
                ["category", "Категория"],
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  value={attractionForm[key as keyof typeof attractionForm]}
                  onChange={(event) =>
                    setAttractionForm((prev) => ({
                      ...prev,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              ))}

              <textarea
                value={attractionForm.description}
                onChange={(event) =>
                  setAttractionForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Описание места"
                className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
              />
              <textarea
                value={attractionForm.tips}
                onChange={(event) =>
                  setAttractionForm((prev) => ({ ...prev, tips: event.target.value }))
                }
                placeholder="Совет туристу"
                className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
              />
            </div>
            <button
              disabled={!canSubmit || isSubmitting}
              className="mt-4 rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Сохранить достопримечательность
            </button>
          </form>

          <form
            onSubmit={handleSubmitCountryInfo}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-[#1A2B48]">
              3. Информация о стране
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={countryForm.tourId}
                onChange={(event) =>
                  setCountryForm((prev) => ({ ...prev, tourId: event.target.value }))
                }
                placeholder="ID тура"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              {[
                ["currencyInfo", "Валюта и деньги"],
                ["languageInfo", "Язык"],
                ["transportInfo", "Транспорт"],
                ["climateInfo", "Климат"],
                ["foodInfo", "Еда"],
                ["safetyInfo", "Безопасность"],
                ["cultureInfo", "Культура"],
                ["usefulContacts", "Полезные контакты"],
              ].map(([key, placeholder]) => (
                <textarea
                  key={key}
                  value={countryForm[key as keyof typeof countryForm]}
                  onChange={(event) =>
                    setCountryForm((prev) => ({
                      ...prev,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder={placeholder}
                  className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              ))}
            </div>
            <button
              disabled={!canSubmit || isSubmitting}
              className="mt-4 rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Сохранить информацию о стране
            </button>
          </form>

          <form
            onSubmit={handleSubmitChecklist}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-[#1A2B48]">4. Пункт чек-листа</h2>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={checklistForm.tourId}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, tourId: event.target.value }))
                }
                placeholder="ID тура"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={checklistForm.category}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="Категория (Документы, Одежда...)"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={checklistForm.title}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Название пункта"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                value={checklistForm.note}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="Комментарий (опционально)"
                className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checklistForm.required}
                  onChange={(event) =>
                    setChecklistForm((prev) => ({
                      ...prev,
                      required: event.target.checked,
                    }))
                  }
                />
                Обязательный пункт
              </label>
            </div>
            <button
              disabled={!canSubmit || isSubmitting}
              className="mt-4 rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Сохранить пункт
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

