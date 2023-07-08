// Lambda 実行用

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

// 単独実行可能にする
// パラメーターで problemId を取る
// fetch で problem 取得
// env で色々渡す (パス)
// solver 実行

// S3 用意
// DB 保存

const SolverEvent = z.object({
  problemId: z.number().min(1),
  args: z.string(),
});

type SolverEvent = z.infer<typeof SolverEvent>;

const SolverOutput = z.object({
  score: z.number().int(),
});

type SolverOutput = z.infer<typeof SolverOutput>;

const Env = z.object({
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
  });
};

type Params = {
  problemId: number;
  tmpDir: string;
  solverPath: string;
  args: string;
};

export async function main(params: Params) {
  const start = performance.now();
  const env = Env.parse(process.env);
  console.log({ commitId: env.COMMIT_ID });
  const { problemId, tmpDir, solverPath, args } = params;

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

    const result = await fetch("https://api.icfpcontest.com/submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.API_TOKEN}`,
      },
      body: JSON.stringify(submission),
    });
    if (!result.ok) {
      throw await result.text();
    }

    console.log("stdout:");
    console.log(stdout);
    console.log("stderr:");
    console.log(stderr);

    const output = SolverOutput.parse(JSON.parse(stdout));

    const elapsedSec = Math.ceil((performance.now() - start) / 1000);
    const bucketKey = uuidv4();
    const record = {
      problemId,
      score: output.score,
      commitId: env.COMMIT_ID,
      args,
      bucketKey,
      elapsedSec,
    };
    console.log(record);

    // TODO: update file to s3
    // TODO: try to download the file

    // await prisma.solution.create({
    //   data: record,
    // });
    // https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html
  } catch (e) {
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
    console.error(e);
  }
}
