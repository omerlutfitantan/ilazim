import { AuthScreen } from "@/components/auth-screen";
import { getLocations } from "@/lib/data";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const locs = await getLocations();
  return <AuthScreen mode="kayit" next={next} cities={locs.cities} districts={locs.districts} />;
}
