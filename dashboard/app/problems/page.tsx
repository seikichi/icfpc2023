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
} from "@tremor/react";
import Image from "next/image";
import { env } from "@/lib/env";

export default async function Page() {
  const problems = await prisma.problem.findMany();
  const bestSolutionsLocal: { [problemId: number]: bigint } = {};
  await prisma.solution
    .groupBy({
      by: ["problemId"],
      _max: {
        score: true,
      },
      orderBy: { problemId: "asc" },
    })
    .then((r) =>
      r.forEach(
        (s) => (bestSolutionsLocal[s.problemId] = s._max.score || BigInt(0))
      )
    );
  // const res = await fetch("https://api.icfpcontest.com/userboard", {
  //   headers: {
  //     Authorization: `Bearer ${env.API_TOKEN}`,
  //   },
  // });
  // const text = await res.text();
  // const problemScores = JSON.parse(text).Success.problems;

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
              {/* <TableHeaderCell className="text-right">
                Score (Official)
              </TableHeaderCell>
              <TableHeaderCell className="text-right">Diff (%)</TableHeaderCell> */}
            </TableRow>
          </TableHead>

          <TableBody>
            {problems.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <a href={`/problems/${p.id}.html`}>{p.id}</a>
                </TableCell>
                <TableCell>
                  <a href={`/problems/${p.id}.html`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
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
                  {Number(bestSolutionsLocal[p.id])}
                </TableCell>
                {/* <TableCell className="text-right">
                  {problemScores[p.id - 1]}
                </TableCell>
                <TableCell className="text-right">
                  {Math.abs(
                    Number(bestSolutionsLocal[p.id]) - problemScores[p.id - 1]
                  )}{" "}
                  (
                  {(
                    Math.abs(
                      100.0 *
                        (Number(bestSolutionsLocal[p.id]) -
                          problemScores[p.id - 1])
                    ) /
                    Math.min(
                      problemScores[p.id - 1],
                      Number(bestSolutionsLocal[p.id])
                    )
                  ).toPrecision(2)}
                  % )
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
