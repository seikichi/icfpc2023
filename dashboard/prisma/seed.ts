// NOTE: this file is executed by ts-node
// do not use import alias like `import ... from "@/lib/foo"`

import logger from "../lib/logger";
import { prisma } from "../lib/db";
import * as fs from "fs/promises";
import * as path from "path";

(async () => {
  logger.info({ message: "seed problems" });
  for (let id = 1; id <= 90; id++) {
    const problemText = await fs.readFile(
      path.join("..", "solver", "problems", `${id}.json`),
      { encoding: "utf-8" }
    );
    const problem = JSON.parse(problemText);
    const musicians = problem.musicians.length;
    const pillars = problem.pillars?.length;
    const attendees = problem.attendees.length;
    await prisma.problem.upsert({
      where: { id },
      create: { id, musicians, pillars, attendees },
      update: { id, musicians, pillars, attendees },
    });
  }
  // await prisma.challenge.create({
  //   data: {
  //     args: "Hand",
  //     commitId: "dc9ba38",
  //     target: "12",
  //     score: 9809651950,
  //     solved: 1,
  //     failed: 0,
  //     tag: "seikichi-hand",
  //     solutions: {
  //       create: {
  //         args: "Hand",
  //         bucketKey: "ea2a9612-2caa-48fd-8e0e-cf4dd8e5a5c5",
  //         commitId: "dc9ba38",
  //         elapsedSec: 60,
  //         score: 9809651950,
  //         problemId: 12,
  //       },
  //     },
  //   },
  // });
})();
