import ChallengeDashboard from "@/components/ChallengeDashboard";
import { prisma } from "@/lib/db";
import { Title } from "@tremor/react";

export async function generateStaticParams() {
  const challenges = await prisma.challenge.findMany({ take: 100000 });
  return challenges.map((c) => ({ id: `${c.id}` }));
}

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
      <ChallengeDashboard
        challenge={challenge}
        solutions={solutions}
        failures={failures}
      />
    </main>
  );
}
