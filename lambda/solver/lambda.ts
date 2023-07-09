// Lambda 実行用

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { promisify } from "util";
import * as path from "path";
import * as child_process from "child_process";
import { Handler } from "aws-lambda";
import * as fs from "fs/promises";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// https://stackoverflow.com/questions/30763496
const exec = promisify(child_process.exec);

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const s3 = new S3Client({ region: "ap-northeast-1" });

// S3 用意
// DB 保存

const SolverEvent = z.object({
  problemId: z.number().min(1),
  args: z.string().max(256),
  challengeId: z.number().nullable(),
});

type SolverEvent = z.infer<typeof SolverEvent>;

const SolverOutput = z.object({
  score: z.number().int(),
});

type SolverOutput = z.infer<typeof SolverOutput>;

const Env = z.object({
  BUCKET: z.string().min(1),
  DATABASE_URL: z.string().startsWith("mysql://"),
  COMMIT_ID: z.string().min(1),
  API_TOKEN: z.string().startsWith("eyJ"),
});

export const handler: Handler = async (event, _context) => {
  const e = SolverEvent.parse(event);

  return main({
    problemId: e.problemId,
    tmpDir: "/tmp",
    solverPath: path.join("target", "release", "cli"),
    args: e.args,
    challengeId: e.challengeId,
  });
};

type Params = {
  problemId: number;
  tmpDir: string;
  solverPath: string;
  args: string;
  challengeId: number | null;
};

export async function main(params: Params) {
  const start = performance.now();
  const env = Env.parse(process.env);
  console.log({ commitId: env.COMMIT_ID });
  const { problemId, tmpDir, solverPath, args, challengeId } = params;

  // NOTE: need to save /tmp (Lambda)
  try {
    const res = await fetch(
      `https://cdn.icfpcontest.com/problems/${problemId}.json`
    );
    if (!res.ok) {
      throw await res.text();
    }
    const problemPath = path.join(tmpDir, `${problemId}.json`);
    const outDir = path.join(tmpDir, "output");

    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(problemPath, await res.text(), { encoding: "utf-8" });

    const command = `${solverPath} -i ${problemPath} -o ${outDir} -Q ${args}`;
    console.log(`run: ${command}`);

    const { stdout, stderr } = await exec(command);

    const contents = await fs.readFile(path.join(outDir, `${problemId}.json`), {
      encoding: "utf-8",
    });
    const submission = { problem_id: problemId, contents };

    // POST 失敗するかもしれないので...
    let submissionId: string | null = null;
    try {
      const result = await fetch("https://api.icfpcontest.com/submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.API_TOKEN}`,
        },
        body: JSON.stringify(submission),
      });
      if (result.ok) {
        submissionId = await result.text();
      }
      if (!result.ok) {
        // TODO: FIXME
        const text = await result.text();
        console.log(text.slice(0, 256));
      }
    } catch (e) {
      console.error(e);
    }

    console.log("stdout:");
    console.log(stdout);
    console.log("stderr:");
    console.log(stderr);

    const output = SolverOutput.parse(JSON.parse(stdout));

    const elapsedSec = Math.ceil((performance.now() - start) / 1000);
    const bucketKey = uuidv4();
    const record = {
      challengeId,
      submissionId,
      problemId,
      score: output.score,
      commitId: env.COMMIT_ID,
      args,
      bucketKey,
      elapsedSec,
    };
    console.log(record);

    await s3.send(
      new PutObjectCommand({
        Bucket: env.BUCKET,
        Key: bucketKey,
        Body: contents,
      })
    );

    await prisma.solution.create({ data: record });
    if (challengeId) {
      await prisma.challenge.update({
        where: {
          id: challengeId,
        },
        data: {
          solved: {
            increment: 1,
          },
          score: {
            increment: output.score,
          },
        },
      });
    }
  } catch (e) {
    console.error(e);

    // MEMO: Is this correct?
    const elapsedSec = Math.ceil((performance.now() - start) / 1000);
    const error = JSON.stringify(e).slice(512);
    const record = {
      error,
      problemId,
      commitId: env.COMMIT_ID,
      args,
      elapsedSec,
    };
    console.error(record);
    await prisma.failure.create({ data: record });

    if (challengeId) {
      await prisma.challenge.update({
        where: {
          id: challengeId,
        },
        data: {
          failed: {
            increment: 1,
          },
        },
      });
    }
  }
}
