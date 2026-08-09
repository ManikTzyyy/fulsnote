import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { myUtils } from "@/utils/utils";

export function AccountCard({ account, onClick, onEdit, onDelete }) {
  return (
    <div
      data-acc-id={account.id}
      onClick={() => onClick(account)}
      className="card flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-white/70 bg-white/80 shadow-xs shadow-slate-200/70 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`flex items-center justify-between gap-2 px-1 py-1 text-xs bg-${account.bg_clr}-50`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-${account.bg_clr}-100 text-${account.ic_clr}-900`}
          >
            <DynamicIcon name={account.icon} className="h-4 w-4" />
          </div>
          <p
            className="min-w-0 whitespace-normal text-xs leading-4 text-slate-700"
            style={{ overflowWrap: "anywhere" }}
          >
            {account.name}
          </p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <button
            type="button"
            className="text-slate-500 transition hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(account);
            }}
          >
            <DynamicIcon name="pencil" className="h-5" />
          </button>
          <button
            type="button"
            data-acc={account.id}
            className="btn-dlt-acc text-slate-500 transition hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(account.id);
            }}
          >
            <DynamicIcon name="trash" className="h-5" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2">
        <span
          id={`balance-${account.id}`}
          className="text-sm leading-5 text-slate-900"
        >
          {myUtils.formatMoney(account.balance)}
        </span>
      </div>
    </div>
  );
}
