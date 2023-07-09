"use client";

import { invokeChallenge } from "@/lib/actions";
import { SubmitParams } from "@/lib/schema";
import { Card, Title, Button, Flex, TextInput, Text } from "@tremor/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Invoke() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SubmitParams>({
    resolver: zodResolver(SubmitParams),
  });

  const onSubmit = async (params: SubmitParams) => {
    reset();
    console.log(params);
    await invokeChallenge(params);
    alert("💸💸💸💸💸");
  };

  return (
    <Card className="mt-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Title>Submit</Title>

        <div className="space-y-4 mt-8">
          <div>
            <Text>TAG (alphabet, number, hyphen)</Text>
            <TextInput
              placeholder="seikichi-test"
              error={!!errors.tag}
              errorMessage={errors.tag?.message}
              {...register("tag")}
            />
          </div>
          <div>
            <Text>
              Args (e.g.,{" "}
              <code>-a GridGreed,Annealing --annealing-seconds 300</code>)
            </Text>
            <TextInput
              placeholder="-a GridGreed,Annealing --annealing-seconds 300"
              error={!!errors.args}
              errorMessage={errors.args?.message}
              {...register("args")}
            />
          </div>
          <div>
            <Text>
              Target (e.g., <code>1-90</code> or <code>1-5,10-20</code>)
            </Text>
            <TextInput
              placeholder="1-90"
              error={!!errors.target}
              errorMessage={errors.target?.message}
              {...register("target")}
            />
          </div>
        </div>

        <Flex justifyContent="end" className="space-x-2 border-t pt-4 mt-8">
          <Button size="xs" disabled={isSubmitting}>
            Submit
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
