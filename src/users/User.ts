export interface UserDAO {
  getUserByToken(token: string): User | null
}

export type User = {
  id: string
  limit: number
};
