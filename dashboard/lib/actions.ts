"use server";

import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from "@aws-sdk/client-lambda";

import { env } from "@/lib/env";
import { SubmitParams } from "./schema";

export async function invokeSolver() {
  const client = new LambdaClient({ region: env.AWS_DEFAULT_REGION });
  const command = new InvokeCommand({ FunctionName: env.SOLVER_LAMBDA_ARN });
  const result = await client.send(command);
  return JSON.parse(Buffer.from(result.Payload!).toString("utf-8"));
}

export async function invokeChallenge(params: SubmitParams) {
  const client = new LambdaClient({ region: env.AWS_DEFAULT_REGION });
  const command = new InvokeCommand({
    InvocationType: InvocationType.Event,
    FunctionName: env.CHALLENGE_LAMBDA_ARN,
    Payload: JSON.stringify(SubmitParams.parse(params)),
  });
  await client.send(command);
}

export async function generateSolutionUrl(
  bucketKey: string
): Promise<{ url: string }> {
  // TODO
  // aws の s3 の client を使って bucketKey からいい感じに URL を生成して返そう
  console.log(env.BUCKET);
  return { url: "https://example.com" };
}
