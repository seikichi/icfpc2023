import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { z } from "zod";

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

// 1. 対象を取ってくる
// 2. submit 結果を見る
// 3. wasm で score 計算
// 4. volume 指定
// 5. POST

const NUM_PROBLEMS = 90;
const MAX_RECORD_PER_SOLUTION = 5;

(async () => {
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

      console.log(result.Success.submission.score.Success);
      break;
    }
  }
})();
