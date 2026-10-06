import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { myUtils } from "@/utils/utils";

export function TransactionDialog({ hook, accounts }) {
  const {
    transactionPopupOpen,
    closeTransactionPopup,
    transactionForm,
    setTransactionForm,
    transactionType,
    status,
    handleSaveTransaction,
  } = hook;

  return (
    <Dialog open={transactionPopupOpen} onOpenChange={(open) => { if (!open) closeTransactionPopup(); }}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Transaction</DialogTitle>
            {status && (
              <span className={`flex gap-1 text-xs justify-center items-center px-2.5 py-0.5 rounded-full ${status.bg} ${status.clr} font-medium`}>
                {status.label}
                <DynamicIcon name={status.icon || 'arrow-right-left'} className="w-3 h-3" />
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="text-base flex flex-col mb-2">
          <label htmlFor="trnc-date" className="text-xs font-medium text-slate-500 mb-1">Date</label>
          <input className="border px-3 py-2 rounded-xl focus:outline-none text-base bg-white border-slate-200" type="date" name="date" id="trnc-date" value={transactionForm.date} onChange={(event) => setTransactionForm((current) => ({ ...current, date: event.target.value }))} onInput={(e) => e.target.classList.remove("border-red-500")} />
        </div>

        <div className="text-base flex flex-col mb-2">
          <label htmlFor="trnc-desc" className="text-xs font-medium text-slate-500 mb-1">Descriptions</label>
          <input className="border px-3 py-2 rounded-xl focus:outline-none text-base bg-white border-slate-200" type="text" name="desc" id="trnc-desc" value={transactionForm.desc} onChange={(event) => setTransactionForm((current) => ({ ...current, desc: event.target.value }))} onInput={(e) => e.target.classList.remove("border-red-500")} />
        </div>

        <div className="text-base flex flex-col mb-2">
          <label htmlFor="trc-value" className="text-xs font-medium text-slate-500 mb-1">Value</label>
          <input className="border px-3 py-2 rounded-xl focus:outline-none text-base bg-white border-slate-200"  type="text"
            inputMode="numeric" name="value" id="trc-value" value={transactionForm.amount} onChange={(event) => {
            const rawVal = event.target.value.replace(/\D/g, "");
            const formattedVal = rawVal ? myUtils.formatMoney(Number(rawVal)) : "0";
            setTransactionForm((current) => ({ ...current, amount: formattedVal }));
          }} onInput={(e) => e.target.classList.remove("border-red-500")} />
        </div>

        <div id="acc-ref-inp">
          <div className="text-xs flex flex-col mb-2">
            <label htmlFor="acc-ref-from" className="text-xs font-medium text-slate-500 mb-1">From Acc</label>
            <select
              name="acc-ref-from"
              id="acc-ref-from"
              className="border px-3 py-2 rounded-xl focus:outline-none text-sm select-acc bg-white border-slate-200 h-10"
              disabled={transactionType === "inc"}
              value={transactionForm.from_account_id}
              onChange={(event) => setTransactionForm((current) => ({ ...current, from_account_id: event.target.value }))}
              onInput={(e) => e.target.classList.remove("border-red-500")}
            >
              {accounts.map((account) => (
                <option key={account.id} value={String(account.id)}>{account.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs flex flex-col mb-2">
            <label htmlFor="acc-ref-to" className="text-xs font-medium text-slate-500 mb-1">To Acc</label>
            <select
              name="acc-ref-to"
              id="acc-ref-to"
              className="border px-3 py-2 rounded-xl focus:outline-none text-sm select-acc bg-white border-slate-200 h-10"
              disabled={transactionType === "exp"}
              value={transactionForm.to_account_id}
              onChange={(event) => setTransactionForm((current) => ({ ...current, to_account_id: event.target.value }))}
              onInput={(e) => e.target.classList.remove("border-red-500")}
            >
              {accounts.map((account) => (
                <option key={account.id} value={String(account.id)}>{account.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 border rounded-xl text-slate-700 hover:bg-slate-50 text-sm" onClick={closeTransactionPopup}>Cancel</button>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white text-sm font-medium" id="btn-save-trc" onClick={handleSaveTransaction}>Save</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
