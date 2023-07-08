import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
// import * as sns from "aws-cdk-lib/aws-sns";
// import * as sqs from "aws-cdk-lib/aws-sqs";
// import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
// import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

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
      },
    });

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    bucket.grantReadWrite(solver);

    // SNS & SQS & Lambda test
    // const topic = new sns.Topic(this, "Topic");
    // const queue = new sqs.Queue(this, "Queue", {
    //   visibilityTimeout: cdk.Duration.minutes(15),
    // });
    // topic.addSubscription(
    //   new SqsSubscription(queue, {
    //     filterPolicy: {
    //       kind: sns.SubscriptionFilter.stringFilter({ allowlist: ["sandbox"] }),
    //     },
    //   })
    // );
    // const sandbox = new lambda.DockerImageFunction(this, "Sandbox", {
    //   code: lambda.DockerImageCode.fromImageAsset("../lambda/sandbox"),
    //   timeout: cdk.Duration.minutes(15),
    //   memorySize: 128,
    // });
    // sandbox.addEventSource(new SqsEventSource(queue));
  }
}
