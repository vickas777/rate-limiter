import { IncomingHttpHeaders } from 'http';
import { URL } from 'url';
import { StorageDAO } from '../storage/Storage';
import { User, UserDAO } from '../users/User';
import { ConfigDAO } from '../cloud_config/Config';
import DenyResponse from '../responce/deny_res';
import RedirectResponse from '../responce/redirect_res';
import { Response } from '../responce/Response';

const DEFAULT_RATE_LIMIT = 10;
const DEFAULT_PERIOD_MIN = 60;

const REDIRECT_CODE = 307;
const RATE_OVER_LIMIT_CODE = 429;

class Limiter {
  private user: UserDAO;

  private limiterStorage: StorageDAO;

  private config: ConfigDAO;

  // eslint-disable-next-line max-len
  private rateLimit: number = parseInt(process.env.DEFAULT_RATE_LIMIT as string, 10) || DEFAULT_RATE_LIMIT;

  // eslint-disable-next-line max-len
  private retryWindowInNs = (parseInt(process.env.DEFAULT_PERIOD_MIN as string, 10) || DEFAULT_PERIOD_MIN) * 60 * 1000;

  constructor(user: UserDAO, limiterStorage: StorageDAO, config: ConfigDAO) {
    this.user = user;
    this.limiterStorage = limiterStorage;
    this.config = config;
  }

  process(headers: IncomingHttpHeaders, remoteAddress: string = '', url: string = ''): Response {
    const { id, limit } = this.getUserInfo(headers)
                          || this.generateUserInfoFromIp(headers, remoteAddress);

    const { tokens, timestamp } = this.limiterStorage.getLimitRecord(id)
                                  || this.limiterStorage.setupLimitRecord(id, limit);

    const isInWindow = timestamp + this.retryWindowInNs > Date.now();

    if (isInWindow && tokens === 0) {
      return this.denyResponse(timestamp);
    }

    const { pathname } = new URL(url, `http://${headers.host}`);
    const wage = this.config.getUrlWage(pathname);

    if (!isInWindow) {
      this.limiterStorage.resetEntryTimer(id, limit - wage);
      return new RedirectResponse(REDIRECT_CODE);
    }

    if (tokens >= wage) {
      this.limiterStorage.decreaseTokenById(id, wage);
      return new RedirectResponse(REDIRECT_CODE);
    }

    return this.denyResponse(timestamp);
  }

  private getUserInfo(headers: IncomingHttpHeaders): User | null {
    const authToken = headers.authorization;
    if (!authToken) {
      return null;
    }
    return this.user.getUserByToken(authToken as string);
  }

  private generateUserInfoFromIp(headers: IncomingHttpHeaders, remoteAddress: string): User {
    const ip: string = headers['x-forwarded-for'] as string || '';

    // @ts-ignore
    const id = ip.split(',').pop().trim() || remoteAddress;

    return {
      id: id as string,
      limit: this.rateLimit,
    };
  }

  private denyResponse(timestamp: number): DenyResponse {
    const timeLeft = timestamp + this.retryWindowInNs;
    const response = {
      message: `You will be able to make next request ${new Date(timeLeft).toJSON()}`,
    };
    return new DenyResponse(RATE_OVER_LIMIT_CODE, JSON.stringify(response));
  }
}

export default Limiter;
