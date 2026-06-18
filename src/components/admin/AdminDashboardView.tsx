"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Shield,
  Users,
  CreditCard,
  IndianRupee,
  FileText,
  LifeBuoy,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminRevenueChart,
  AdminUserGrowthChart,
  AdminContentChart,
  AdminPlanPieChart,
} from "@/components/admin/AdminCharts";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { SupportTicketsTable } from "@/components/admin/SupportTicketsTable";
import { SystemMonitoring } from "@/components/admin/SystemMonitoring";
import {
  formatRevenue,
  formatNumber,
  type AdminKpis,
  type AdminUser,
  type SupportTicket,
  type SystemService,
  type RevenuePoint,
  type UserGrowthPoint,
  type ContentGenPoint,
  type PlanBreakdown,
} from "@/lib/admin";

interface AdminData {
  kpis: AdminKpis;
  users: AdminUser[];
  tickets: SupportTicket[];
  services: SystemService[];
  charts: {
    revenue: RevenuePoint[];
    userGrowth: UserGrowthPoint[];
    contentGenerated: ContentGenPoint[];
    planBreakdown: PlanBreakdown[];
  };
}

export function AdminDashboardView() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin");
    if (res.status === 403) {
      setDenied(true);
      setLoading(false);
      return;
    }
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function apiPost(body: Record<string, unknown>) {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleUpdatePlan(userId: string, plan: string) {
    const result = await apiPost({ action: "update-plan", userId, plan });
    if (result.user) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              users: prev.users.map((u) =>
                u.id === userId ? { ...u, plan: result.user.plan } : u
              ),
            }
          : prev
      );
      showToast(`Plan updated to ${plan}`);
    }
  }

  async function handleResolveTicket(ticketId: string) {
    await apiPost({ action: "resolve-ticket", ticketId });
    setData((prev) =>
      prev
        ? {
            ...prev,
            tickets: prev.tickets.map((t) =>
              t.id === ticketId ? { ...t, status: "resolved" as const } : t
            ),
            kpis: {
              ...prev.kpis,
              openTickets: Math.max(0, prev.kpis.openTickets - 1),
            },
          }
        : prev
    );
    showToast("Ticket resolved");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Shield className="h-14 w-14 text-red-500/50" />
        <h1 className="mt-4 text-xl font-bold text-content">Access denied</h1>
        <p className="mt-2 max-w-sm text-sm text-content-subtle">
          Admin access is restricted. Set ADMIN_EMAILS in your environment or use a development session.
        </p>
        <button type="button" onClick={() => router.push("/dashboard")} className="btn-primary mt-6">
          Back to dashboard
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, users, tickets, services, charts } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-content">
            <Shield className="h-7 w-7 text-red-400" />
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-content-subtle">
            Platform overview, user management, and system health
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          Live monitoring
        </span>
      </div>

      {toast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {toast}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={Users}
          label="Users"
          value={formatNumber(kpis.totalUsers)}
          change={`+${kpis.userGrowthPercent}%`}
          gradient="from-violet-600 to-purple-700"
        />
        <KpiCard
          icon={CreditCard}
          label="Subscriptions"
          value={formatNumber(kpis.activeSubscriptions)}
          change="Active paid"
          gradient="from-brand-600 to-cyan-700"
        />
        <KpiCard
          icon={IndianRupee}
          label="Revenue"
          value={formatRevenue(kpis.monthlyRevenue)}
          change={`+${kpis.revenueGrowthPercent}%`}
          gradient="from-emerald-600 to-teal-700"
        />
        <KpiCard
          icon={FileText}
          label="Content generated"
          value={formatNumber(kpis.contentGenerated)}
          change="All time"
          gradient="from-blue-600 to-indigo-700"
        />
        <KpiCard
          icon={LifeBuoy}
          label="Open tickets"
          value={String(kpis.openTickets)}
          change="Needs attention"
          gradient="from-red-600 to-orange-700"
          alert={kpis.openTickets > 5}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue" subtitle="Monthly recurring revenue (INR)">
          <AdminRevenueChart data={charts.revenue} />
        </ChartCard>
        <ChartCard title="User growth" subtitle="Total users & new signups">
          <AdminUserGrowthChart data={charts.userGrowth} />
        </ChartCard>
        <ChartCard title="Content generated" subtitle="By content type per month" id="content">
          <AdminContentChart data={charts.contentGenerated} />
        </ChartCard>
        <ChartCard title="Subscriptions" subtitle="Plan distribution" id="subscriptions">
          <AdminPlanPieChart data={charts.planBreakdown} />
        </ChartCard>
      </div>

      <section id="users" className="scroll-mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0c]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-semibold text-content">User management</h2>
          <p className="text-xs text-content-subtle">Manage accounts, plans, and access</p>
        </div>
        <UserManagementTable users={users} onUpdatePlan={handleUpdatePlan} />
      </section>

      <section id="tickets" className="scroll-mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0c] p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-content">Support tickets</h2>
          <p className="text-xs text-content-subtle">{tickets.filter((t) => t.status !== "resolved").length} open</p>
        </div>
        <SupportTicketsTable tickets={tickets} onResolve={handleResolveTicket} />
      </section>

      <section id="system" className="scroll-mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0c] p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <div>
            <h2 className="text-sm font-semibold text-content">System monitoring</h2>
            <p className="text-xs text-content-subtle">Infrastructure & service health</p>
          </div>
        </div>
        <SystemMonitoring services={services} />
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  gradient,
  alert,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  change: string;
  gradient: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-[#0c0c0e] p-4",
        alert ? "border-red-500/30" : "border-white/[0.06]"
      )}
    >
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br", gradient)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-bold tabular-nums text-content">{value}</p>
      <p className="text-xs font-medium text-content-muted">{label}</p>
      <p className="mt-1 text-[10px] text-content-subtle">{change}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  id,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-6 rounded-2xl border border-white/[0.06] bg-[#0a0a0c] p-5">
      <h3 className="text-sm font-semibold text-content">{title}</h3>
      <p className="mb-4 text-xs text-content-subtle">{subtitle}</p>
      {children}
    </div>
  );
}
