import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SellerReviewButtons } from "@/components/admin-seller-buttons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTrDate, labelOf, roleLabel, sellerStatusLabel } from "@/lib/labels";
import type { SellerStatus, UserRole } from "@ilazim/shared";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role, seller_status, seller_type, created_at, slug, avatar_url")
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
            <TableHead>Kayıt</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <Link href={`/admin/kullanicilar/${p.id}`} className="flex items-center gap-3">
                  <UserAvatar src={p.avatar_url} name={p.display_name} className="size-9" />
                  <span className="underline">{p.display_name}</span>
                </Link>
              </TableCell>
              <TableCell>{labelOf(roleLabel, p.role as UserRole)}</TableCell>
              <TableCell>{labelOf(sellerStatusLabel, p.seller_status as SellerStatus)}</TableCell>
              <TableCell className="text-muted-foreground">{formatTrDate(p.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  {p.seller_status === "pending" && <SellerReviewButtons userId={p.id} />}
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/kullanicilar/${p.id}`}>Detay</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
