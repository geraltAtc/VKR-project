"use client";

import { useState, useEffect } from "react";
import { tourService } from "@/services";
import debounce from "lodash.debounce";

export const HeroSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async (q: string) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await tourService.searchTours(q);
      setSuggestions(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // debounce to avoid spamming API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handler = debounce((q: string) => doSearch(q), 400);
    handler(query);
    return () => handler.cancel();
  }, [query]);

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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: Париж, пляж, горы..."
            className="w-2/3 p-3 rounded-2xl border border-border bg-white/70 backdrop-blur-sm"
          />
          <button className="px-4 py-3 bg-[#00D4FF] text-white rounded-2xl">
            Поиск
          </button>
        </div>

        <div className="mt-4">
          {loading && <div className="text-sm">Ищем...</div>}
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
