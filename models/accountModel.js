import { db } from "../db/database.js";

export const AccountModel = {
  async create(data) {
    const id = await db.accounts.add(data);

    return {
      id,
      ...data,
    };
  },

  async getAll() {
    return await db.accounts.toArray();
  },

  update(id, data) {
    return db.accounts.update(id, data);
  },

  delete(id) {
    return db.accounts.delete(id);
  },

  findById(id) {
    return db.accounts.get(id);
  },
};
