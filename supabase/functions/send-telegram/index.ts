// Edge function: receives order, rate-limits per IP, inserts into DB, notifies Telegram.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  // Rate-limit
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("key", `order:${ip}`)
    .gte("created_at", since);

  if ((count ?? 0) >= RATE_LIMIT) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const name = String(body.name ?? "").trim().slice(0, 100);
  const phone = String(body.phone ?? "").trim().slice(0, 30);
  if (name.length < 2 || phone.length < 5) {
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const order = {
    type_id: (body.type_id as string) || null,
    name,
    phone,
    address: (body.address as string) || null,
    date: (body.date as string) || null,
    time: (body.time as string) || null,
    description: (body.description as string) || null,
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (insertErr) {
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Log rate-limit hit
  await supabase.from("rate_limits").insert({ key: `order:${ip}` });

  // Telegram (best-effort)
  let telegram_sent = false;
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (token && chatId) {
    try {
      const text = [
        "🔧 *Новая заявка*",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        order.address ? `Адрес: ${order.address}` : null,
        order.date ? `Дата: ${order.date} ${order.time ?? ""}` : null,
        order.description ? `Описание: ${order.description}` : null,
      ].filter(Boolean).join("\n");

      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      });
      telegram_sent = res.ok;
      if (res.ok) {
        await supabase.from("orders").update({ telegram_sent: true }).eq("id", inserted.id);
      }
    } catch (e) {
      console.error("Telegram failed", e);
    }
  }

  return new Response(JSON.stringify({ id: inserted.id, telegram_sent }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
