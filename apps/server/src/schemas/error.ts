import { z } from "zod";

export const errorReportSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  message: z.string(),
  type: z.string().nullable(),
  source: z.string().nullable(),
  line: z.number().nullable(),
  column: z.number().nullable(),
  stack: z.string().nullable(),
  userAgent: z.string().nullable(),
  payload: z.any(),
  createdAt: z.string(),
});

export const createErrorReportSchema = z.object({
  projectId: z.string(),
  payload: z.any(),
});
