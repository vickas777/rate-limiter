import { StorageDAO, Storage } from './Storage';

class InMemoryStorage implements StorageDAO {
  private storage: { [key: string]: Storage } = {};

  getLimitRecord(id: string): Storage | null {
    if (!{}.hasOwnProperty.call(this.storage, id)) {
      return null;
    }
    return this.storage[id];
  }

  decreaseTokenById(id: string, amount: number) {
    const entry = this.storage[id];
    entry.tokens -= amount;
  }

  setupLimitRecord(id: string, limit: number): Storage {
    const record = {
      tokens: limit,
      timestamp: Date.now(),
    };
    this.storage[id] = record;
    return record;
  }

  resetEntryTimer(id: string, limit: number) {
    const entry = this.storage[id];
    entry.timestamp = Date.now();
    entry.tokens = limit;
  }
}

export default InMemoryStorage;
