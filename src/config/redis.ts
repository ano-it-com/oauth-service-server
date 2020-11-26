export default {
  ioredis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
  },
};
