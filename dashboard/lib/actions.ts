"use server";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

import { env } from "@/lib/env";

export async function invokeSolver() {
  const client = new LambdaClient({ region: env.AWS_DEFAULT_REGION });
  const command = new InvokeCommand({ FunctionName: env.SOLVER_LAMBDA_ARN });
  const result = await client.send(command);
  return JSON.parse(Buffer.from(result.Payload!).toString("utf-8"));
}
