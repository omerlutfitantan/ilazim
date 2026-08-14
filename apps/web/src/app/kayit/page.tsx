import { AuthScreen } from "@/components/auth-screen";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthScreen mode="kayit" next={next} />;
}
