import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";

export type ProductImage = {
  id?: string;
  url: string;
  role: "main" | "top" | "left" | "right" | "other";
  sort_order: number;
};

const ROLE_OPTIONS = [
  { value: "main", label: "Главное" },
  { value: "top", label: "Сверху" },
  { value: "left", label: "Слева" },
  { value: "right", label: "Справа" },
  { value: "other", label: "Прочее" },
];

export function ProductImagesEditor({
  productId,
  value,
  onChange,
}: {
  productId?: string;
  value: ProductImage[];
  onChange: (v: ProductImage[]) => void;
}) {
  const [items, setItems] = useState<ProductImage[]>(value ?? []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setItems(value ?? []), [value]);

  const sync = (next: ProductImage[]) => {
    setItems(next);
    onChange(next);
  };

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("admin-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("admin-images").getPublicUrl(path);
        uploaded.push({
          url: data.publicUrl,
          role: items.length + uploaded.length === 0 ? "main" : "other",
          sort_order: items.length + uploaded.length,
        });
      }
      sync([...items, ...uploaded]);
      toast.success(`Загружено: ${uploaded.length}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Изображения товара</Label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading && <Upload className="h-4 w-4 animate-pulse text-muted-foreground" />}
      </div>
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((img, i) => (
            <div key={i} className="relative rounded-lg border bg-card p-2">
              <button
                type="button"
                onClick={() => sync(items.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 z-10 rounded-full bg-destructive p-1 text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
              <img src={img.url} alt="" className="h-24 w-full object-contain" />
              <Select value={img.role} onValueChange={(v) => {
                const next = [...items];
                next[i] = { ...next[i], role: v as ProductImage["role"] };
                sync(next);
              }}>
                <SelectTrigger className="mt-2 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={img.sort_order}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], sort_order: Number(e.target.value) };
                  sync(next);
                }}
                className="mt-2 h-8 text-xs"
                placeholder="Порядок"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
