import { Title, Text } from "@tremor/react";

// export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>カフェテリアルネ</Title>
      <Text>
        そのうちここに何か表示する (コンテスト後追記:
        表示されることはありませんでした)
      </Text>
    </main>
  );
}
