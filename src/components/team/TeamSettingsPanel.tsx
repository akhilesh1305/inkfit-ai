"use client";

import { Settings, Save, Check, Loader2 } from "lucide-react";
import { TEAM_ROLES, type TeamSettings, type TeamRole } from "@/lib/team";

interface TeamSettingsPanelProps {
  settings: TeamSettings;
  saving: boolean;
  saved: boolean;
  onChange: (settings: TeamSettings) => void;
  onSave: () => void;
}

export function TeamSettingsPanel({
  settings,
  saving,
  saved,
  onChange,
  onSave,
}: TeamSettingsPanelProps) {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
          <Settings className="h-5 w-5 text-content-muted" />
        </div>
        <div>
          <h2 className="section-title">Team Settings</h2>
          <p className="text-xs text-content-subtle">Workspace configuration</p>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="workspace-name">
          Workspace Name
        </label>
        <input
          id="workspace-name"
          className="input-field"
          value={settings.name}
          onChange={(e) => onChange({ ...settings, name: e.target.value })}
        />
      </div>

      <div>
        <label className="label" htmlFor="default-role">
          Default Role for Invites
        </label>
        <select
          id="default-role"
          className="input-field"
          value={settings.defaultRole}
          onChange={(e) =>
            onChange({ ...settings, defaultRole: e.target.value as TeamRole })
          }
        >
          {TEAM_ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-content">Allow member invites</p>
          <p className="text-xs text-content-subtle">
            Admins can invite new team members
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.allowInvites}
          onClick={() => onChange({ ...settings, allowInvites: !settings.allowInvites })}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            settings.allowInvites
              ? "bg-gradient-to-r from-brand-600 to-accent-blue"
              : "bg-white/20"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
              settings.allowInvites ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </label>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="btn-primary w-full"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}
