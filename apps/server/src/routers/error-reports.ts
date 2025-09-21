/** biome-ignore-all lint/style/noMagicNumbers: dev tools mvp */
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { errorReport } from "../db/schema/error.js";
import { publicProcedure, router } from "../lib/trpc.js";
import { createErrorReportSchema } from "../schemas/error.js";

export const errorReportsRouter = router({
  // Production routes
  ingest: publicProcedure
    .input(createErrorReportSchema)
    .mutation(async ({ input }) => {
      const p = input.payload;

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
          payload: p,
          createdAt: new Date(),
        })
        .returning();
      return result[0];
    }),

  getAll: publicProcedure.query(async () => {
    const reports = await db
      .select()
      .from(errorReport)
      .orderBy(errorReport.createdAt)
      .limit(10);
    return reports;
  }),

  // Dev routes
  generateOne: publicProcedure.mutation(async () => {
    const payload = {
      error: "boom",
      message: "Something went wrong",
      stack: "Error: boom at line 42",
      timestamp: new Date().toISOString(),
    };

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
        payload,
        createdAt: new Date(),
      })
      .returning();
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

      return {
        projectId: Math.random() > 0.5 ? "demo" : "production",
        message: payload.message,
        type: "Error",
        source: "dev-generator",
        line: Math.floor(Math.random() * 100) + 1,
        column: Math.floor(Math.random() * 50) + 1,
        stack: `Error: ${errorMessages[i]}\n    at function${i + 1} (file.js:${Math.floor(Math.random() * 100) + 1}:${
          Math.floor(Math.random() * 50) + 1
        })`,
        userAgent: "dev-tool",
        payload,
        createdAt: new Date(),
      };
    });

    const result = await db.insert(errorReport).values(reports).returning();
    return result;
  }),

  deleteAll: publicProcedure.mutation(async () => {
    const result = await db.delete(errorReport).returning();
    return { deletedCount: result.length };
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
