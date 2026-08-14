import { StepKind } from "@/components/listing-steps";
import type { ListingKind } from "@ilazim/shared";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const initial = kind === "product" || kind === "service" ? (kind as ListingKind) : undefined;
  return <StepKind initialKind={initial} />;
}
