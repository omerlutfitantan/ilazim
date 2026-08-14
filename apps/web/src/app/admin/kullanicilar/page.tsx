import { createClient } from "@/lib/supabase/server";
import { SellerReviewButtons } from "@/components/admin-seller-buttons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role, seller_status, seller_type, created_at, slug")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Kullanıcılar</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Satıcı</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.display_name}</TableCell>
              <TableCell>{p.role}</TableCell>
              <TableCell>{p.seller_status ?? "—"}</TableCell>
              <TableCell>
                {p.seller_status === "pending" && <SellerReviewButtons userId={p.id} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
