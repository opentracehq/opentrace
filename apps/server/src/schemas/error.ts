import { z } from "zod";

export const errorReportSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  payload: z.any(),
  createdAt: z.string(),
});

export const createErrorReportSchema = z.object({
  projectId: z.string(),
  payload: z.any(),
});
