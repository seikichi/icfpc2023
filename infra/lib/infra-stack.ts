import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.DockerImageFunction(this, "Solver", {
      code: lambda.DockerImageCode.fromImageAsset("../"),
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
      },
    });
  }
}
