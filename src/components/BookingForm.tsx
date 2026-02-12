"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export const BookingForm: React.FC = () => {
  const { items, clearCart } = useCartStore();
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

      <div className="mb-3">
        <ul>
          {items.map((i) => (
            <li key={i.id} className="flex justify-between py-1">
              <span>
                {i.name} x{i.quantity}
              </span>
              <span>{i.price ? `$${i.price * i.quantity}` : "—"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="px-3 py-2 bg-[#00D4FF] text-white rounded-lg"
        >
          Оплатить (тест)
        </button>
      </div>
    </div>
  );
};
