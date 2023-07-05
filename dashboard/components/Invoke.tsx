"use client";

import { invokeSolver } from "@/lib/actions";
import { Card, Title, Button } from "@tremor/react";
import { startTransition, useCallback } from "react";

export default function Invoke() {
  const handleInvoke = useCallback(() => {
    startTransition(() => {
      invokeSolver();
    });
  }, []);

  return (
    <Card className="mt-8">
      <Title>Invoke Solver</Title>

      <Button size="xs" onClick={handleInvoke}>
        Invoke
      </Button>
    </Card>
  );
}
