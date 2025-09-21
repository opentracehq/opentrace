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
      const result = await db
        .insert(errorReport)
        .values({
          projectId: input.projectId,
          payload: input.payload,
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
    const result = await db
      .insert(errorReport)
      .values({
        projectId: "demo",
        payload: {
          error: "boom",
          message: "Something went wrong",
          stack: "Error: boom at line 42",
          timestamp: new Date().toISOString(),
        },
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

    const reports = Array.from({ length: 10 }, (_, i) => ({
      // biome-ignore lint/style/noMagicNumbers: dev tools mvp
      projectId: Math.random() > 0.5 ? "demo" : "production",
      payload: {
        error: errorMessages[i],
        message: `Error ${i + 1}: ${errorMessages[i]}`,
        // biome-ignore lint/style/noMagicNumbers: dev tools mvp
        code: `ERR_${String(i + 1).padStart(3, "0")}`,
        severity: "critical",
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
    }));

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
