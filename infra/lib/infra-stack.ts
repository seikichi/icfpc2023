import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  DATABASE_URL: z.string().startsWith("mysql://"),
});

const env = Env.parse(process.env);

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.DockerImageFunction(this, "Solver", {
      code: lambda.DockerImageCode.fromImageAsset("../", {
        file: "../lambda/solver/Dockerfile",
      }),

      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      environment: {
        DATABASE_URL: env.DATABASE_URL,
      },
    });
  }
}
