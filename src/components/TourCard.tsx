import Link from "next/link";
import type { TourSummary } from "@/types/travel";

interface TourCardProps {
  tour: TourSummary;
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
  });

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <article className="surface-card page-enter rounded-3xl p-5 [animation-delay:120ms]">
      <div className="flex items-center justify-between gap-2">
        <p className="rounded-full bg-[#E6F6FF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#0E5B7E] dark:bg-slate-800 dark:text-slate-200">
          {tour.city}, {tour.country}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
        </p>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-tight text-[#17385F] dark:text-slate-100">
        {tour.title}
      </h3>

      <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        <p className="font-medium text-slate-800 dark:text-slate-100">{tour.hotelName}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tour.hotelAddress}</p>
      </div>

      <Link
        href={`/tours/${tour.id}`}
        className="mt-4 inline-flex rounded-xl bg-[#17385F] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#102946]"
      >
        Открыть электронный гид
      </Link>
    </article>
  );
};
