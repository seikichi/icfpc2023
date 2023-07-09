import { z } from "zod";

export const Env = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
  AUTH_USER: z.string().optional(),
  AUTH_PASSWORD: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().startsWith("AKIA"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_DEFAULT_REGION: z.string().min(1),
  SOLVER_LAMBDA_ARN: z.string().startsWith("arn:aws:lambda:"),
  CHALLENGE_LAMBDA_ARN: z.string().startsWith("arn:aws:lambda:"),
  BUCKET: z.string().min(1),
});

export type Env = z.infer<typeof Env>;

export const Room = z.object({
  room_width: z.number().gt(0),
  room_height: z.number().gt(0),
  stage_width: z.number().gt(0),
  stage_height: z.number().gt(0),
  stage_bottom_left: z.tuple([z.number().min(0), z.number().min(0)]),
  musicians: z.number().min(0).array().min(1),
  attendees: z
    .object({
      x: z.number(),
      y: z.number(),
      tastes: z.number().array().min(1),
    })
    .array()
    .min(1),
  pillars: z
    .object({
      center: z.tuple([z.number().min(0), z.number().min(0)]),
      radius: z.number().min(0),
    })
    .array()
    .min(0)
    .optional(),
});

export type Room = z.infer<typeof Room>;

export const Solution = z.object({
  placements: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .array()
    .min(1),
});

export type Solution = z.infer<typeof Solution>;

export const SubmitParams = z.object({
  tag: z
    .string()
    .min(1)
    .max(16)
    .regex(/^[a-zA-Z0-9\-]*$/),
  args: z.string().min(1).max(64),
  target: z
    .string()
    .min(1)
    .max(32)
    .regex(/^([1-9][0-9]*(-[1-9][0-9]*)?)(,([1-9][0-9]*(-[1-9][0-9]*)?))*$/),
});

export type SubmitParams = z.infer<typeof SubmitParams>;
