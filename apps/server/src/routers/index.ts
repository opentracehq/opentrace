import { protectedProcedure, publicProcedure, router } from "../lib/trpc.js";
import { errorReportsRouter } from "./error-reports.js";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),
  errorReports: errorReportsRouter,
});
export type AppRouter = typeof appRouter;
