// Lambda 実行用

import { promisify } from "util";
import * as path from "path";
import * as child_process from "child_process";
import { Handler } from "aws-lambda";

// https://stackoverflow.com/questions/30763496
const exec = promisify(child_process.exec);

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handler: Handler = async (_event, _context) => {
  console.log("# records in PlanetScale:", await prisma.problem.count());

  try {
    const { stdout } = await exec(path.join("target", "release", "cli"));
    console.log(`stdout: ${stdout}`);
    return { stdout };
  } catch (e) {
    console.error(e);
  }
};
