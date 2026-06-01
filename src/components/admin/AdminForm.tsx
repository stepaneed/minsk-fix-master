import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./ImageUpload";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "image" | "datetime" | "select" | "slug" | "scale";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  /** For "scale": name of the field holding the image URL to preview. */
  previewField?: string;
  /** For "scale": min/max/step (defaults: 0.5/2/0.05). */
  min?: number;
  max?: number;
  step?: number;
};

export function AdminForm({
  fields,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Сохранить",
}: {
  fields: Field[];
  initial?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, any>>(initial || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(initial || {});
  }, [initial]);

  const set = (k: string, v: any) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    for (const f of fields) {
      if (f.required) {
        const v = values[f.name];
        if (v === undefined || v === null || v === "") err[f.name] = "Обязательное поле";
      }
    }
    setErrors(err);
    if (Object.keys(err).length) return;
    setSubmitting(true);
    try {
      // normalize empty strings for nullable fields
      const out: Record<string, any> = {};
      for (const f of fields) {
        let v = values[f.name];
        if (v === "") v = null;
        if ((f.type === "number" || f.type === "scale") && v !== null && v !== undefined) v = Number(v);
        out[f.name] = v;
      }
      await onSubmit(out);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((f) => {
        const v = values[f.name];
        const err = errors[f.name];
        return (
          <div key={f.name} className="space-y-1.5">
            <Label htmlFor={f.name}>
              {f.label} {f.required && <span className="text-destructive">*</span>}
            </Label>
            {f.type === "textarea" && (
              <Textarea
                id={f.name}
                value={v ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
                rows={4}
              />
            )}
            {(f.type === "text" || f.type === "slug") && (
              <Input
                id={f.name}
                value={v ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
            {f.type === "number" && (
              <Input
                id={f.name}
                type="number"
                value={v ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
            {f.type === "datetime" && (
              <Input
                id={f.name}
                type="datetime-local"
                value={v ? String(v).slice(0, 16) : ""}
                onChange={(e) => set(f.name, e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            )}
            {f.type === "boolean" && (
              <div className="pt-1">
                <Switch checked={!!v} onCheckedChange={(c) => set(f.name, c)} />
              </div>
            )}
            {f.type === "image" && <ImageUpload value={v} onChange={(url) => set(f.name, url)} />}
            {f.type === "scale" && (() => {
              const min = f.min ?? 0.5;
              const max = f.max ?? 2;
              const step = f.step ?? 0.05;
              const current = Number(v ?? 1);
              const previewUrl = f.previewField ? values[f.previewField] : null;
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      id={f.name}
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={current}
                      onChange={(e) => set(f.name, Number(e.target.value))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      value={current}
                      onChange={(e) => set(f.name, Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">{Math.round(current * 100)}%</span>
                  </div>
                  <div className="flex h-20 w-[160px] items-center justify-center overflow-hidden rounded-xl border bg-card px-4">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={{ transform: `scale(${current})`, transformOrigin: "center" }}
                        className="max-h-10 max-w-[120px] object-contain transition-transform"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Загрузите логотип</span>
                    )}
                  </div>
                </div>
              );
            })()}
            {f.type === "select" && (
              <Select value={v ?? ""} onValueChange={(val) => set(f.name, val)}>
                <SelectTrigger>
                  <SelectValue placeholder={f.placeholder || "Выберите..."} />
                </SelectTrigger>
                <SelectContent>
                  {f.options?.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>
        );
      })}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Сохранение..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
