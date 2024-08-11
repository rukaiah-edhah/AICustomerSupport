import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const chat = pgTable('chat', {
  id: serial('id').primaryKey(),
  user_id: text('user_id'),
  chat_id: integer('chat_id'),
  role: text('role').notNull(), //json format of the AI that responds
  content: text('content').notNull(),
  createdAt: timestamp('createdAt', {withTimezone:true}).defaultNow().notNull(),
});

