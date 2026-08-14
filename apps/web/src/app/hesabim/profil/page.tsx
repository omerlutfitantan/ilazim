import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import { AvatarUploader } from "@/components/avatar-uploader";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris?next=/hesabim/profil");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display text-4xl">Profil</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">Fotoğraf ve iletişim bilgilerin.</p>
      <AvatarUploader userId={profile.id} avatarUrl={profile.avatar_url} name={profile.display_name} />
      <div className="mt-10">
        <ProfileForm
          fullName={profile.full_name}
          displayName={profile.display_name}
          phone={profile.phone}
          bio={profile.bio}
        />
      </div>
    </div>
  );
}
