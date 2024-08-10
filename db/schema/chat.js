import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const chat = pgTable('chat', {
  id: serial('id').primaryKey(),
  role: text('role').notNull(), //json format of the AI that responds
  content: text('content').notNull(),
  createdAt: timestamp('createdAt', {withTimezone:true}).defaultNow().notNull(),
});

