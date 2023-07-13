"use client";

import { Challenge, Failure, Solution } from "@prisma/client";
import {
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
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
  challenge: Challenge | null;
  solutions: readonly Solution[];
  failures: readonly Failure[];
};

function parseProblemIds(e: { target: string }): Set<number> {
  // 問題IDパース
  const ids: Set<number> = new Set([]);
  for (const ps of e.target.split(",")) {
    if (ps.includes("-")) {
      const [fromS, toS] = ps.split("-");
      const [from, to] = [parseInt(fromS, 10), parseInt(toS, 10)];
      for (let i = from; i <= to; i++) {
        ids.add(i);
      }
    } else {
      ids.add(parseInt(ps, 10));
    }
  }
  return ids;
}

export default function ChallengeDashboard(props: Props) {
  const handleDownloadClick = useCallback((key: string) => {
    (async () => {
      try {
        const url = `/solutions/${key}`;

        const link = document.createElement("a");
        try {
          link.href = url;
          link.setAttribute("target", "_blank");
          document.body.appendChild(link);
          link.click();
        } finally {
          link.parentNode?.removeChild(link);
        }
      } catch (e) {
        alert(JSON.stringify(e));
      }
    })();
  }, []);

  const problemIds = parseProblemIds(props.challenge || { target: "" });
  const successIds = props.solutions.map((s) => s.problemId);
  const failureIds = props.failures.map((f) => f.problemId);
  const noDataIds = Array.from(problemIds).filter(
    (p) => !successIds.includes(p) && !failureIds.includes(p)
  );

  return (
    <TabGroup className="mt-6">
      <TabList>
        <Tab>Success</Tab>
        <Tab>Failure</Tab>
        <Tab>No data</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="mt-6">
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-right">
                      Problem ID
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Score
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Args
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Elapsed (sec)
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Commit ID
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Solution
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Created At
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Submission ID
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {props.solutions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Link href={`/problems/${s.problemId}`}>
                          {s.problemId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(s.score)}
                      </TableCell>
                      <TableCell className="text-left">{s.args}</TableCell>
                      <TableCell className="text-right">
                        {s.elapsedSec}
                      </TableCell>
                      <TableCell className="text-right">{s.commitId}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => handleDownloadClick(s.bucketKey)}
                        >
                          Download
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
          </div>
        </TabPanel>
        <TabPanel>
          <div className="mt-6">
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-right">
                      Problem ID
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Error
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Args
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Elapsed (sec)
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Commit ID
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Created At
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {props.failures.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Link href={`/problems/${f.problemId}`}>
                          {f.problemId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{f.error}</TableCell>
                      <TableCell className="text-left">{f.args}</TableCell>
                      <TableCell className="text-right">
                        {f.elapsedSec}
                      </TableCell>
                      <TableCell className="text-right">{f.commitId}</TableCell>
                      <TableCell className="text-left">
                        {f.createdAt.toISOString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="mt-6">
            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-left">
                      Problem ID
                    </TableHeaderCell>
                    {/* <TableHeaderCell className="text-right">
                      Tag
                    </TableHeaderCell> */}
                    <TableHeaderCell className="text-left">
                      Args
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Commit ID
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {noDataIds.map((p) => (
                    <TableRow key={p}>
                      <TableCell className="text-left">
                        <Link href={`/problems/${p}`}>{p}</Link>
                      </TableCell>
                      {/* <TableCell className="text-right">
                        {props.challenge?.tag || ""}
                      </TableCell> */}
                      <TableCell className="text-left">
                        {props.challenge?.args || ""}
                      </TableCell>
                      <TableCell className="text-right">
                        {props.challenge?.commitId || ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
