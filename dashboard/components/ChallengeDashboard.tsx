"use client";

import { Failure, Solution } from "@prisma/client";
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
} from "@tremor/react";
import Link from "next/link";

type Props = {
  solutions: readonly Solution[];
  failures: readonly Failure[];
};

export default function ChallengeDashboard(props: Props) {
  return (
    <TabGroup className="mt-6">
      <TabList>
        <Tab>Success</Tab>
        <Tab>Failure</Tab>
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
                      Key
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
                        <Link href={`/problem/${s.problemId}`}>
                          {s.problemId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{s.score}</TableCell>
                      <TableCell className="text-left">{s.args}</TableCell>
                      <TableCell className="text-right">
                        {s.elapsedSec}
                      </TableCell>
                      <TableCell className="text-right">{s.commitId}</TableCell>
                      <TableCell className="text-right">
                        {s.bucketKey}
                      </TableCell>

                      <TableCell className="text-left">
                        {s.createdAt.toISOString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {JSON.parse(s.submissionId || "")}
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
                        <Link href={`/problem/${f.problemId}`}>
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
      </TabPanels>
    </TabGroup>
  );
}
