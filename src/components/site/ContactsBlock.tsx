import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Clock, MapPin, Send, MessageCircle, Phone as PhoneIcon } from "lucide-react";

type Contacts = {
  phone?: string;
  telegram?: string;
  viber?: string;
  whatsapp?: string;
  schedule?: string;
  address?: string;
  map_lat?: number;
  map_lng?: number;
};

export function useContacts() {
  return useQuery({
    queryKey: ["settings_contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "contacts").maybeSingle();
      return (data?.value ?? {}) as Contacts;
    },
  });
}

export const MESSENGERS = [
  { key: "telegram" as const, label: "Telegram", icon: Send, color: "#0088CC" },
  { key: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { key: "viber" as const, label: "Viber", icon: PhoneIcon, color: "#7360F2" },
];

export function ContactsBlock() {
  const { data: c } = useContacts();
  if (!c) return null;
  const lat = c.map_lat ?? 53.9006;
  const lng = c.map_lng ?? 27.559;
  const bbox = `${lng - 0.02},${lat - 0.01},${lng + 0.02},${lat + 0.01}`;
  return (
    <section id="contacts" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Контакты</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          {c.phone && (
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-lg font-semibold hover:text-primary">
              <Phone className="h-5 w-5 text-primary" /> {c.phone}
            </a>
          )}
          {c.schedule && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" /> {c.schedule}
            </div>
          )}
          {c.address && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" /> {c.address}
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
            {MESSENGERS.map(({ key, label, icon: Icon, color }) => {
              const href = c[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-4 w-4" /> {label}
                </a>
              );
            })}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border">
          <iframe
            title="Карта"
            loading="lazy"
            className="h-72 w-full"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
          />
        </div>
      </div>
    </section>
  );
}
