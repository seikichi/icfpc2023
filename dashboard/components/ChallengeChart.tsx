"use client";

import { Challenge } from "@prisma/client";
import { Card, Text, Title, LineChart } from "@tremor/react";

export default function ChallengeChart(params: {
  challenges: readonly Challenge[];
}) {
  const challenges = params.challenges
    .slice()
    .sort((lhs, rhs) => lhs.createdAt.getTime() - rhs.createdAt.getTime());

  let max = 0;
  const data: { createdAt: string; score: number }[] = [];
  for (const s of challenges) {
    max = Math.max(max, Number(s.score));
    data.push({ score: max, createdAt: s.createdAt.toISOString() });
  }

  return (
    <Card className="mt-8">
      <Title>Max Score History</Title>
      <Text>
        X 軸の間隔は適当 / Challenge のスコア遷移 (対象を絞った場合影響無し)
      </Text>
      <LineChart
        className="mt-6 h-80"
        data={data}
        index="createdAt"
        colors={["indigo"]}
        categories={["score"]}
      />
    </Card>
  );
}
