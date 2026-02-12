"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export const BookingForm: React.FC = () => {
  const { items, clearCart, removeFromCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items, email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Ошибка при создании Stripe-сессии");
      }

      const data = (await response.json()) as { url?: string };
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error("Stripe не вернул ссылку на оплату");
      }
    } catch (e) {
      console.error(e);
      alert("Ошибка при создании заказа");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl">
      <h4 className="font-semibold mb-3">Оформление заказа</h4>
      <div className="mb-3">
        <label htmlFor="email" className="text-sm">
          Email для подтверждения
        </label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded-md border mt-1"
        />
      </div>

      <div className="mb-3 space-y-1">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between gap-3 py-1 text-sm"
          >
            <div className="flex flex-col">
              <span className="font-medium">
                {i.name} x{i.quantity}
              </span>
              {i.price && (
                <span className="text-xs text-muted-foreground">
                  Цена заштучно: ${i.price}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                {i.price ? `$${i.price * i.quantity}` : "—"}
              </span>
              <button
                type="button"
                onClick={() => removeFromCart(i.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="px-3 py-2 bg-[#00D4FF] text-white rounded-lg"
        >
          Оплатить (тест)
        </button>
        <button
          type="button"
          onClick={() => clearCart()}
          disabled={loading}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          Очистить корзину
        </button>
      </div>
    </div>
  );
};
