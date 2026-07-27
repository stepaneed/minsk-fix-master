import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  applianceType: z.string().trim().min(1).max(100),
  brand: z.string().trim().max(100).optional().default(""),
  problem: z.string().trim().min(5, "Опишите проблему подробнее").max(1500),
  priceContext: z
    .array(
      z.object({
        title: z.string().max(200),
        price_from: z.number().nullable().optional(),
        price_to: z.number().nullable().optional(),
      })
    )
    .max(80)
    .optional()
    .default([]),
});

const outSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  likely_issue: z.string().max(300),
  works: z.array(z.string().max(200)).max(6),
  note: z.string().max(500),
});

export const estimatePrice = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const priceLines = data.priceContext
      .filter((p) => p.price_from != null || p.price_to != null)
      .map(
        (p) =>
          `- ${p.title}: ${p.price_from ?? "?"}${p.price_to ? `–${p.price_to}` : ""} BYN`
      )
      .join("\n");

    const system = `Ты — оценщик стоимости ремонта бытовой техники в Минске (сервис МастерФикс). По описанию проблемы даёшь ориентировочный диапазон стоимости работ в BYN (белорусских рублях), без стоимости запчастей. Если проблема неоднозначная — расширяй диапазон. Никогда не выходи за 30–1500 BYN. Отвечай ТОЛЬКО валидным JSON без markdown.`;

    const user = `Техника: ${data.applianceType}
Бренд: ${data.brand || "не указан"}
Описание проблемы: ${data.problem}

${priceLines ? `Прейскурант по этой технике (для ориентира):\n${priceLines}` : ""}

Верни JSON со схемой:
{
  "min": number,            // минимальная стоимость работ в BYN
  "max": number,            // максимальная стоимость работ в BYN
  "likely_issue": string,   // краткая вероятная причина (1 предложение)
  "works": string[],        // 2–4 вероятных работы
  "note": string            // важное уточнение для клиента (1–2 предложения)
}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) {
      throw new Response("Слишком много запросов. Попробуйте позже.", { status: 429 });
    }
    if (res.status === 402) {
      throw new Response("Исчерпан лимит AI. Пополните баланс.", { status: 402 });
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error: ${res.status} ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("AI вернул некорректный ответ");
    }
    const result = outSchema.parse(parsed);
    // clamp
    result.min = Math.max(30, Math.min(1500, Math.round(result.min)));
    result.max = Math.max(result.min, Math.min(1500, Math.round(result.max)));
    return result;
  });
