import Link from "next/link";
import type { Metadata } from "next";
import { NasilCalisirClient } from "./view";

export const metadata: Metadata = {
  title: "Nasıl çalışır",
  description:
    "Talepik'te ilan açmak, teklif vermek ve nasıl iade alınır — adım adım rehber ve sık sorulan sorular.",
};

export default function Page() {
  return <NasilCalisirClient />;
}
