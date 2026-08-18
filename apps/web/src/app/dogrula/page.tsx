import { Suspense } from "react";
import type { Metadata } from "next";
import DogrulaClient from "./view";

export const metadata: Metadata = {
  title: "E-posta doğrulama",
};

export default function Page() {
  return (
    <Suspense>
      <DogrulaClient />
    </Suspense>
  );
}
