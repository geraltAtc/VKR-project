"use client";

import { useState, useMemo } from "react";
import type { Tour } from "@/store/favoriteStore";

interface HeroSearchProps {
  tours: Tour[];
  onSearchChange?: (value: string) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  tours,
  onSearchChange,
}) => {
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return tours
      .filter((t) => {
        const inName = t.name.toLowerCase().includes(lower);
        const inDescription = t.description
          ?.toLowerCase()
          .includes(lower);
        const inLocation = (t as any).location
          ?.toLowerCase()
          .includes(lower);
        return inName || inDescription || inLocation;
      })
      .slice(0, 6);
  }, [query, tours]);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearchChange?.(value);
  };

  return (
    <section className="w-full py-10 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-semibold mb-3">Найди идеальный тур</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Умный поиск по названиям, локациям и предложениям — работает офлайн с
          кэшем
        </p>

        <div className="flex gap-3 items-center justify-center">
          <input
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Поиск: Париж, пляж, горы..."
            className="w-2/3 p-3 rounded-2xl border border-border bg-white/70 backdrop-blur-sm"
          />
        </div>

        <div className="mt-4">
          {suggestions.length > 0 && (
            <ul className="mt-2 grid grid-cols-3 gap-3">
              {suggestions.map((s) => (
                <li key={s.id} className="p-3 bg-white/60 rounded-xl text-left">
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
