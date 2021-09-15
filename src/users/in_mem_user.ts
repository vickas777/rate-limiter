import { User, UserDAO } from './User';
import database from './users.db';

class InMemoryUser implements UserDAO {
  private db = database;

  getUserByToken(token: string): User | null {
    const user = this.db.find((item) => item.token === token);
    if (!user) {
      return null;
    }
    const { limit, id } = user;
    return {
      id: String(id),
      limit,
    };
  }
}

export default InMemoryUser;
