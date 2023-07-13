import ProblemVisualizer from "@/components/ProblemVisualizer";
import { prisma } from "@/lib/db";
import { Room } from "@/lib/schema";
import { Title } from "@tremor/react";
import * as fs from "fs/promises";

export async function generateStaticParams() {
  const problems = await prisma.problem.findMany({ take: 100000 });
  return problems.map((p) => ({ id: `${p.id}` }));
}

export default async function Page({ params }: { params: { id: string } }) {
  const solutions = await prisma.solution.findMany({
    take: 1000,
    where: {
      problemId: parseInt(params.id, 10),
    },
    orderBy: {
      score: "desc",
    },
  });

  const room = Room.parse(
    JSON.parse(
      await fs.readFile(`../solver/problems/${params.id}.json`, {
        encoding: "utf-8",
      })
    )
  );

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Problem: {params.id}</Title>
      <ProblemVisualizer
        problemId={parseInt(params.id, 10)}
        solutions={solutions}
        room={room}
      />
    </main>
  );
}
