import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, title, slug, kind, status, offer_count, categories(slug)")
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">İlanlar</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Teklif</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((l) => (
            <TableRow key={l.id}>
              <TableCell>
                <Link
                  className="underline"
                  href={`/ilan/${(l.categories as { slug?: string } | null)?.slug}/${l.slug}`}
                >
                  {l.title}
                </Link>
              </TableCell>
              <TableCell>{l.kind}</TableCell>
              <TableCell>{l.status}</TableCell>
              <TableCell>{l.offer_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
