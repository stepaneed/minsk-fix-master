import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderForm } from "@/components/site/OrderForm";

export function OrderModal({
  open,
  onOpenChange,
  defaultTypeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTypeId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Оформить заказ</DialogTitle>
        </DialogHeader>
        <OrderForm compact onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
