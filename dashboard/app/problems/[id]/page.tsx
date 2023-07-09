import ProblemVisualizer from "@/components/ProblemVisualizer";
import { prisma } from "@/lib/db";
import { Title } from "@tremor/react";

export const revalidate = 60;

export default async function Page({ params }: { params: { id: string } }) {
  const solutions = await prisma.solution.findMany({
    take: 50,
    where: {
      problemId: parseInt(params.id, 10),
    },
    orderBy: {
      score: "desc",
    },
  });

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Problem: {params.id}</Title>
      <ProblemVisualizer
        problemId={parseInt(params.id, 10)}
        solutions={solutions}
      />
    </main>
  );
}
