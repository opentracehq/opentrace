import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const errorReport = pgTable("error_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: text("project_id").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  source: text("source"),
  line: integer("line"),
  column: integer("column"),
  stack: text("stack"),
  userAgent: text("user_agent"),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
