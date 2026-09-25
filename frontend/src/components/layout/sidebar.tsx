"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CarFront, ChevronRight, LayoutDashboard, Settings, Users, Wrench } from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Bookings", href: "/bookings", icon: CalendarDays },
  { name: "Mechanics", href: "/mechanics", icon: Wrench },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-[272px] shrink-0 flex-col border-r border-white/10 bg-[#0b1017] text-slate-300 md:flex">
      <Link href="/" className="flex h-[82px] items-center gap-3 border-b border-white/10 px-6">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
          <CarFront className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0b1017] bg-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-black tracking-tight text-white">GaragePro</span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">Live</span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">Workshop operations</p>
        </div>
      </Link>

      <div className="px-4 pt-7">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Workspace</p>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all ${
                isActive
                  ? "bg-orange-500/12 text-orange-300 ring-1 ring-orange-400/15"
                  : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-white/[0.035] text-slate-500 group-hover:text-slate-200"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-orange-300" />}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-orange-300">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Operations mode
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Bookings, technicians and workshop demand in one place.</p>
      </div>

      <div className="border-t border-white/10 p-4">
        <Link href="/settings" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition ${pathname === "/settings" ? "bg-white/[0.07] text-white" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"}`}>
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-black text-white">OP</div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-200">Operations Team</p>
            <p className="truncate text-[10px] text-slate-600">admin@garagepro.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
