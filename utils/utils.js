import { AccountModel } from "../models/accountModel.js";
import { TransactionModel } from "../models/transactionModel.js";

export const myUtils = {
  inputValidator(id) {
    const el = document.getElementById(id);
    if (!el) return false;
    if (el.disabled) {
      el.classList.remove("border-red-500");
      return false;
    }
    if (!el.value) {
      el.classList.add("border-red-500");
      return true;
    }
    el.classList.remove("border-red-500");
    return false;
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },

  formatMoney(value) {
    return new Intl.NumberFormat("id-ID").format(value || 0);
  },

  getAllWithAcc(trcData, accData) {
    const accMap = Object.fromEntries(accData.map((a) => [a.id, a]));
    return trcData.map((trx) => ({
      ...trx,
      acc_from: accMap[trx.from_account_id],
      acc_to: accMap[trx.to_account_id],
    }));
  },

  getTrcWithAcc(trc, acc, isIncome) {
    return {
      ...trc,
      acc_from: !isIncome ? acc : null,
      acc_to: isIncome ? acc : null,
    };
  },

  getTrcWithAccTrf(trc, accfrom, accto) {
    return {
      ...trc,
      acc_from: accfrom,
      acc_to: accto,
    };
  },

  async exportData() {
    return {
      acc: await AccountModel.getAll(),
      trc: await TransactionModel.getAll(),
    };
  },

  extractDataToChart(array) {
    const grouped = {};

    array.forEach((trc) => {
      if (!["in", "ex"].includes(trc.status)) return;

      if (!grouped[trc.date]) {
        grouped[trc.date] = {
          date: trc.date,
          income: 0,
          expense: 0,
        };
      }

      if (trc.status === "in") {
        grouped[trc.date].income += trc.amount;
      }

      if (trc.status === "ex") {
        grouped[trc.date].expense += trc.amount;
      }
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  },

  extractCashFlow(array) {
    let balance = 0;
    return array.map((item) => {
      balance += item.income;
      balance -= item.expense;

      return {
        date: item.date,
        balance,
      };
    });
  },
};
