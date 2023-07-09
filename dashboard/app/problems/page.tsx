import { prisma } from "@/lib/db";
import {
  Title,
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  BadgeDelta,
  DeltaType,
} from "@tremor/react";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";

export const revalidate = 600;

export default async function Page() {
  const problems = await prisma.problem.findMany();
  const bestSolutionsLocal: { [problemId: number]: number } = {};
  await prisma.solution
    .groupBy({
      by: ["problemId"],
      _max: {
        score: true,
      },
      orderBy: { problemId: "asc" },
    })
    .then((r) =>
      r.forEach((s) => (bestSolutionsLocal[s.problemId] = s._max.score || 0))
    );
  const res = await fetch("https://api.icfpcontest.com/userboard", {
    headers: {
      Authorization: `Bearer ${env.API_TOKEN}`,
    },
  });
  const text = await res.text();
  const problemScores = JSON.parse(text).Success.problems;

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Problems</Title>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Problem ID</TableHeaderCell>
              <TableHeaderCell>Thumbnail</TableHeaderCell>
              <TableHeaderCell># of Musicians</TableHeaderCell>
              <TableHeaderCell># of Attendees</TableHeaderCell>
              <TableHeaderCell># of Pillars</TableHeaderCell>
              <TableHeaderCell className="text-right">
                Score (Local)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Score (Official)
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {problems.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/problems/${p.id}`}>{p.id}</Link>
                </TableCell>
                <TableCell>
                  <a href={`/problems/${p.id}`}>
                    <Image
                      alt={`${p.id}`}
                      src={`/problems/${p.id}.png`}
                      width={0}
                      height={0}
                      sizes="100vmax"
                      style={{ height: "100px", width: "auto" }}
                    />
                  </a>
                </TableCell>
                <TableCell className="text-right">{p.musicians}</TableCell>
                <TableCell className="text-right">{p.attendees}</TableCell>
                <TableCell className="text-right">{p.pillars}</TableCell>
                <TableCell className="text-right">
                  {bestSolutionsLocal[p.id]}
                </TableCell>
                <TableCell className="text-right">
                  {problemScores[p.id - 1]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
