import { main } from "./lambda";
import * as path from "path";

const problemId = parseInt(process.argv[process.argv.length - 1], 10);

main({
  problemId,
  tmpDir: "tmp",
  solverPath: path.join("..", "..", "solver", "target", "release", "cli"),
  args: "-a GridGreed",
  challengeId: null,
});
