import type { Metadata } from "next";
import { CategoryIndex, generateMetadata as gen } from "@/components/category-index";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return gen({ params: Promise.resolve({}), kind: "product" });
}

export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;
  return <CategoryIndex kind="product" q={q} />;
}
