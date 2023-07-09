// NOTE: this file is executed by ts-node
// do not use import alias like `import ... from "@/lib/foo"`

import logger from "../lib/logger";
import { prisma } from "../lib/db";

(async () => {
  logger.info({ message: "check records" });
  const challenges = await prisma.challenge.findMany({ take: 5 });
  for (const challenge of challenges) {
    logger.info({ challenge });

    const solutions = await prisma.solution.findMany({
      where: { challenge },
    });
    for (const solution of solutions) {
      logger.info({ solution });
    }

    const failures = await prisma.failure.findMany({
      where: { challenge },
    });
    for (const failure of failures) {
      logger.info({ failure });
    }
  }
})();
