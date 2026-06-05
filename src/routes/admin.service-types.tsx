import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CrudPage } from "@/components/admin/CrudPage";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/service-types")({
  head: () => ({ meta: [{ title: "Виды техники — Админка" }, { name: "robots", content: "noindex" }] }),
  component: ServiceTypesPage,
});

function DisplayToggles() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings", "services_display"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("key,value").in("key", ["services_show_icon", "services_show_cover"]);
      const map = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
      const parse = (v: unknown, def: boolean) => (v === true || v === false ? v : typeof v === "string" ? v === "true" : def);
      return {
        showIcon: parse(map.services_show_icon, true),
        showCover: parse(map.services_show_cover, false),
      };
    },
  });
  const toggle = async (key: string, value: boolean) => {
    const { error } = await supabase.from("settings").upsert({ key, value });
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["settings", "services_display"] });
      qc.invalidateQueries({ queryKey: ["service_types_grid"] });
      toast.success("Сохранено");
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Switch id="show-icon" checked={!!data?.showIcon} onCheckedChange={(v) => toggle("services_show_icon", v)} />
        <Label htmlFor="show-icon">Показывать иконки</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="show-cover" checked={!!data?.showCover} onCheckedChange={(v) => toggle("services_show_cover", v)} />
        <Label htmlFor="show-cover">Показывать фоновое фото</Label>
      </div>
    </div>
  );
}

function ServiceTypesPage() {
  return (
    <div className="space-y-4">
      <DisplayToggles />
      <CrudPage
        config={{
          title: "Виды техники",
          table: "service_types",
          orderBy: { column: "sort_order" },
          showSortHandle: true,
          showActiveToggle: true,
          fields: [
            { name: "title", label: "Название", type: "text", required: true },
            { name: "title_genitive", label: "Название (родительный падеж)", type: "text", placeholder: "напр. стиральных машин" },
            { name: "slug", label: "Slug (URL)", type: "slug", required: true },
            { name: "description", label: "Описание", type: "textarea" },
            { name: "icon_url", label: "Иконка", type: "image" },
            { name: "cover_url", label: "Фоновое фото", type: "image" },
            { name: "sort_order", label: "Порядок", type: "number" },
            { name: "is_active", label: "Активно", type: "boolean" },
          ],
          columns: [
            {
              key: "icon_url",
              label: "Иконка",
              className: "w-16",
              render: (r) => (r.icon_url ? <img src={r.icon_url} alt="" className="h-10 w-10 object-cover rounded" /> : "—"),
            },
            { key: "title", label: "Название", sortable: true },
            { key: "slug", label: "Slug" },
            { key: "sort_order", label: "Порядок", sortable: true, className: "w-24" },
          ],
        }}
      />
    </div>
  );
}
