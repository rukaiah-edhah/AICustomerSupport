CREATE TABLE IF NOT EXISTS "chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text,
	"content" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
