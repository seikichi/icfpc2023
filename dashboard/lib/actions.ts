"use server";

import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from "@aws-sdk/client-lambda";

import { env } from "@/lib/env";
import { SubmitParams } from "./schema";

import AWS from "aws-sdk";

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
  const s3 = new AWS.S3();
  const params = {
    Bucket: env.BUCKET,
    Key: bucketKey,
    Expires: 60 * 60 * 24,
    ResponseContentDisposition: `attachment; filename="solution_${bucketKey}.json"`
  };
  try {
    const url = await s3.getSignedUrlPromise("getObject", params);
    return { url };
  } catch (err) {
    console.log(err);
    return { url: "" };
  }
};
