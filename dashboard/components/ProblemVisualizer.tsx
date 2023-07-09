"use client";

import { generateSolutionUrl } from "@/lib/actions";
import { Solution } from "@/lib/schema";
import { Solution as SolutionRecord } from "@prisma/client";
import { Card } from "@tremor/react";
import { useCallback, useState } from "react";
import Room from "./Room";
import ProblemSolutionList from "./ProblemSolutionList";

type Props = {
  problemId: number;
  solutions: readonly SolutionRecord[];
};

export default function ProblemVisualizer(props: Props) {
  const { solutions } = props;
  const [solution, setSolution] = useState<Solution | null>(null);

  return (
    <Card>
      <Room
        problemId={props.problemId}
        solution={solution}
        setSolution={setSolution}
      />

      <ProblemSolutionList solutions={solutions} setSolution={setSolution} />
    </Card>
  );
}
