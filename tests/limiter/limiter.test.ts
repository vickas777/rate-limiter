import InMemoryUser from '../../src/users/in_mem_user';
import InMemoryConfig from '../../src/cloud_config/in_mem_config';
import InMemoryStorage from '../../src/storage/in_mem_storage';
import RateLimiter from '../../src/limiter/limiter';
import RedirectResponse from '../../src/responce/redirect_res';
import DenyResponse from '../../src/responce/deny_res';

const user = new InMemoryUser();
const config = new InMemoryConfig();
const storage = new InMemoryStorage();

const localIp = '127.0.0.1';

describe('rate limiter', () => {
  it('should redirect for unknown user', () => {
    expect.assertions(1);
    const limiter = new RateLimiter(user, storage, config);
    const result = limiter.process({}, localIp, '/');
    expect(result).toBeInstanceOf(RedirectResponse);
  });

  it('should redirect for known user', () => {
    expect.assertions(1);
    const limiter = new RateLimiter(user, storage, config);
    const result = limiter.process({ authorization: 'abc123' }, localIp, '/');
    expect(result).toBeInstanceOf(RedirectResponse);
  });

  it('should not allow to many requests', () => {
    expect.assertions(5);
    const limiter = new RateLimiter(user, storage, config);
    for (let i = 1; i < 5; i += 1) {
      const result = limiter.process({ authorization: 'abc123' }, localIp, '/');
      expect(result).toBeInstanceOf(RedirectResponse);
    }
    const result = limiter.process({ authorization: 'abc123' }, localIp, '/');
    expect(result).toBeInstanceOf(DenyResponse);
  });
});
