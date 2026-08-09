import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmDialog({
  confirmDialog,
  setConfirmDialog,
}) {
  return (
    <Dialog open={confirmDialog.open} onOpenChange={(open) => {
      if (!open) setConfirmDialog(prev => ({ ...prev, open: false }));
    }}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          {confirmDialog.description && (
            <DialogDescription className="mt-2 text-sm text-slate-500">
              {confirmDialog.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 border rounded-xl text-slate-700 hover:bg-slate-50 text-sm"
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
          >
            {confirmDialog.cancelText}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
            onClick={() => {
              if (confirmDialog.onConfirm) confirmDialog.onConfirm();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
          >
            {confirmDialog.confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
