import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import Link from "next/link";

export function MenuDialog({
  open,
  onOpenChange,
  handleExport,
  fileInputRef,
  handleImportChange,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-90 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DynamicIcon name="settings" className="w-5 h-5 text-slate-500" />
            Menu Options
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Link
            href="/analys"
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-all font-medium text-slate-700 text-sm"
            onClick={() => onOpenChange(false)}
          >
            <div className="bg-blue-100 text-blue-900 w-8 h-8 flex items-center justify-center rounded-lg">
              <DynamicIcon name="line-chart" className="w-4 h-4" />
            </div>
            Analysis Dashboard
          </Link>

          <Link
            href="/analys/expense"
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-all font-medium text-slate-700 text-sm"
            onClick={() => onOpenChange(false)}
          >
            <div className="bg-red-100 text-red-900 w-8 h-8 flex items-center justify-center rounded-lg">
              <DynamicIcon name="chart-pie" className="w-4 h-4" />
            </div>
            Expense by Account
          </Link>

          <button
            type="button"
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-all font-medium text-left text-slate-700 text-sm w-full"
            onClick={() => {
              handleExport();
              onOpenChange(false);
            }}
          >
            <div className="bg-green-100 text-green-900 w-8 h-8 flex items-center justify-center rounded-lg">
              <DynamicIcon name="download" className="w-4 h-4" />
            </div>
            Export Backup Data
          </button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="import-file"
              accept=".json"
              hidden
              onChange={(e) => {
                handleImportChange(e);
                onOpenChange(false);
              }}
            />
            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-all font-medium text-left text-slate-700 text-sm w-full"
              onClick={() => fileInputRef?.current?.click()}
            >
              <div className="bg-purple-100 text-purple-900 w-8 h-8 flex items-center justify-center rounded-lg">
                <DynamicIcon name="upload" className="w-4 h-4" />
              </div>
              Import Backup Data
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
