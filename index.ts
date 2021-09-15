import RateLimiter from './src/limiterRunner';

function main() {
  const rateLimiter = new RateLimiter();
  rateLimiter.start();
}

main();
