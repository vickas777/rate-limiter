import { Config, ConfigDAO } from './Config';
import database from './config.db';

class InMemoryConfig implements ConfigDAO {
  private db = database;

  getUrlWage(url: string): number {
    const config: Config | undefined = this.db.find((item) => item.url === url);
    if (!config) {
      return 1;
    }

    return config.wage;
  }
}

export default InMemoryConfig;
