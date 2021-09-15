import { Server, createServer } from 'http';
import RateLimiter from './limiter/limiter';
import InMemoryUser from './users/in_mem_user';
import InMemoryConfig from './cloud_config/in_mem_config';
import InMemoryStorage from './storage/in_mem_storage';
import RedirectResponse from './response/redirect_res';
import DenyResponse from './response/deny_res';
import { Response } from './response/Response';

class LimiterRunner {
  private server: Server;

  constructor() {
    const user = new InMemoryUser();
    const config = new InMemoryConfig();
    const storage = new InMemoryStorage();
    const redirectHost = process.env.REDIRECT_HOST;
    if (!redirectHost) {
      throw Error('Can\'t start start server without redirect address');
    }

    const limiter = new RateLimiter(user, storage, config);
    this.server = createServer((req, res) => {
      const { headers, socket, url } = req;
      const decision: Response = limiter.process(headers, socket.remoteAddress, url);
      const code: number = decision.getCode();
      if (decision instanceof DenyResponse) {
        res.writeHead(code, { 'Content-Type': 'application/json' });
        res.write(decision.getMessage());
      } else if (decision instanceof RedirectResponse) {
        res.writeHead(code, {
          location: `${redirectHost}${url}`,
        });
      }
      res.end();
    });
  }

  start() {
    const port = process.env.PORT || 8088;
    this.server.listen(port);
    console.log(`Proxy have started at port ${port}`);
  }
}

export default LimiterRunner;
