import ChallengeDashboard from "@/components/ChallengeDashboard";
import { prisma } from "@/lib/db";
import { Card, Title } from "@tremor/react";

export const revalidate = 60;

export default async function Page({ params }: { params: { id: string } }) {
  const challengeId = parseInt(params.id, 10);
  const solutions = await prisma.solution.findMany({
    where: { challengeId },
    orderBy: { problemId: "asc" },
  });
  const failures = await prisma.failure.findMany({
    where: { challengeId },
    orderBy: { problemId: "asc" },
  });
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Challenge: {params.id}</Title>
      <ChallengeDashboard challenge={challenge} solutions={solutions} failures={failures} />
    </main>
  );
}
