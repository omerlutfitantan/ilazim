import { getLocations } from "@/lib/data";
import { StepLocation } from "@/components/listing-steps";

export default async function Page() {
  const locs = await getLocations();
  return <StepLocation cities={locs.cities} districts={locs.districts} />;
}
