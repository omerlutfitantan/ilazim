import { Suspense } from "react";
import DogrulaClient from "./view";

export default function Page() {
  return (
    <Suspense>
      <DogrulaClient />
    </Suspense>
  );
}
