"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChecklistItem } from "@/types/travel";

interface ChecklistPanelProps {
  tourId: string;
  items: ChecklistItem[];
}

const storageKey = (tourId: string) => `lite-travel-checklist:${tourId}`;

export const ChecklistPanel: React.FC<ChecklistPanelProps> = ({ tourId, items }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(tourId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setChecked(parsed);
    } catch (error) {
      console.error("Failed to load checklist from localStorage", error);
    }
  }, [tourId]);

  useEffect(() => {
    localStorage.setItem(storageKey(tourId), JSON.stringify(checked));
  }, [tourId, checked]);

  const grouped = useMemo(() => {
    const groups = new Map<string, ChecklistItem[]>();
    for (const item of items) {
      if (!groups.has(item.category)) {
        groups.set(item.category, []);
      }
      groups.get(item.category)?.push(item);
    }
    return Array.from(groups.entries());
  }, [items]);

  const done = items.filter((item) => checked[item.id]).length;
  const total = items.length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1A2B48]">Чек-лист путешественника</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {done}/{total} готово
        </span>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-slate-600">
          Пока нет пунктов. Администратор может добавить их в разделе «Админ».
        </p>
      )}

      <div className="space-y-4">
        {grouped.map(([category, categoryItems]) => (
          <div key={category}>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {category}
            </h4>
            <ul className="space-y-2">
              {categoryItems.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[item.id])}
                      onChange={(event) =>
                        setChecked((prev) => ({
                          ...prev,
                          [item.id]: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">
                      <span className="font-medium">{item.title}</span>
                      {item.required && (
                        <span className="ml-2 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-700">
                          важно
                        </span>
                      )}
                      {item.note && <span className="mt-1 block text-xs text-slate-500">{item.note}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

