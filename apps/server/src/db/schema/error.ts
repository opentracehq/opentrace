import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const errorReport = pgTable("error_report", {
  id: uuid("id").primaryKey(),
  projectId: text("project_id").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
