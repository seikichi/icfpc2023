// NOTE: this file is executed by ts-node
// do not use import alias like `import ... from "@/lib/foo"`

import logger from "../lib/logger";
import { prisma } from "../lib/db";

(async () => {
  const count = await prisma.problem.count();
  logger.info({ message: `# of problems: ${count}` });

  // T.B.D.
  // await prisma.problem.createMany({})
})();
