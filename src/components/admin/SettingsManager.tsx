"use client";

import {
  BellIcon as Bell,
  EnvelopeSimpleIcon as Mail,
  FacebookLogoIcon as Facebook,
  InstagramLogoIcon as Instagram,
  LockKeyIcon as LockKey,
  PhoneIcon as Phone,
  ShieldCheckIcon as ShieldCheck,
  TiktokLogoIcon as TiktokLogo,
  YoutubeLogoIcon as Youtube,
} from "@phosphor-icons/react/ssr";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/FormField";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";

export function SettingsManager({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => setAdminEmail(data.user?.email ?? null));
  }, []);

  const set = (field: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((s) => ({
      ...s,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to save site settings.");
      return;
    }

    setSaving(true);
    const { error: upsertError } = await createClient()
      .from("site_settings")
      .upsert({
        id: "default",
        phone: settings.phone,
        email: settings.email,
        facebook: settings.facebook,
        instagram: settings.instagram,
        tiktok: settings.tiktok,
        youtube: settings.youtube,
        notify_on_inquiry: settings.notifyOnInquiry,
        notify_on_viewing: settings.notifyOnViewing,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    if (!isSupabaseConfigured) {
      setPasswordError("Connect Supabase to change your password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setPasswordSaving(true);
    const { error: updateError } = await createClient().auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-foreground/60">Site contact info, branding links, and notifications.</p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {saved && <p className="mb-4 rounded-lg bg-accent-light px-4 py-3 text-sm text-accent-dark">Settings saved.</p>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px] xl:items-start">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Contact Info</h2>
                <p className="text-xs text-foreground/50">How clients reach you.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input value={settings.phone} onChange={set("phone")} className={`${inputClass(false)} pl-10`} />
                </div>
              </Field>
              <Field label="Email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={set("email")}
                    className={`${inputClass(false)} pl-10`}
                  />
                </div>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent">
                <Facebook className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Social Links</h2>
                <p className="text-xs text-foreground/50">Shown in the site footer and contact section.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Facebook">
                <div className="relative">
                  <Facebook className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    value={settings.facebook}
                    onChange={set("facebook")}
                    className={`${inputClass(false)} pl-10`}
                  />
                </div>
              </Field>
              <Field label="Instagram">
                <div className="relative">
                  <Instagram className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    value={settings.instagram}
                    onChange={set("instagram")}
                    className={`${inputClass(false)} pl-10`}
                  />
                </div>
              </Field>
              <Field label="TikTok">
                <div className="relative">
                  <TiktokLogo className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input value={settings.tiktok} onChange={set("tiktok")} className={`${inputClass(false)} pl-10`} />
                </div>
              </Field>
              <Field label="YouTube">
                <div className="relative">
                  <Youtube className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    value={settings.youtube}
                    onChange={set("youtube")}
                    className={`${inputClass(false)} pl-10`}
                  />
                </div>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent">
                <Bell className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={settings.notifyOnInquiry}
                  onChange={set("notifyOnInquiry")}
                  className="mt-0.5 h-4 w-4 accent-accent"
                />
                New inquiries
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={settings.notifyOnViewing}
                  onChange={set("notifyOnViewing")}
                  className="mt-0.5 h-4 w-4 accent-accent"
                />
                New viewing requests
              </label>
            </div>
          </section>

          <Button type="submit" disabled={saving} className="w-fit">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </form>

        <div className="flex flex-col gap-6 xl:sticky xl:top-6">
          <section className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Account &amp; Security</h2>
                <p className="text-xs text-foreground/50">Your sign-in credentials for this dashboard.</p>
              </div>
            </div>

            {adminEmail && (
              <p className="mt-4 rounded-xl bg-muted px-3.5 py-2.5 text-xs text-foreground/60">
                Signed in as <span className="font-medium text-foreground">{adminEmail}</span>
              </p>
            )}

            <form onSubmit={handlePasswordChange} className="mt-4 flex flex-col gap-3">
              <Field label="New password">
                <div className="relative">
                  <LockKey className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputClass(false)} pl-10`}
                  />
                </div>
              </Field>
              <Field label="Confirm password">
                <div className="relative">
                  <LockKey className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass(false)} pl-10`}
                  />
                </div>
              </Field>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              {passwordSaved && <p className="text-xs text-accent-dark">Password updated.</p>}
              <Button type="submit" variant="outline" size="sm" disabled={passwordSaving} className="mt-1 w-fit">
                {passwordSaving ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Tips</h2>
            <ul className="flex flex-col gap-2.5 text-xs text-foreground/60">
              <li>• Keep your contact email current — it&apos;s where inquiry replies default to.</li>
              <li>• Social links appear in the public footer exactly as entered, so include the full https:// URL.</li>
              <li>• Turning off a notification only stops the in-app alert — the record is still saved.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
