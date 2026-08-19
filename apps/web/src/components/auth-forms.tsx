"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signInAction, signUpAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CityDistrictFields, type LocOption } from "@/components/city-district-fields";
import { PhoneInput } from "@/components/phone-input";

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete={autoComplete}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
          aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function SignInForm({ next, compact }: { next?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(signInAction, null);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <Label htmlFor="email-in">E-posta</Label>
        <Input
          id="email-in"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1"
        />
      </div>
      <PasswordField
        id="password-in"
        name="password"
        label="Şifre"
        autoComplete="current-password"
      />
      <p className="text-right text-sm">
        <Link href="/sifre-sifirla" className="text-muted-foreground underline underline-offset-4">
          Şifremi unuttum
        </Link>
      </p>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
      {!compact && (
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Giriş, doğrulanmış e-posta ile çalışır. Mailindeki bağlantıyı henüz açmadıysan üyelik
          tamamlanmamıştır.
        </p>
      )}
    </form>
  );
}

export function SignUpForm({
  next,
  cities,
  districts,
}: {
  next?: string;
  cities: LocOption[];
  districts: LocOption[];
}) {
  const [state, action, pending] = useActionState(signUpAction, null);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Ad</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            minLength={2}
            maxLength={40}
            autoComplete="given-name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Soyad</Label>
          <Input
            id="lastName"
            name="lastName"
            required
            minLength={2}
            maxLength={40}
            autoComplete="family-name"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email-up">E-posta</Label>
        <Input id="email-up" name="email" type="email" required autoComplete="email" className="mt-1" />
        <p className="mt-1 text-xs text-muted-foreground">
          Üyelik, bu adrese giden doğrulama bağlantısı açılmadan başlamaz.
        </p>
      </div>
      <div>
        <Label htmlFor="phone-up">Telefon</Label>
        <PhoneInput id="phone-up" required className="mt-1" />
      </div>
      <CityDistrictFields cities={cities} districts={districts} />
      <PasswordField id="password-up" name="password" label="Şifre (en az 8 karakter)" autoComplete="new-password" />
      <PasswordField
        id="passwordConfirm"
        name="passwordConfirm"
        label="Şifre tekrar"
        autoComplete="new-password"
      />
      <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3 text-sm leading-6 cursor-pointer hover:bg-muted/70 transition-colors">
        <input type="checkbox" name="isSeller" className="mt-0.5 size-4 accent-primary" />
        <span>
          <span className="font-medium">Hizmet veren / satıcı hesabı olarak kayıt olmak istiyorum</span>
          <span className="block mt-0.5 text-xs text-muted-foreground">
            İşaretlenmezse alıcı hesabı açılır. Sonradan satıcıya geçiş yapılabilir.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="acceptTerms" required className="mt-1 size-4" />
        <span>
          <Link href="/sartlar" className="underline underline-offset-4">
            Kullanım koşullarını
          </Link>{" "}
          ve{" "}
          <Link href="/kvkk" className="underline underline-offset-4">
            KVKK aydınlatmasını
          </Link>{" "}
          ve{" "}
          <Link href="/cerez" className="underline underline-offset-4">
            çerez politikasını
          </Link>{" "}
          okudum, kabul ediyorum.
        </span>
      </label>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Gönderiliyor…" : "Doğrulama maili gönder"}
      </Button>
    </form>
  );
}
