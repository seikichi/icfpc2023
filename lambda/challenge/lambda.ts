// Lambda 実行用

import { Handler } from "aws-lambda";
import { z } from "zod";

import { PrismaClient } from "@prisma/client";
import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from "@aws-sdk/client-lambda";
const prisma = new PrismaClient();

const ChallengeEvent = z.object({
  tag: z.string().max(16),
  args: z.string().max(64),
  target: z.string().min(1).max(32),
});

type ChallengeEvent = z.infer<typeof ChallengeEvent>;

const Env = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
  SOLVER_LAMBDA_ARN: z.string().startsWith("arn:aws:lambda:"),
});

export const handler: Handler = async (event, _context) => {
  const env = Env.parse(process.env);
  const e = ChallengeEvent.parse(event);
  console.log({ ...e, ...env });

  const lambda = new LambdaClient({ region: "ap-northeast-1" });

  const { id: challengeId } = await prisma.challenge.create({
    data: {
      args: e.args,
      tag: e.tag,
      target: e.target,
      score: 0,
      failed: 0,
      solved: 0,
    },
  });

  // 問題IDパース
  const ids: Set<number> = new Set([]);
  for (const ps of e.target.split(",")) {
    if (ps.includes("-")) {
      const [fromS, toS] = ps.split("-");
      const [from, to] = [parseInt(fromS, 10), parseInt(toS, 10)];
      for (let i = from; i <= to; i++) {
        ids.add(i);
      }
    } else {
      ids.add(parseInt(ps, 10));
    }
  }

  for (const problemId of Array.from(ids)) {
    console.log(`invoke: ${problemId}`);
    await lambda.send(
      new InvokeCommand({
        InvocationType: InvocationType.Event,
        FunctionName: env.SOLVER_LAMBDA_ARN,
        Payload: JSON.stringify({
          problemId,
          challengeId,
          args: e.args,
        }),
      })
    );
  }
};
