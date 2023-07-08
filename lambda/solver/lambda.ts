// Lambda 実行用

import { promisify } from "util";
import * as path from "path";
import * as child_process from "child_process";
import { Handler } from "aws-lambda";
import * as fs from "fs/promises";

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

export const handler: Handler = async (event, _context) => {
  main({
    problemId: event.problemId,
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

    const command = `${solverPath} -a GridGreed -i ${problemPath} -o ${outDir}`;
    const { stdout, stderr } = await exec(command);

    console.log("stdout:");
    console.log(stdout);
    console.log("stderr:");
    console.log(stderr);
  } catch (e) {
    console.error(e);
  }
}
