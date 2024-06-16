export default () => ({
    port: parseInt(process.env.NESTJS_PORT, 10) || 3200,
    database: {
      url: process.env.DATABASE_URL,
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      dbName: process.env.POSTGRES_DB,
    },
    jwtSecret: process.env.JWT_SECRET,
  });
  