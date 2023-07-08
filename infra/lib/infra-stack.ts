import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

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
        file: "lambda/solver/Dockerfile",
      }),
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      environment: {
        DATABASE_URL: env.DATABASE_URL,
      },
    });

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
