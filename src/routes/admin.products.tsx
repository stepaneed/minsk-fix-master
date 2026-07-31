import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminTable } from "@/components/admin/AdminTable";
import { AttributesEditor } from "@/components/admin/AttributesEditor";
import { ProductImagesEditor, type ProductImage } from "@/components/admin/ProductImagesEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Товары — Админка" }, { name: "robots", content: "noindex" }] }),
  component: ProductsAdmin,
});

function ProductsAdmin() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: services = [] } = useQuery({
    queryKey: ["admin", "extra_services", "non-buyout"],
    queryFn: async () => {
      const { data } = await supabase.from("extra_services").select("id,title,kind").neq("kind", "buyout").order("sort_order");
      return data ?? [];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, extra_services(title,kind), product_images(id,url,role,sort_order)").order("sort_order");
      return data ?? [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    if (error) toast.error(error.message); else { toast.success("Удалено"); refresh(); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Товары</h1>
          <p className="text-sm text-muted-foreground mt-1">Восстановленная техника и запчасти</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" /> Добавить</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Редактирование товара" : "Новый товар"}</DialogTitle></DialogHeader>
            <ProductForm
              services={services}
              initial={editing}
              onCancel={() => { setOpen(false); setEditing(null); }}
              onSaved={() => { setOpen(false); setEditing(null); refresh(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : (
        <AdminTable
          rows={products as any[]}
          filters={[
            {
              key: "service_id",
              label: "Услуга",
              options: services.map((s: any) => ({ value: s.id, label: s.title })),
            },
            {
              key: "is_active",
              label: "Статус",
              options: [
                { value: "true", label: "Активно" },
                { value: "false", label: "Черновик" },
              ],
              value: (r) => String(r.is_active),
            },
          ]}
          columns={[
            { key: "title", label: "Название" },
            { key: "extra_services", label: "Услуга", render: (r: any) => r.extra_services?.title ?? "—" },
            { key: "price", label: "Цена", render: (r: any) => (r.price != null ? `${r.price} BYN` : "—") },
            { key: "old_price", label: "Старая цена", render: (r: any) => (r.old_price != null ? `${r.old_price} BYN` : "—") },
            { key: "is_active", label: "Активно", render: (r: any) => (r.is_active ? "✓" : "—"), className: "w-20" },
          ]}
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(row); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteId(row.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить товар?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductForm({
  services,
  initial,
  onCancel,
  onSaved,
}: {
  services: any[];
  initial: any | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [v, setV] = useState<any>(
    initial ?? {
      service_id: services[0]?.id ?? "",
      title: "",
      slug: "",
      description: "",
      price: "",
      old_price: "",
      stock: "",
      sort_order: 0,
      is_active: true,
      attributes: {},
    },
  );
  const [images, setImages] = useState<ProductImage[]>(
    (initial?.product_images ?? []).map((i: any) => ({ id: i.id, url: i.url, role: i.role, sort_order: i.sort_order })),
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!v.service_id || !v.title || !v.slug) {
      toast.error("Заполните услугу, название и slug");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        service_id: v.service_id,
        title: v.title,
        slug: v.slug,
        description: v.description || null,
        price: v.price === "" || v.price === null ? null : Number(v.price),
        old_price: v.old_price === "" || v.old_price === null ? null : Number(v.old_price),
        stock: v.stock === "" || v.stock === null ? null : Number(v.stock),
        sort_order: Number(v.sort_order) || 0,
        is_active: !!v.is_active,
        attributes: v.attributes ?? {},
      };
      let productId = initial?.id;
      if (productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }
      // Sync images: simple approach — delete all then re-insert
      await supabase.from("product_images").delete().eq("product_id", productId);
      if (images.length > 0) {
        const rows = images.map((im) => ({
          product_id: productId,
          url: im.url,
          role: im.role,
          sort_order: im.sort_order,
        }));
        const { error: ie } = await supabase.from("product_images").insert(rows);
        if (ie) throw ie;
      }
      toast.success("Сохранено");
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Услуга *</Label>
          <Select value={v.service_id} onValueChange={(val) => setV({ ...v, service_id: val })}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Порядок</Label><Input className="mt-1" type="number" value={v.sort_order} onChange={(e) => setV({ ...v, sort_order: e.target.value })} /></div>
        <div><Label>Название *</Label><Input className="mt-1" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></div>
        <div><Label>Slug *</Label><Input className="mt-1" value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} /></div>
        <div><Label>Цена (BYN)</Label><Input className="mt-1" type="number" step="0.01" value={v.price ?? ""} onChange={(e) => setV({ ...v, price: e.target.value })} /></div>
        <div><Label>Старая цена (для скидки)</Label><Input className="mt-1" type="number" step="0.01" value={v.old_price ?? ""} onChange={(e) => setV({ ...v, old_price: e.target.value })} /></div>
        <div><Label>В наличии (шт.)</Label><Input className="mt-1" type="number" value={v.stock ?? ""} onChange={(e) => setV({ ...v, stock: e.target.value })} /></div>
        <div className="flex items-end gap-2"><Switch checked={!!v.is_active} onCheckedChange={(c) => setV({ ...v, is_active: c })} /><Label>Активно</Label></div>
      </div>
      <div><Label>Описание</Label><Textarea className="mt-1" rows={3} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>

      <AttributesEditor value={v.attributes} onChange={(attrs) => setV({ ...v, attributes: attrs })} />
      <ProductImagesEditor value={images} onChange={setImages} />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Отмена</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
      </div>
    </div>
  );
}
