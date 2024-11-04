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
  email: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    secure: process.env.MAIL_SECURE === 'true',
    senderEmail: process.env.MAIL_SENDER_EMAIL,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    tls: process.env.MAIL_TLS,
    required: process.env.MAIL_REQUIRE_TLS === 'true',
    timeout: parseInt(process.env.MAIL_SOCKET_TIMEOUT, 10)
  },
  jwtSecret: process.env.JWT_SECRET,
});
