import { z } from "zod";

export const Env = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
  AUTH_USER: z.string().optional(),
  AUTH_PASSWORD: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().startsWith("AKIA"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_DEFAULT_REGION: z.string().min(1),
  SOLVER_LAMBDA_ARN: z.string().startsWith("arn:aws:lambda:"),
});

export type Env = z.infer<typeof Env>;
