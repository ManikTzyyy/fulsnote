import { db } from "../db/database.js";
import { TransactionModel } from "../models/transactionModel.js";

export const TransactionService = {
  formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },

  getCurrentMonthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: this.formatLocalDate(firstDay),
      endDate: this.formatLocalDate(lastDay),
    };
  },

  async getCurrentMonth() {
    const { startDate, endDate } = this.getCurrentMonthRange();
    return await TransactionModel.getDataFromRange(startDate, endDate);
  },

  async getByRange(startDate, endDate) {
    return await TransactionModel.getDataFromRange(startDate, endDate);
  },

  async createTrc(
    date,
    desc,
    from_account_id,
    to_account_id,
    amount,
    bg_from,
    clr_from,
    bg_to,
    clr_to,
    isIncome
  ) {
    const status = isIncome ? "in" : "ex";
    const id = isIncome ? to_account_id : from_account_id;

    const acc = await db.accounts.get(id);

    if (isIncome) {
      await db.accounts.update(id, {
        balance: acc.balance + amount,
      });
    } else {
      await db.accounts.update(id, {
        balance: acc.balance - amount,
      });
    }

    return await TransactionModel.create({
      date: date,
      desc: desc,
      status: status,
      from_account_id: isIncome ? null : from_account_id,
      to_account_id: isIncome ? to_account_id : null,
      amount: amount,
      bg_from: bg_from,
      clr_from: clr_from,
      bg_to: bg_to,
      clr_to: clr_to,
      created_at: new Date(),
    });
  },

  async createTransfer(
    date,
    desc,
    from_account_id,
    to_account_id,
    amount,
    bg_from,
    clr_from,
    bg_to,
    clr_to,
    type
  ) {
    const accFrom = await db.accounts.get(from_account_id);
    const accTo = await db.accounts.get(to_account_id);

    await Promise.all([
      db.accounts.update(accFrom.id, {
        balance: accFrom.balance - amount,
      }),
      db.accounts.update(accTo.id, {
        balance: accTo.balance + amount,
      }),
    ]);

    return await TransactionModel.create({
      date: date,
      desc: desc,
      status: type,
      from_account_id: from_account_id,
      to_account_id: to_account_id,
      amount: amount,
      bg_from: bg_from,
      clr_from: clr_from,
      bg_to: bg_to,
      clr_to: clr_to,
      created_at: new Date(),
    });
  },

  async getAll() {
    return await TransactionModel.getAll();
  },

  async delete(id, acc_id, amount, isIncome) {
    const acc = await db.accounts.get(acc_id);
    if (!acc) {
      return await TransactionModel.delete(id);
    }

    if (isIncome) {
      await db.accounts.update(acc_id, {
        balance: acc.balance - amount,
      });
    } else {
      await db.accounts.update(acc_id, {
        balance: acc.balance + amount,
      });
    }

    return await TransactionModel.delete(id);
  },

  async deleteTrfType(id, amount, from, to) {
    const accFrom = await db.accounts.get(from);
    const accTo = await db.accounts.get(to);

    await Promise.all([
      db.accounts.update(from, {
        balance: accFrom.balance + amount,
      }),
      db.accounts.update(to, {
        balance: accTo.balance - amount,
      }),
    ]);

    return await TransactionModel.delete(id);
  },

  async findById(id) {
    return await TransactionModel.findById(id);
  },
};
