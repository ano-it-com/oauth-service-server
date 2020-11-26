export default {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  logging: process.env.NODE_ENV !== 'production',
  entities: [process.env.TYPEORM_ENTITIES],
  migrations: ['dist/migrations/*!(.d).js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
  synchronize: true,
};
