/** biome-ignore-all lint/style/noMagicNumbers: dev tools mvp */
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { errorGroups, errorReport } from "../db/schema/error.js";
import { generateFingerprint } from "../lib/fingerprint.js";
import { publicProcedure, router } from "../lib/trpc.js";
import { createErrorReportSchema } from "../schemas/error.js";

export const errorReportsRouter = router({
  // Production routes
  ingest: publicProcedure
    .input(createErrorReportSchema)
    .mutation(async ({ input }) => {
      const p = input.payload;

      const fingerprint = generateFingerprint(
        p.message ?? "Unknown", 
        p.stack, 
        input.projectId
      );

      // Insert into error reports table
      const result = await db
        .insert(errorReport)
        .values({
          projectId: input.projectId,
          message: p.message ?? "Unknown error",
          type: p.errorName ?? p.name ?? p.type ?? "Error",
          source: p.source,
          line: p.line ? Number(p.line) : null,
          column: p.column ? Number(p.column) : null,
          stack: p.stack,
          userAgent: p.userAgent ?? "unknown",
          fingerprint,
          payload: p,
          createdAt: new Date(),
        })
        .returning();

      // Upsert into error groups table
      await db
        .insert(errorGroups)
        .values({
          projectId: input.projectId,
          fingerprint,
          message: p.message ?? "Unknown error",
          type: p.errorName ?? p.name ?? p.type ?? "Error",
          source: p.source,
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrences: 1,
        })
        .onConflictDoUpdate({
          target: [errorGroups.projectId, errorGroups.fingerprint],
          set: {
            lastSeen: new Date(),
            occurrences: sql`${errorGroups.occurrences} + 1`,
          },
        });

      return { ...result[0], fingerprint };
    }),

  getAll: publicProcedure.query(async () => {
    const reports = await db
      .select()
      .from(errorReport)
      .orderBy(errorReport.createdAt)
      .limit(10);
    return reports;
  }),

  getGroups: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(errorGroups)
        .where(eq(errorGroups.projectId, input.projectId))
        .orderBy(desc(errorGroups.lastSeen))
        .limit(20);
    }),

  // Dev routes
  generateOne: publicProcedure.mutation(async () => {
    const payload = {
      error: "boom",
      message: "Something went wrong",
      stack: "Error: boom at line 42",
      timestamp: new Date().toISOString(),
    };

    const fingerprint = generateFingerprint(payload.message, payload.stack, "demo");

    const result = await db
      .insert(errorReport)
      .values({
        projectId: "demo",
        message: payload.message,
        type: "Error",
        source: "dev-generator",
        line: 42,
        column: 10,
        stack: payload.stack,
        userAgent: "dev-tool",
        fingerprint,
        payload,
        createdAt: new Date(),
      })
      .returning();

    // Upsert into error groups
    await db
      .insert(errorGroups)
      .values({
        projectId: "demo",
        fingerprint,
        message: payload.message,
        type: "Error",
        source: "dev-generator",
        firstSeen: new Date(),
        lastSeen: new Date(),
        occurrences: 1,
      })
      .onConflictDoUpdate({
        target: [errorGroups.projectId, errorGroups.fingerprint],
        set: {
          lastSeen: new Date(),
          occurrences: sql`${errorGroups.occurrences} + 1`,
        },
      });

    return result[0];
  }),

  generateMany: publicProcedure.mutation(async () => {
    const errorMessages = [
      "Network timeout",
      "Database connection failed",
      "Invalid user input",
      "Permission denied",
      "Resource not found",
      "Memory limit exceeded",
      "Parse error",
      "Authentication failed",
      "Rate limit exceeded",
      "Internal server error",
    ];

    const reports = Array.from({ length: 10 }, (_, i) => {
      const payload = {
        error: errorMessages[i],
        message: `Error ${i + 1}: ${errorMessages[i]}`,
        code: `ERR_${String(i + 1).padStart(3, "0")}`,
        severity: "critical",
        timestamp: new Date().toISOString(),
      };

      const projectId = Math.random() > 0.5 ? "demo" : "production";
      const stack = `Error: ${errorMessages[i]}\n    at function${i + 1} (file.js:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 50) + 1})`;
      const fingerprint = generateFingerprint(payload.message, stack, projectId);

      return {
        projectId,
        message: payload.message,
        type: "Error",
        source: "dev-generator",
        line: Math.floor(Math.random() * 100) + 1,
        column: Math.floor(Math.random() * 50) + 1,
        stack,
        userAgent: "dev-tool",
        fingerprint,
        payload,
        createdAt: new Date(),
      };
    });

    const result = await db.insert(errorReport).values(reports).returning();

    // Also create/update error groups for each report
    for (const report of result) {
      await db
        .insert(errorGroups)
        .values({
          projectId: report.projectId,
          fingerprint: report.fingerprint!,
          message: report.message,
          type: report.type,
          source: report.source,
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrences: 1,
        })
        .onConflictDoUpdate({
          target: [errorGroups.projectId, errorGroups.fingerprint],
          set: {
            lastSeen: new Date(),
            occurrences: sql`${errorGroups.occurrences} + 1`,
          },
        });
    }

    return result;
  }),

  deleteAll: publicProcedure.mutation(async () => {
    const reportsResult = await db.delete(errorReport).returning();
    const groupsResult = await db.delete(errorGroups).returning();
    return { 
      deletedReports: reportsResult.length,
      deletedGroups: groupsResult.length 
    };
  }),

  deleteById: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await db
        .delete(errorReport)
        .where(eq(errorReport.id, input.id))
        .returning();
      return result[0];
    }),
});
