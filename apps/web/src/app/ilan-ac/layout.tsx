import { getProfile } from "@/lib/data";
import { ListingWizardShell } from "@/components/listing-wizard-shell";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return <ListingWizardShell authed={Boolean(profile)}>{children}</ListingWizardShell>;
}
