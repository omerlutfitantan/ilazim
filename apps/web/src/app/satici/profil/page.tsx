import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocations, getProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { AvatarUploader } from "@/components/avatar-uploader";
import { ProfileForm } from "@/components/profile-form";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  if (profile.role === "buyer") redirect("/satici/onboarding");
  const locs = await getLocations();

  return (
    <div>
      <h1 className="font-display text-4xl">Satıcı profili</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fotoğraf, konum ve herkese açık bilgilerin. Açık iş filtreleri buradaki şehre/ilçeye göre çalışır.
      </p>
      <div className="mt-8">
        <AvatarUploader userId={profile.id} avatarUrl={profile.avatar_url} name={profile.full_name} />
      </div>
      <div className="mt-10 max-w-xl">
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
      <div className="mt-8 flex flex-col gap-3">
        {profile.slug && (
          <Button asChild>
            <Link href={`/usta/${profile.slug}`}>Herkese açık profil</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/satici/hizmetlerim">Hizmetlerimi düzenle</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/satici/ilanlar">Açık işler</Link>
        </Button>
      </div>
    </div>
  );
}
