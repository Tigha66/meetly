
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Settings, 
  Users, 
  LogOut, 
  Plus, 
  MoreVertical, 
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold">Meetly</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active />
          <SidebarItem icon={<CalendarDays size={20} />} label="Event Types" />
          <SidebarItem icon={<Users size={20} />} label="Bookings" />
          <SidebarItem icon={<Clock size={20} />} label="Availability" />
          <SidebarItem icon={<Settings size={20} />} label="Integrations" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Abdelhak" alt="User" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Abdelhak</p>
              <p className="text-xs text-slate-500 truncate">Pro Plan</p>
            </div>
            <LogOut size={16} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a href="#" className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
      active ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}>
      <span className={cn(active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")}>
        {icon}
      </span>
      {label}
    </a>
  );
}
