import { NextRequest, NextResponse } from "next/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items as
      | { id: string; name: string; price?: number; quantity?: number }[]
      | undefined;
    const email = (body.email as string | undefined) || undefined;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Корзина пуста" },
        { status: 400 },
      );
    }

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "Stripe не сконфигурирован. Убедитесь, что задан STRIPE_SECRET_KEY.",
        },
        { status: 500 },
      );
    }

    const successUrl =
      process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/tours?success=1";
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL || "http://localhost:3000/tours?canceled=1";

    // Создаём сессию Stripe Checkout через REST API,
    // чтобы не требовать установку пакета `stripe`
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    if (email) {
      params.append("customer_email", email);
    }

    items.forEach((item, index) => {
      const idx = index.toString();
      params.append(`line_items[${idx}][quantity]`, String(item.quantity ?? 1));
      params.append(`line_items[${idx}][price_data][currency]`, "usd");
      params.append(
        `line_items[${idx}][price_data][product_data][name]`,
        item.name,
      );
      params.append(
        `line_items[${idx}][price_data][unit_amount]`,
        String(Math.max(1, Math.round((item.price ?? 0) * 100))),
      );
    });

    const stripeRes = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!stripeRes.ok) {
      const errorText = await stripeRes.text().catch(() => "");
      console.error("Stripe API error", stripeRes.status, errorText);
      return NextResponse.json(
        { error: "Stripe API вернул ошибку" },
        { status: 500 },
      );
    }

    const session = (await stripeRes.json()) as { url?: string };
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json(
      { error: "Не удалось создать сессию оплаты" },
      { status: 500 },
    );
  }
}

