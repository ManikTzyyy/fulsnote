import Dexie from "dexie";

export const db = new Dexie("FinanceDB");

db.version(2).stores({
  accounts: "++id, name, balance, icon, created_at, bg_clr, ic_clr",
  transactions:
    "++id, date, desc, status, from_account_id, to_account_id, amount, bg_from, clr_from, bg_to, clr_to, created_at",
});
