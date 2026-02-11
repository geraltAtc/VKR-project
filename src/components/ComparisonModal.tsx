"use client";

import { useCompareStore } from "@/store/compareStore";

export const ComparisonModal: React.FC = () => {
  const { items, remove, clear } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[520px] max-w-full bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">Сравнение туров ({items.length})</h4>
        <div className="flex gap-2">
          <button
            onClick={() => clear()}
            className="text-sm px-2 py-1 border rounded"
          >
            Очистить
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-64">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Название</th>
              <th>Цена</th>
              <th>Длительность</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-2">{t.name}</td>
                <td className="text-center">{t.price ? `$${t.price}` : "—"}</td>
                <td className="text-center">{(t as any).duration || "—"}</td>
                <td className="text-center">
                  <button
                    onClick={() => remove(t.id)}
                    className="text-xs text-red-500"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
