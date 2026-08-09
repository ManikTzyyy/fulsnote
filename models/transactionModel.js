import { db } from "../db/database.js";

export const TransactionModel = {
  async create(data) {
    const id = await db.transactions.add(data);
    return {
      id,
      ...data,
    };
  },

  async getAll() {
    return await db.transactions.toArray();
  },

  async delete(id) {
    return await db.transactions.delete(id);
  },

  async findById(id) {
    return await db.transactions.get(id);
  },

  async findByAccountId(accId) {
    return await db.transactions
      .filter(
        (trc) => trc.from_account_id === accId || trc.to_account_id === accId
      )
      .toArray();
  },

  async getDataFromRange(startDate, endDate) {
    return await db.transactions
      .where("date")
      .between(startDate, endDate, true, true)
      .toArray();
  },
};
