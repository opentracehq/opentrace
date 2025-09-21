import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

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
  fingerprint: text("fingerprint"),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const errorGroups = pgTable(
  "error_groups",
  {
    id: serial("id").primaryKey(),
    projectId: text("project_id").notNull(),
    fingerprint: text("fingerprint").notNull(),
    message: text("message").notNull(),
    type: text("type"),
    source: text("source"),
    firstSeen: timestamp("first_seen").defaultNow().notNull(),
    lastSeen: timestamp("last_seen").defaultNow().notNull(),
    occurrences: integer("occurrences").default(1).notNull(),
  },
  (table) => ({
    uniqueFingerprint: unique().on(table.projectId, table.fingerprint),
  })
);
