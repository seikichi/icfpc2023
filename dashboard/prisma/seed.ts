// NOTE: this file is executed by ts-node
// do not use import alias like `import ... from "@/lib/foo"`

import logger from "../lib/logger";
import { prisma } from "../lib/db";

(async () => {
  logger.info({ message: "seed problems" });
  for (let id = 1; id <= 55; id++) {
    await prisma.problem.upsert({
      where: { id },
      create: { id },
      update: { id },
    });
  }
})();
