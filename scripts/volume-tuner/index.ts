import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { z } from "zod";
import * as wasm from "wasm";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

const Env = z.object({
  API_TOKEN: z.string().min(1),
  DATABASE_URL: z.string().min(1),
});

type Env = z.infer<typeof Env>;

const env = Env.parse(process.env);

const SubmissionResponse = z.union([
  z.object({ Failure: z.string() }),
  z.object({
    Success: z.object({
      submission: z.object({
        score: z.union([
          z.object({ Failure: z.string() }),
          z.object({ Success: z.number() }),
        ]),
      }),
      contents: z.string(),
    }),
  }),
]);

const SubmissionContents = z.object({
  placements: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .array(),
});

// 1. 対象を取ってくる
// 2. submit 結果を見る
// 3. wasm で score 計算
// 4. volume 指定
// 5. POST

const NUM_PROBLEMS = 90;
const MAX_RECORD_PER_SOLUTION = 5;

(async () => {
  let warned: number[] = [];

  for (let problemId = 1; problemId <= NUM_PROBLEMS; problemId++) {
    console.log(`re-submit: problem_id = ${problemId}`);

    const solutions = await prisma.solution.findMany({
      where: {
        problemId,
        createdAt: {
          lte: "2023-07-09T12:00:00.000Z",
        },
      },
      take: MAX_RECORD_PER_SOLUTION,
      orderBy: {
        score: "desc",
      },
    });

    for (const s of solutions) {
      if (s.submissionId === null) {
        console.log(
          `submission ID is NULL ... (may be need to re-submit): ${s.challengeId}`
        );
        continue;
      }

      // convert "xxx" to xxx
      const submissionId = JSON.parse(s.submissionId);
      const url = `https://api.icfpcontest.com/submission?submission_id=${submissionId}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
        },
      });
      const result = SubmissionResponse.parse(await res.json());

      if ("Failure" in result) {
        console.log(`failed submission: ${s.challengeId}`);
        continue;
      }

      if ("Failure" in result.Success.submission.score) {
        console.log(`invalid submission: ${s.challengeId}`);
        continue;
      }

      const contents = SubmissionContents.parse(
        JSON.parse(result.Success.contents)
      );

      let total = 0;
      let volumes: number[] = [];
      for (let i = 0; i < contents.placements.length; i++) {
        const input = await fs.readFile(
          path.join("..", "..", "solver", "problems", `${problemId}.json`),
          { encoding: "utf-8" }
        );
        const scores = wasm.calculate_score_of_a_musician(
          input,
          result.Success.contents,
          problemId,
          i
        );

        let score = 0;
        for (const s of scores) {
          score += Number(s);
        }
        if (i % 200 === 0) {
          console.log(`  ${i} / ${contents.placements.length} musicians`);
        }

        total += score;
        volumes.push(score > 0 ? 10.0 : 0.0);
      }

      console.log("calc by wasm", total);
      console.log(`official`, result.Success.submission.score.Success);

      const diff = Math.abs(total - result.Success.submission.score.Success);
      if (
        diff >= 0.01 * total ||
        diff >= 0.01 * result.Success.submission.score.Success
      ) {
        console.log(`warning: big diff!!!!!!!!`);
        warned.push(problemId);
      }

      const r = await fetch(`https://api.icfpcontest.com/submission`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem_id: problemId,
          contents: JSON.stringify({
            ...contents,
            volumes,
          }),
        }),
      });

      if (!r.ok) {
        throw await r.text();
      }

      console.log(await r.text());
      break;
    }
  }
})();
