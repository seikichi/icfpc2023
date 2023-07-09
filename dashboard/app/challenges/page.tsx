import ChallengeListDashboard from "@/components/ChallengeListDashboard";
import ChallengeSubmit from "@/components/ChallengeSubmit";
import { prisma } from "@/lib/db";
import { Title } from "@tremor/react";

export const revalidate = 60;

const MAX_CHALLENGE = 50;

export default async function Page() {
  const bestChallenges = await prisma.challenge.findMany({
    take: MAX_CHALLENGE,
    orderBy: { score: "desc" },
  });
  const recentChallenges = await prisma.challenge.findMany({
    take: MAX_CHALLENGE,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Challenges</Title>
      <ChallengeSubmit />
      <ChallengeListDashboard
        bestChallenges={bestChallenges}
        recentChallenges={recentChallenges}
      />
    </main>
  );
}
