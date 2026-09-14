"use client";

import { SignOutIcon as LogOut } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const onClick = async () => {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      Log Out
    </button>
  );
}
