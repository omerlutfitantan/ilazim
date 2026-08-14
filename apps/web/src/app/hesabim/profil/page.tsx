import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocations, getProfile } from "@/lib/data";
import { AvatarUploader } from "@/components/avatar-uploader";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris?next=/hesabim/profil");
  const locs = await getLocations();

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display text-4xl">Profil</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Fotoğraf, iletişim ve konum. Açık işlerdeki şehir / ilçe / km filtreleri buradaki adrese göre çalışır.
      </p>
      <AvatarUploader userId={profile.id} avatarUrl={profile.avatar_url} name={profile.full_name} />
      <div className="mt-10">
        <ProfileForm
          fullName={profile.full_name}
          phone={profile.phone}
          bio={profile.bio}
          cityId={profile.city_id}
          districtId={profile.district_id}
          cities={locs.cities}
          districts={locs.districts}
        />
      </div>
      {profile.slug && (profile.role === "seller" || profile.role === "admin") && (
        <p className="mt-8 text-sm">
          <Link href={`/usta/${profile.slug}`} className="underline underline-offset-4">
            Herkese açık profilimi gör
          </Link>
        </p>
      )}
    </div>
  );
}
