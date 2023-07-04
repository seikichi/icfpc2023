import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

export const revalidate = 0;

export default async function Home() {
  // NOTE: just for debugging prisma and logger...
  const count = await prisma.problem.count();
  logger.info({ message: `# of problems: ${count}` });

  return <>Hello, world! (# of problems: {count})</>;
}
