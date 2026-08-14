import { getProfile } from "@/lib/data";
import { StepContact } from "@/components/listing-steps";

export default async function Page() {
  const profile = await getProfile();
  return <StepContact authed={Boolean(profile)} defaultPhone={profile?.phone} />;
}
