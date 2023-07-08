import { prisma } from "@/lib/db";
import {
  Title,
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  BadgeDelta,
  DeltaType,
} from "@tremor/react";
import Link from "next/link";

// export const dynamic = "force-dynamic";

// const NUM_PROBLEMS = 55;

export default async function Page() {
  const problems = await prisma.problem.findMany();

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Problems</Title>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Problem ID</TableHeaderCell>
              <TableHeaderCell className="text-right">Score</TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {problems.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/problems/${p.id}`}>{p.id}</Link>
                </TableCell>
                <TableCell className="text-right">T.B.D.</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
