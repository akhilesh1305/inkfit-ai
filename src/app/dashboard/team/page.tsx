"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Loader2, Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TeamMembersTable } from "@/components/team/TeamMembersTable";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";
import { TeamSettingsPanel } from "@/components/team/TeamSettingsPanel";
import {
  DEFAULT_TEAM_SETTINGS,
  TEAM_ROLES,
  type TeamMember,
  type TeamSettings,
  type TeamRole,
} from "@/lib/team";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<TeamSettings>(DEFAULT_TEAM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadTeam = useCallback(async () => {
    const res = await fetch("/api/team");
    const data = await res.json();
    setMembers(data.members ?? []);
    if (data.settings) setSettings(data.settings);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function handleInvite(data: { name: string; email: string; role: TeamRole }) {
    setInviting(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "invite", ...data }),
    });
    const result = await res.json();
    setInviting(false);
    if (!res.ok) throw new Error(result.error ?? "Invite failed");
    setMembers((prev) => [...prev, result.member]);
  }

  async function handleRoleChange(id: string, role: TeamRole) {
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, role }),
    });
    const data = await res.json();
    if (data.member) {
      setMembers((prev) => prev.map((m) => (m.id === id ? data.member : m)));
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", id }),
    });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "settings", ...settings }),
    });
    const data = await res.json();
    if (data.settings) setSettings(data.settings);
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

  const activeCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Users className="h-7 w-7 text-brand-400" />
            Team Workspace
          </span>
        }
        description="Invite collaborators, manage roles, and configure your agency workspace."
      >
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          disabled={!settings.allowInvites}
          className="btn-primary"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Members", value: members.length, icon: Users },
          { label: "Active", value: activeCount, icon: Shield },
          { label: "Pending Invites", value: invitedCount, icon: UserPlus },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15">
              <stat.icon className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-content">{stat.value}</p>
              <p className="text-xs text-content-subtle">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Role legend */}
      <div className="mb-6 flex flex-wrap gap-3">
        {TEAM_ROLES.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <p className="text-xs font-semibold text-content">{r.label}</p>
            <p className="text-[10px] text-content-subtle">{r.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <TeamMembersTable
          members={members}
          onRoleChange={handleRoleChange}
          onRemove={handleRemove}
        />

        <TeamSettingsPanel
          settings={settings}
          saving={savingSettings}
          saved={settingsSaved}
          onChange={setSettings}
          onSave={handleSaveSettings}
        />
      </div>

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        defaultRole={settings.defaultRole}
        loading={inviting}
      />
    </div>
  );
}
