import { z } from "zod";

export const errorReportSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  payload: z.any(),
  createdAt: z.string(),
});
