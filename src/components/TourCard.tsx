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
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {tour.city}, {tour.country}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-[#1A2B48]">{tour.title}</h3>

      <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
        <p className="font-medium text-slate-700">{tour.hotelName}</p>
        <p className="mt-1">{tour.hotelAddress}</p>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
      </p>

      <Link
        href={`/tours/${tour.id}`}
        className="mt-4 inline-flex rounded-xl bg-[#1A2B48] px-4 py-2 text-sm font-semibold text-white"
      >
        Открыть электронный гид
      </Link>
    </article>
  );
};

