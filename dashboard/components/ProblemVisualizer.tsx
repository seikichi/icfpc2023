"use client";

import { generateSolutionUrl } from "@/lib/actions";
import { Solution } from "@/lib/schema";
import { Solution as SolutionRecord } from "@prisma/client";
import { Card, LineChart, Title, Text } from "@tremor/react";
import { useCallback, useState } from "react";
import Room from "./Room";
import ProblemSolutionList from "./ProblemSolutionList";

type Props = {
  problemId: number;
  solutions: readonly SolutionRecord[];
};

function ScoreChart(params: { solutions: readonly SolutionRecord[] }) {
  const solutions = params.solutions
    .slice()
    .sort((lhs, rhs) => lhs.createdAt.getTime() - rhs.createdAt.getTime());

  let max = 0;
  const data: { createdAt: string; score: number }[] = [];
  for (const s of solutions) {
    max = Math.max(max, Number(s.score));
    data.push({ score: max, createdAt: s.createdAt.toISOString() });
  }

  return (
    <Card className="mt-8">
      <Title>Max Score History</Title>
      <Text>X 軸の間隔は適当</Text>
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

export default function ProblemVisualizer(props: Props) {
  const { solutions } = props;
  const [solution, setSolution] = useState<Solution | null>(null);

  return (
    <div className="space-y-4 mt-8">
      <ScoreChart solutions={solutions} />

      <Room
        problemId={props.problemId}
        solution={solution}
        setSolution={setSolution}
      />

      <ProblemSolutionList solutions={solutions} setSolution={setSolution} />
    </div>
  );
}
