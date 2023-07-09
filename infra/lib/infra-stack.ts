import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";

import "dotenv/config";
import { z } from "zod";

import * as child_process from "child_process";

const Env = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
  API_TOKEN: z.string().startsWith("eyJ"),
});

const env = Env.parse(process.env);

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // get commit hash
    const commitHash = child_process
      .execSync("git rev-parse --short HEAD")
      .toString()
      .trim();

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const solver = new lambda.DockerImageFunction(this, "Solver", {
      code: lambda.DockerImageCode.fromImageAsset("../", {
        file: "lambda/solver/Dockerfile",
      }),
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        DATABASE_URL: env.DATABASE_URL,
        COMMIT_ID: commitHash,
        API_TOKEN: env.API_TOKEN,
        BUCKET: bucket.bucketName,
      },
    });

    bucket.grantReadWrite(solver);

    const challenge = new lambda.DockerImageFunction(this, "Challenge", {
      code: lambda.DockerImageCode.fromImageAsset("../", {
        file: "lambda/challenge/Dockerfile",
      }),
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        DATABASE_URL: env.DATABASE_URL,
        SOLVER_LAMBDA_ARN: solver.functionArn,
        COMMIT_ID: commitHash,
      },
    });

    solver.grantInvoke(challenge);
  }
}
