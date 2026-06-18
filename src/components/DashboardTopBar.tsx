"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ClientSwitcher } from "@/components/clients/ClientSwitcher";

interface SessionUser {
  name: string;
  email: string;
  plan: string;
}

export function DashboardTopBar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-white/[0.08] bg-ink-bg/80 px-8 backdrop-blur-xl lg:flex">
      {user && (
        <div className="flex items-center gap-4">
          <ClientSwitcher />
          <div className="flex items-center gap-3">
            <div className="icon-gradient h-8 w-8 text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-content">{user.name}</p>
              <p className="text-xs capitalize text-content-subtle">{user.plan} plan</p>
            </div>
          </div>
        </div>
      )}
      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={logout} className="btn-ghost text-sm" title="Sign out">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
