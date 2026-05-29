import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const orderSchema = z.object({
  type_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(5).max(30),
  address: z.string().trim().max(300).optional().nullable(),
  date: z.string().optional().nullable(),
  time: z.string().max(20).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: inserted, error } = await supabase
      .from("orders")
      .insert({
        type_id: data.type_id || null,
        name: data.name,
        phone: data.phone,
        address: data.address || null,
        date: data.date || null,
        time: data.time || null,
        description: data.description || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Telegram notification (best-effort)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    let telegram_sent = false;
    if (token && chatId) {
      try {
        const text = [
          "🔧 *Новая заявка*",
          `Имя: ${data.name}`,
          `Телефон: ${data.phone}`,
          data.address ? `Адрес: ${data.address}` : null,
          data.date ? `Дата: ${data.date} ${data.time ?? ""}` : null,
          data.description ? `Описание: ${data.description}` : null,
        ]
          .filter(Boolean)
          .join("\n");
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
        console.error("Telegram send failed", e);
      }
    }

    return { id: inserted.id, telegram_sent };
  });
