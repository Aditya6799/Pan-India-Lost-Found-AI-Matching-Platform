import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  BarChart2,
  ScrollText,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user || session.user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  const navItems = [
    { label: 'Overview', href: `/${locale}/admin`, icon: LayoutDashboard },
    { label: 'Users', href: `/${locale}/admin/users`, icon: Users },
    { label: 'Reports', href: `/${locale}/admin/reports`, icon: FileText },
    { label: 'Claims', href: `/${locale}/admin/claims`, icon: ClipboardList },
    { label: 'Analytics', href: `/${locale}/admin/analytics`, icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
              AI
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white tracking-tight">FoundIt Admin</div>
              <div className="text-xs text-slate-500">Pan-India Moderation</div>
            </div>
          </div>
          <Badge variant="match" withDot className="text-[10px]">
            ADMIN
          </Badge>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/80 transition-all"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Back Button & User Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to User Dashboard</span>
          </Link>
          <div className="flex items-center space-x-3 pt-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
              {session.user.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {session.user.name || 'Admin'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Admin Control Center</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live Platform
            </span>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
