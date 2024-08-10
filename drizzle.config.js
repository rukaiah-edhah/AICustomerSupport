export default {
  schema: './db/schema/*.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  out: './drizzle'
}