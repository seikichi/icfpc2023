"use client";

import { invokeSolver } from "@/lib/actions";
import { Card, Title, Button, Flex } from "@tremor/react";
import { startTransition, useCallback } from "react";

import wasm from "wasm";

export default function Invoke() {
  const handleInvokeLambda = useCallback(() => {
    startTransition(() => {
      invokeSolver();
    });
  }, []);

  const handleInvokeWASM = useCallback(async () => {
    // const wasm = await import("wasm");
    const lib = await wasm();
    console.log(`wasm.add(21, 21) = ${lib.add(21, 21)}`);
  }, []);

  return (
    <Card className="mt-8">
      <Title>Invoke</Title>

      <Flex justifyContent="end" className="space-x-2 border-t pt-4 mt-8">
        <Button size="xs" onClick={handleInvokeLambda}>
          Invoke Lambda
        </Button>
        <Button size="xs" onClick={handleInvokeWASM}>
          Invoke WASM
        </Button>
      </Flex>
    </Card>
  );
}
