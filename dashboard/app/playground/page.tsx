import { Title } from "@tremor/react";
import Invoke from "@/components/Invoke";
import ProblemVisualizer from "@/components/ProblemVisualizer";

// export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>実験場</Title>

      <Invoke />
      <ProblemVisualizer problemId={42} solutions={[]} />
    </main>
  );
}
