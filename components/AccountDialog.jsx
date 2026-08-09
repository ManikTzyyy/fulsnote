import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COLORS } from "@/utils/helpers";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { myUtils } from "@/utils/utils";

export function AccountDialog({ hook }) {
  const {
    accountPopupOpen,
    closeAccountPopup,
    accountForm,
    setAccountForm,
    showIconBox,
    setShowIconBox,
    iconSearch,
    setIconSearch,
    selectedIconPreview,
    availableIcons,
    handleSelectIconClick,
    handleSaveAccount,
    editingAccountId,
  } = hook;

  return (
    <Dialog open={accountPopupOpen} onOpenChange={(open) => { if (!open) closeAccountPopup(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editingAccountId ? "Edit Account" : "Add New Account"}</DialogTitle>
        </DialogHeader>

        <div className="flex w-full justify-between items-start gap-4">
          <div className="text-base flex flex-col mb-2 w-full">
            <label htmlFor="name" className="text-xs font-medium text-slate-500 mb-1">Select Icon</label>
            <div className="relative">
              <button
                type="button"
                id="select-icon"
                className={`h-10 w-10 flex justify-center items-center rounded-lg bg-${accountForm.bg_clr}-100 hover:bg-${accountForm.bg_clr}-200 text-${accountForm.ic_clr}-900`}
                data-icon={accountForm.icon}
                data-bgclr={accountForm.bg_clr}
                data-txtclr={accountForm.ic_clr}
                onClick={handleSelectIconClick}
              >
                <DynamicIcon name={selectedIconPreview} className="h-5 w-5" />
              </button>

              <div id="icon-box" className={`${showIconBox ? "" : "hidden"} box-icon border-blue-100 p-2 border mt-2 rounded-lg absolute bg-white w-full z-50 shadow-md`}>
                <input
                  type="search"
                  name="search"
                  id="icon-search"
                  placeholder="search icon"
                  className="border px-2 py-1 rounded-lg focus:outline-none text-base w-full"
                  value={iconSearch}
                  onChange={(event) => setIconSearch(event.target.value)}
                />
                <div id="container-icon" className="flex flex-wrap pt-2 gap-3 text-blue-900 items-center justify-start max-h-32 overflow-y-auto">
                  {availableIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      className="cursor-pointer icon-data"
                      onClick={() => {
                        setAccountForm((current) => ({ ...current, icon: iconName }));
                        setShowIconBox(false);
                      }}
                    >
                      <DynamicIcon name={iconName} className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Background</p>
              <div id="bgPicker" className="flex flex-wrap gap-1.5 w-[120px]">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-md cursor-pointer select-bg-icon border-2 bg-${color}-100 ${accountForm.bg_clr === color ? "border-slate-800" : "border-transparent"}`}
                    onClick={() => setAccountForm((current) => ({ ...current, bg_clr: color }))}
                  ></button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Color</p>
              <div id="textPicker" className="flex flex-wrap gap-1.5 w-[120px]">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-md cursor-pointer select-clr-icon border-2 bg-${color}-900 ${accountForm.ic_clr === color ? "border-slate-800" : "border-transparent"}`}
                    onClick={() => setAccountForm((current) => ({ ...current, ic_clr: color }))}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs flex flex-col mb-2">
          <label htmlFor="acc-name" className="text-xs font-medium text-slate-500 mb-1">Account Name</label>
          <input className="border px-3 py-2 rounded-xl focus:outline-none text-base bg-white border-slate-200" type="text" name="name" id="acc-name" placeholder="ex. acumalaka" value={accountForm.name} onChange={(event) => setAccountForm((current) => ({ ...current, name: event.target.value }))} onInput={(e) => e.target.classList.remove("border-red-500")} />
        </div>

        <div className="text-xs flex flex-col mb-2">
          <label htmlFor="acc-start" className="text-xs font-medium text-slate-500 mb-1">Start Balance</label>
          <input className="border px-3 py-2 rounded-xl focus:outline-none text-base bg-white border-slate-200" type="text" name="name" id="acc-start" value={accountForm.balance} onChange={(event) => {
            const rawVal = event.target.value.replace(/\D/g, "");
            const formattedVal = rawVal ? myUtils.formatMoney(Number(rawVal)) : "0";
            setAccountForm((current) => ({ ...current, balance: formattedVal }));
          }} onInput={(e) => e.target.classList.remove("border-red-500")} />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 border rounded-xl text-slate-700 hover:bg-slate-50 text-sm" onClick={closeAccountPopup}>Cancel</button>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white text-sm font-medium" id="btn-save-acc" onClick={handleSaveAccount}>Save</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
