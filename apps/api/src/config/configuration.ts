export default () => ({
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  allowedOrigins: (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000').split(','),
  database: {
    url: process.env['DATABASE_URL'],
  },
  etherscan: {
    apiKey: process.env['ETHERSCAN_API_KEY'] ?? '',
  },
  coingecko: {
    apiKey: process.env['COINGECKO_API_KEY'] ?? '',
  },
  jwt: {
    secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? 'dev-refresh-secret-change-in-production',
    accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  },
  supabase: {
    url: process.env['SUPABASE_URL'] ?? '',
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
    jwtSecret: process.env['SUPABASE_JWT_SECRET'] ?? '',
  },
  openai: {
    apiKey: process.env['OPENAI_API_KEY'] ?? '',
    model: process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini',
  },
});
