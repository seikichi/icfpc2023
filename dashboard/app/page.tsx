import { Card, Title, Text } from "@tremor/react";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import UsersTable from "@/components/UserTable";
import Invoke from "@/components/Invoke";
import Room from "@/components/Room";

export const dynamic = "force-dynamic";

export default async function Home() {
  // NOTE: just for debugging prisma and logger...
  const count = await prisma.problem.count();
  logger.info({ message: `# of problems: ${count}` });

  const users = [
    {
      id: 1,
      name: "Seiichi KONDO",
      username: "seikichi",
      email: "seikichi@kmc.gr.jp",
    },
  ];

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Users</Title>
      <Text>
        A list of users retrieved from a MySQL database (PlanetScale).
      </Text>

      <Room />

      <Card className="mt-6">
        <UsersTable users={users} />
      </Card>

      <Invoke />
    </main>
  );
}
