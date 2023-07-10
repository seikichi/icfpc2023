"use client";

import { generateSolutionUrl } from "@/lib/actions";
import { Solution } from "@/lib/schema";
import { Solution as SolutionRecord } from "@prisma/client";
import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  Button,
} from "@tremor/react";
import Link from "next/link";
import { useCallback } from "react";

type Props = {
  solutions: readonly SolutionRecord[];
  setSolution: (solution: Solution) => void;
};

export default function ProblemSolutionList(props: Props) {
  const { setSolution } = props;
  const handleSelectSolutionClick = useCallback(
    (key: string) => {
      (async () => {
        try {
          const { url } = await generateSolutionUrl(key);
          const response = await fetch(url, { mode: "cors" });
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          setSolution(Solution.parse(await response.json()));
        } catch (e) {
          alert(JSON.stringify(e));
        }
      })();
    },
    [setSolution]
  );

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="text-right">
              Challenge ID
            </TableHeaderCell>
            <TableHeaderCell className="text-right">Score</TableHeaderCell>
            <TableHeaderCell className="text-right">Args</TableHeaderCell>
            <TableHeaderCell className="text-right">
              Elapsed (sec)
            </TableHeaderCell>
            <TableHeaderCell className="text-right">Commit ID</TableHeaderCell>
            <TableHeaderCell className="text-right">Solution</TableHeaderCell>
            <TableHeaderCell className="text-right">Created At</TableHeaderCell>
            <TableHeaderCell className="text-right">
              Submission ID
            </TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {props.solutions.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Link href={`/challenges/${s.challengeId}`}>
                  {s.challengeId}
                </Link>
              </TableCell>
              <TableCell className="text-right">{Number(s.score)}</TableCell>
              <TableCell className="text-left">{s.args}</TableCell>
              <TableCell className="text-right">{s.elapsedSec}</TableCell>
              <TableCell className="text-right">{s.commitId}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => handleSelectSolutionClick(s.bucketKey)}
                >
                  Select Solution
                </Button>
              </TableCell>

              <TableCell className="text-left">
                {s.createdAt.toISOString()}
              </TableCell>
              <TableCell className="text-right">
                {JSON.parse(s.submissionId || "null")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
