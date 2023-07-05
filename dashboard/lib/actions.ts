"use server";

import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

import { env } from "@/lib/env";

export async function invokeSolver() {
  const client = new LambdaClient({});
  const command = new InvokeCommand({ FunctionName: env.SOLVER_LAMBDA_ARN });
  await client.send(command);
}
