export interface StorageDAO {
  getLimitRecord(id: string): Storage | null
  decreaseTokenById(id: string, amount: number): void
  setupLimitRecord(id: string, limit: number): Storage
  resetEntryTimer(id: string, limit: number): void
}

export type Storage = {
  tokens: number,
  timestamp: number
};
