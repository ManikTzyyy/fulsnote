import { AccountModel } from "../models/accountModel.js";
import { TransactionModel } from "../models/transactionModel.js";

export const accountServices = {
  async createAccount(name, balance = 0, icon = "", bg_clr, ic_clr) {
    return AccountModel.create({
      name,
      balance,
      icon,
      bg_clr,
      ic_clr,
      created_at: new Date(),
    });
  },

  async updateAccount(id, name, balance = 0, icon = "", bg_clr, ic_clr) {
    return AccountModel.update(id, {
      name,
      balance,
      icon,
      bg_clr,
      ic_clr,
    });
  },

  async delete(id) {
    const relatedTrc = await TransactionModel.findByAccountId(id);

    await Promise.all(relatedTrc.map((trc) => TransactionModel.delete(trc.id)));

    return AccountModel.delete(id);
  },

  async getAll() {
    return AccountModel.getAll();
  },

  async findById(id) {
    return AccountModel.findById(id);
  },
};
