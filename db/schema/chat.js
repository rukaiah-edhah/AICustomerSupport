import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const chat = pgTable('chat', {
  id: serial('id').primaryKey(),
})