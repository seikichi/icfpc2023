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
})();
