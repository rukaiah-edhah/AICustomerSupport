import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const chat = pgTable('chat', {
  id: serial('id').primaryKey(),
  role: text('role'),
  content: text('content'),
  createdAt: timestamp('createdAt', {timeZone}).defaultNow().notNull(),
});

