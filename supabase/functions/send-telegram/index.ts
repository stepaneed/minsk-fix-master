// Edge function: receives order, rate-limits per IP, validates input, inserts into DB, notifies Telegram.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_RE = /^[+0-9 ()\-]{5,30}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
}

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
    return jsonResponse(429, { error: "rate_limited" });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  // Honeypot — silent reject to look like success
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return jsonResponse(200, { id: null, telegram_sent: false });
  }

  const name = clean(body.name, 100);
  const phone = clean(body.phone, 30);
  if (!name || name.length < 2) return jsonResponse(400, { error: "invalid_name" });
  if (!phone || !PHONE_RE.test(phone)) return jsonResponse(400, { error: "invalid_phone" });

  const type_id = typeof body.type_id === "string" && UUID_RE.test(body.type_id) ? body.type_id : null;
  const address = clean(body.address, 300);
  const description = clean(body.description, 2000);
  const dateRaw = clean(body.date, 10);
  const timeRaw = clean(body.time, 8);
  const date = dateRaw && DATE_RE.test(dateRaw) ? dateRaw : null;
  const time = timeRaw && TIME_RE.test(timeRaw) ? timeRaw : null;

  const order = { type_id, name, phone, address, date, time, description };

  const { data: inserted, error: insertErr } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (insertErr) {
    return jsonResponse(500, { error: insertErr.message });
  }

  // Log rate-limit hit
  await supabase.from("rate_limits").insert({ key: `order:${ip}` });

  // Telegram (best-effort) — order saved even on failure
  let telegram_sent = false;
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (token && chatId) {
    try {
      const text = [
        "🔧 *Новая заявка*",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        address ? `Адрес: ${address}` : null,
        date ? `Дата: ${date} ${time ?? ""}` : null,
        description ? `Описание: ${description}` : null,
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

  return jsonResponse(200, { id: inserted.id, telegram_sent });
});
