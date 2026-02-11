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
      // Для демонстрации мы просто имитируем запрос на сервер
      // Реальная интеграция: отправить items и создать PaymentIntent на сервере
      await new Promise((r) => setTimeout(r, 800));
      clearCart();
      alert("Заказ создан (тестовый режим)");
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
