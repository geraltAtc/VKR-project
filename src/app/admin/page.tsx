"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { tourService } from "@/services";
import type { TourAccessLink, TourDetails, TourSummary } from "@/types/travel";

type Notice = { type: "success" | "error"; text: string } | null;

const numberValue = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const emptyTourForm = {
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
};

const emptyAttractionForm = (tourId = "") => ({
  id: "",
  tourId,
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

const emptyCountryForm = (tourId = "") => ({
  tourId,
  currencyInfo: "",
  languageInfo: "",
  transportInfo: "",
  climateInfo: "",
  foodInfo: "",
  safetyInfo: "",
  cultureInfo: "",
  usefulContacts: "",
});

const emptyChecklistForm = (tourId = "") => ({
  id: "",
  tourId,
  category: "",
  title: "",
  note: "",
  required: false,
});

const emptyAccessLinkForm = (tourId = "") => ({
  tourId,
  label: "",
  expiresAt: "",
});

const mapTourToForm = (tour: TourDetails) => ({
  id: tour.id,
  title: tour.title,
  city: tour.city,
  country: tour.country,
  startDate: tour.startDate,
  endDate: tour.endDate,
  hotelName: tour.hotelName,
  hotelAddress: tour.hotelAddress,
  hotelPhone: tour.hotelPhone,
  checkInTime: tour.checkInTime,
  checkOutTime: tour.checkOutTime,
  roomDetails: tour.roomDetails,
  transferDetails: tour.transferDetails,
  emergencyPhone: tour.emergencyPhone,
  operatorPhone: tour.operatorPhone,
  hotelLat: String(tour.hotelLat),
  hotelLng: String(tour.hotelLng),
});

export default function AdminPage() {
  const router = useRouter();

  const [tours, setTours] = useState<TourSummary[]>([]);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [selectedTour, setSelectedTour] = useState<TourDetails | null>(null);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingAccessLinks, setIsLoadingAccessLinks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [accessLinks, setAccessLinks] = useState<TourAccessLink[]>([]);
  const [generatedAccessLink, setGeneratedAccessLink] = useState<string | null>(null);

  const [tourForm, setTourForm] = useState(emptyTourForm);
  const [attractionForm, setAttractionForm] = useState(emptyAttractionForm());
  const [countryForm, setCountryForm] = useState(emptyCountryForm());
  const [checklistForm, setChecklistForm] = useState(emptyChecklistForm());
  const [accessLinkForm, setAccessLinkForm] = useState(emptyAccessLinkForm());

  const selectedTourExists = useMemo(
    () => tours.some((tour) => tour.id === selectedTourId),
    [tours, selectedTourId],
  );
  const fieldClass =
    "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none ring-[#00D4FF] focus:ring-2";
  const textareaClass =
    "min-h-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 caret-slate-900 outline-none ring-[#00D4FF] focus:ring-2";
  const formCardClass =
    "rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm";

  const handleError = (reason: unknown) => {
    setNotice({
      type: "error",
      text: reason instanceof Error ? reason.message : "Не удалось выполнить запрос.",
    });
  };

  const loadTours = async (): Promise<TourSummary[]> => {
    const list = await tourService.getAllTours();
    setTours(list);
    return list;
  };

  const loadAccessLinks = async (tourId: string) => {
    if (!tourId) {
      setAccessLinks([]);
      return;
    }

    setIsLoadingAccessLinks(true);
    try {
      const links = await tourService.getAccessLinks(tourId);
      setAccessLinks(links);
      setAccessLinkForm((prev) => ({ ...prev, tourId }));
    } finally {
      setIsLoadingAccessLinks(false);
    }
  };

  const loadSelectedTourDetails = async (tourId: string) => {
    setIsLoadingDetails(true);
    try {
      setGeneratedAccessLink(null);
      const details = await tourService.getTourById(tourId);
      setSelectedTour(details);
      setTourForm(mapTourToForm(details));
      setCountryForm({
        tourId: details.id,
        currencyInfo: details.countryInfo?.currencyInfo ?? "",
        languageInfo: details.countryInfo?.languageInfo ?? "",
        transportInfo: details.countryInfo?.transportInfo ?? "",
        climateInfo: details.countryInfo?.climateInfo ?? "",
        foodInfo: details.countryInfo?.foodInfo ?? "",
        safetyInfo: details.countryInfo?.safetyInfo ?? "",
        cultureInfo: details.countryInfo?.cultureInfo ?? "",
        usefulContacts: details.countryInfo?.usefulContacts ?? "",
      });
      setAttractionForm(emptyAttractionForm(details.id));
      setChecklistForm(emptyChecklistForm(details.id));
      setAccessLinkForm(emptyAccessLinkForm(details.id));
      await loadAccessLinks(details.id);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    let active = true;
    setIsLoadingTours(true);

    loadTours()
      .then((list) => {
        if (!active) return;
        const preferred = list[0]?.id ?? "";

        if (preferred) {
          setSelectedTourId(preferred);
        } else {
          setAccessLinks([]);
          setGeneratedAccessLink(null);
          setTourForm(emptyTourForm);
          setAttractionForm(emptyAttractionForm());
          setCountryForm(emptyCountryForm());
          setChecklistForm(emptyChecklistForm());
          setAccessLinkForm(emptyAccessLinkForm());
        }
      })
      .catch(handleError)
      .finally(() => {
        if (active) setIsLoadingTours(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTourId) {
      setSelectedTour(null);
      setAccessLinks([]);
      setGeneratedAccessLink(null);
      return;
    }
    loadSelectedTourDetails(selectedTourId).catch(handleError);
  }, [selectedTourId]);

  const handleLogout = async () => {
    await tourService.adminLogout();
    router.push("/admin/login");
    router.refresh();
  };

  const handleCreateNewTourDraft = () => {
    setSelectedTourId("");
    setSelectedTour(null);
    setAccessLinks([]);
    setGeneratedAccessLink(null);
    setTourForm(emptyTourForm);
    setCountryForm(emptyCountryForm());
    setAttractionForm(emptyAttractionForm());
    setChecklistForm(emptyChecklistForm());
    setAccessLinkForm(emptyAccessLinkForm());
    setNotice(null);
  };

  const handleSubmitTour = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.createTour({
        ...tourForm,
        hotelLat: numberValue(tourForm.hotelLat),
        hotelLng: numberValue(tourForm.hotelLng),
      });

      await loadTours();
      setSelectedTourId(response.id);
      setGeneratedAccessLink(null);

      setNotice({
        type: "success",
        text: `${response.message} Теперь можно создать персональные ссылки для туристов.`,
      });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTour = async () => {
    if (!selectedTourId) return;
    const approved = confirm(
      `Удалить тур "${selectedTourId}"? Это удалит связанные достопримечательности и чек-лист.`,
    );
    if (!approved) return;

    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.deleteTour(selectedTourId);
      const list = await loadTours();
      const nextId = list[0]?.id ?? "";
      setSelectedTourId(nextId);
      if (!nextId) {
        handleCreateNewTourDraft();
      }
      setNotice({ type: "success", text: response.message });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAttraction = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.createAttraction({
        ...attractionForm,
        lat: numberValue(attractionForm.lat),
        lng: numberValue(attractionForm.lng),
      });
      setNotice({ type: "success", text: response.message });

      const tourId = attractionForm.tourId;
      setAttractionForm(emptyAttractionForm(tourId));
      if (tourId) {
        await loadSelectedTourDetails(tourId);
      }
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAttraction = async (id: string) => {
    const approved = confirm("Удалить достопримечательность?");
    if (!approved || !selectedTourId) return;

    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.deleteAttraction(id);
      setNotice({ type: "success", text: response.message });
      await loadSelectedTourDetails(selectedTourId);
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCountryInfo = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.upsertCountryInfo(countryForm);
      setNotice({ type: "success", text: response.message });
      if (countryForm.tourId) {
        await loadSelectedTourDetails(countryForm.tourId);
      }
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitChecklist = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.createChecklistItem(checklistForm);
      setNotice({ type: "success", text: response.message });

      const tourId = checklistForm.tourId;
      setChecklistForm(emptyChecklistForm(tourId));
      if (tourId) {
        await loadSelectedTourDetails(tourId);
      }
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChecklistItem = async (id: string) => {
    const approved = confirm("Удалить пункт чек-листа?");
    if (!approved || !selectedTourId) return;

    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.deleteChecklistItem(id);
      setNotice({ type: "success", text: response.message });
      await loadSelectedTourDetails(selectedTourId);
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccessLink = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessLinkForm.tourId) {
      setNotice({ type: "error", text: "Сначала выберите тур." });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    try {
      const payload = {
        tourId: accessLinkForm.tourId,
        label: accessLinkForm.label,
        expiresAt: accessLinkForm.expiresAt ? accessLinkForm.expiresAt : null,
      };
      const response = await tourService.createAccessLink(payload);
      setGeneratedAccessLink(response.link.url);
      await loadAccessLinks(accessLinkForm.tourId);
      setAccessLinkForm((prev) => ({ ...prev, label: "", expiresAt: "" }));
      setNotice({ type: "success", text: response.message });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccessLink = async (id: string) => {
    const approved = confirm("Отключить эту персональную ссылку?");
    if (!approved || !selectedTourId) return;

    setIsSubmitting(true);
    setNotice(null);
    try {
      const response = await tourService.revokeAccessLink(id);
      await loadAccessLinks(selectedTourId);
      setNotice({ type: "success", text: response.message });
    } catch (reason) {
      handleError(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              lite.travel / admin
            </p>
            <h1 className="text-xl font-semibold text-[#1A2B48]">
              Панель администратора
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tours"
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
            >
              К пользовательской части
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-[#1A2B48] px-3 py-1.5 text-sm font-semibold text-white"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm text-slate-600">
          Выберите тур для редактирования или создайте новый. Все блоки ниже работают
          без перезагрузки страницы.
        </p>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
            <select
              value={selectedTourId}
              onChange={(event) => setSelectedTourId(event.target.value)}
              className={fieldClass}
              disabled={isLoadingTours}
            >
              <option value="">
                {isLoadingTours ? "Загрузка туров..." : "Выберите тур"}
              </option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.title} ({tour.id})
                </option>
              ))}
            </select>

            <button
              onClick={() => selectedTourId && loadSelectedTourDetails(selectedTourId)}
              disabled={!selectedTourId || isLoadingDetails}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
            >
              Обновить данные
            </button>

            <button
              onClick={handleCreateNewTourDraft}
              className="rounded-xl bg-[#1A2B48] px-3 py-2 text-sm font-semibold text-white"
            >
              Новый тур
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-cyan-900">
                Персональные ссылки для туристов
              </p>
              {generatedAccessLink && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(generatedAccessLink)}
                  className="rounded-xl border border-cyan-300 px-3 py-1.5 text-xs text-cyan-900"
                >
                  Скопировать последнюю ссылку
                </button>
              )}
            </div>

            <form
              onSubmit={handleCreateAccessLink}
              className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                value={accessLinkForm.label}
                onChange={(event) =>
                  setAccessLinkForm((prev) => ({ ...prev, label: event.target.value }))
                }
                placeholder="Комментарий к ссылке (например: Иван Петров)"
                className={fieldClass}
              />
              <input
                type="datetime-local"
                value={accessLinkForm.expiresAt}
                onChange={(event) =>
                  setAccessLinkForm((prev) => ({
                    ...prev,
                    expiresAt: event.target.value,
                  }))
                }
                className={fieldClass}
              />
              <button
                type="submit"
                disabled={!selectedTourId || isSubmitting}
                className="rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Создать ссылку
              </button>
            </form>

            {generatedAccessLink && (
              <p className="mt-3 break-all text-sm text-cyan-800">{generatedAccessLink}</p>
            )}

            <div className="mt-3 space-y-2">
              {isLoadingAccessLinks && (
                <p className="text-xs text-cyan-800">Загрузка персональных ссылок...</p>
              )}
              {!isLoadingAccessLinks && accessLinks.length === 0 && (
                <p className="text-xs text-cyan-800">
                  Пока нет персональных ссылок для этого тура.
                </p>
              )}
              {accessLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-200 bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs text-cyan-900">{link.url}</p>
                    <p className="text-xs text-cyan-800">
                      {link.label ? `${link.label} • ` : ""}
                      {link.isActive ? "активна" : "неактивна"}
                      {link.expiresAt ? ` • до ${new Date(link.expiresAt).toLocaleString()}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(link.url)}
                      className="rounded-lg border border-cyan-300 px-2 py-1 text-xs text-cyan-900"
                    >
                      Копировать
                    </button>
                    {link.isActive && (
                      <button
                        type="button"
                        onClick={() => handleRevokeAccessLink(link.id)}
                        className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700"
                      >
                        Отключить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {notice && (
          <section
            className={`mt-4 rounded-2xl border p-4 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {notice.text}
          </section>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <form
            onSubmit={handleSubmitTour}
            className={formCardClass}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A2B48]">1. Тур</h2>
              {selectedTourExists && (
                <button
                  type="button"
                  onClick={handleDeleteTour}
                  disabled={isSubmitting}
                  className="rounded-xl border border-rose-300 px-3 py-1.5 text-xs text-rose-700 disabled:opacity-40"
                >
                  Удалить тур
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                ["id", "ID тура (например tokyo-spring-2026)"],
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
                  className={fieldClass}
                />
              ))}

              <textarea
                value={tourForm.roomDetails}
                onChange={(event) =>
                  setTourForm((prev) => ({ ...prev, roomDetails: event.target.value }))
                }
                placeholder="Что входит в номер"
                className={`${textareaClass} md:col-span-2`}
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
                className={`${textareaClass} md:col-span-2`}
              />
            </div>
            <button
              disabled={isSubmitting}
              className="mt-4 rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {selectedTourExists ? "Обновить тур" : "Создать тур"}
            </button>
          </form>

          <form
            onSubmit={handleSubmitAttraction}
            className={formCardClass}
          >
            <h2 className="text-lg font-semibold text-[#1A2B48]">
              2. Достопримечательность
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={attractionForm.id}
                onChange={(event) =>
                  setAttractionForm((prev) => ({ ...prev, id: event.target.value }))
                }
                placeholder="ID (оставьте пустым для новой)"
                className={`${fieldClass} md:col-span-2`}
              />
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
                  className={fieldClass}
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
                className={`${textareaClass} md:col-span-2`}
              />
              <textarea
                value={attractionForm.tips}
                onChange={(event) =>
                  setAttractionForm((prev) => ({ ...prev, tips: event.target.value }))
                }
                placeholder="Совет туристу"
                className={`${textareaClass} md:col-span-2`}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                disabled={isSubmitting}
                className="rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {attractionForm.id ? "Обновить достопримечательность" : "Добавить достопримечательность"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setAttractionForm(emptyAttractionForm(attractionForm.tourId))
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                Очистить форму
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Добавленные достопримечательности:
              </p>
              {isLoadingDetails && <p className="text-xs text-slate-500">Загрузка...</p>}
              {!isLoadingDetails && selectedTour?.attractions.length === 0 && (
                <p className="text-xs text-slate-500">Пока пусто.</p>
              )}
              {selectedTour?.attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{attraction.name}</p>
                    <p className="text-xs text-slate-500">{attraction.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAttractionForm({
                          id: attraction.id,
                          tourId: attraction.tourId,
                          name: attraction.name,
                          address: attraction.address,
                          lat: String(attraction.lat),
                          lng: String(attraction.lng),
                          workingHours: attraction.workingHours,
                          entryPrice: attraction.entryPrice,
                          visitDuration: attraction.visitDuration,
                          description: attraction.description,
                          tips: attraction.tips,
                          category: attraction.category,
                        })
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttraction(attraction.id)}
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </form>

          <form
            onSubmit={handleSubmitCountryInfo}
            className={formCardClass}
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
                className={fieldClass}
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
                  className={textareaClass}
                />
              ))}
            </div>
            <button
              disabled={isSubmitting}
              className="mt-4 rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Сохранить информацию о стране
            </button>
          </form>

          <form
            onSubmit={handleSubmitChecklist}
            className={formCardClass}
          >
            <h2 className="text-lg font-semibold text-[#1A2B48]">4. Пункт чек-листа</h2>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={checklistForm.id}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, id: event.target.value }))
                }
                placeholder="ID (оставьте пустым для нового)"
                className={fieldClass}
              />
              <input
                value={checklistForm.tourId}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, tourId: event.target.value }))
                }
                placeholder="ID тура"
                className={fieldClass}
              />
              <input
                value={checklistForm.category}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="Категория (Документы, Одежда...)"
                className={fieldClass}
              />
              <input
                value={checklistForm.title}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Название пункта"
                className={fieldClass}
              />
              <textarea
                value={checklistForm.note}
                onChange={(event) =>
                  setChecklistForm((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="Комментарий (опционально)"
                className={textareaClass}
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

            <div className="mt-4 flex gap-2">
              <button
                disabled={isSubmitting}
                className="rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {checklistForm.id ? "Обновить пункт" : "Добавить пункт"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setChecklistForm(emptyChecklistForm(checklistForm.tourId))
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                Очистить форму
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-slate-700">Пункты чек-листа:</p>
              {isLoadingDetails && <p className="text-xs text-slate-500">Загрузка...</p>}
              {!isLoadingDetails && selectedTour?.checklistItems.length === 0 && (
                <p className="text-xs text-slate-500">Пока пусто.</p>
              )}
              {selectedTour?.checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.category}
                      {item.required ? " • обязательный" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setChecklistForm({
                          id: item.id,
                          tourId: item.tourId,
                          category: item.category,
                          title: item.title,
                          note: item.note,
                          required: item.required,
                        })
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
