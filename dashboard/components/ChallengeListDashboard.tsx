"use client";

import { Challenge } from "@prisma/client";
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

type Props = {
  bestChallenges: readonly Challenge[];
  recentChallenges: readonly Challenge[];
};

function ChallengeTable({ challenges }: { challenges: readonly Challenge[] }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>ID</TableHeaderCell>
          <TableHeaderCell className="text-right">Tag</TableHeaderCell>
          <TableHeaderCell className="text-right">Args</TableHeaderCell>
          <TableHeaderCell className="text-right">CreatedAt</TableHeaderCell>
          <TableHeaderCell className="text-right">Commit ID</TableHeaderCell>
          <TableHeaderCell className="text-right">Target</TableHeaderCell>
          <TableHeaderCell className="text-right">Solved</TableHeaderCell>
          <TableHeaderCell className="text-right">Failed</TableHeaderCell>
          <TableHeaderCell className="text-right">Score</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {challenges.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <a href={`/challenges/${c.id}.html`}>{c.id}</a>
            </TableCell>
            <TableCell className="text-right">{c.tag}</TableCell>
            <TableCell className="text-left">{c.args}</TableCell>
            <TableCell className="text-right">
              {c.createdAt.toISOString()}
            </TableCell>
            <TableCell className="text-right">
              <a
                href={`https://github.com/seikichi/icfpc2023/commit/${c.commitId}`}
              >
                {c.commitId}
              </a>
            </TableCell>
            <TableCell className="text-right">{c.target}</TableCell>
            <TableCell className="text-right">{c.solved}</TableCell>
            <TableCell className="text-right">{c.failed}</TableCell>

            <TableCell className="text-right">{Number(c.score)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ChallengeListDashboard(props: Props) {
  return (
    <TabGroup className="mt-6">
      <TabList>
        <Tab>Best</Tab>
        <Tab>Recent</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="mt-6">
            <Card>
              <ChallengeTable challenges={props.bestChallenges} />
            </Card>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="mt-6">
            <Card>
              <ChallengeTable challenges={props.recentChallenges} />
            </Card>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
