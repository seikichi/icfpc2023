import Room from "@/components/Room";
import { Title } from "@tremor/react";

// export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Problem: {params.id}</Title>

      <Room problemId={parseInt(params.id, 10)} />
    </main>
  );
}