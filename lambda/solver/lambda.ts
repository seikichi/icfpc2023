// Lambda 実行用

import { promisify } from "util";
import * as path from "path";
import * as child_process from "child_process";
import { Handler } from "aws-lambda";
import * as fs from "fs/promises";
import { z } from "zod";

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
});

type SolverEvent = z.infer<typeof SolverEvent>;

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
  });
};

type Params = {
  problemId: number;
  tmpDir: string;
  solverPath: string;
  // args: string[];
};

export async function main(params: Params) {
  const env = Env.parse(process.env);
  console.log({ commitId: env.COMMIT_ID });
  const { problemId, tmpDir, solverPath } = params;

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

    const command = `${solverPath} -a GridGreed,Annealing -i ${problemPath} -o ${outDir} --annealing-seconds 60`;
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

    console.log("stdout:");
    console.log(stdout);
    console.log("stderr:");
    console.log(stderr);

    console.log("result");
    console.log(await result.text());
  } catch (e) {
    console.error(e);
  }
}
