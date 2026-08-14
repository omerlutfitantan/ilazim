import type { Metadata } from "next";
import { CategoryIndex, generateMetadata as gen } from "@/components/category-index";

type Props = { params: Promise<{ kategori: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return gen({ params, kind: "product" });
}

export default async function Page({ params, searchParams }: Props) {
  const { kategori } = await params;
  const { q } = await searchParams;
  return <CategoryIndex kind="product" kategori={kategori} q={q} />;
}
