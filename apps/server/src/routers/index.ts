import { db } from "@/db/index.js";
import { errorReport } from "@/db/schema/error.js";
import { createErrorReportSchema } from "@/schemas/error.js";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc.js";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),
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
});
export type AppRouter = typeof appRouter;
