"use client";

import * as React from "react";
import { usePathname, useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  User,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, type DropdownItem } from "@/components/ui/dropdown";

export interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  onSignOut?: () => void;
  className?: string;
}

export function UserMenu({ user, onSignOut, className }: UserMenuProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Check if current route is inside the dashboard
  const isDashboard = pathname?.includes("/dashboard");

  const items: DropdownItem[] = [
    {
      label: (
        <div className="flex flex-col text-left py-0.5">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {user.name || "User"}
          </span>
          <span className="text-xs text-neutral-500 truncate">
            {user.email || ""}
          </span>
        </div>
      ),
      disabled: true,
    },
    { divider: true, label: "" },
    isDashboard
      ? {
          label: "Home",
          icon: <Home className="h-4 w-4" />,
          href: `/${locale}`,
        }
      : {
          label: "Dashboard Overview",
          icon: <LayoutDashboard className="h-4 w-4" />,
          href: `/${locale}/dashboard`,
        },
    {
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
      href: `/${locale}/profile`,
    },
    ...(user.role === "admin"
      ? [
          {
            label: "Admin Panel",
            icon: <ShieldCheck className="h-4 w-4 text-primary-600" />,
            href: `/${locale}/admin`,
          },
        ]
      : []),
    { divider: true, label: "" },
    {
      label: "Sign Out",
      icon: <LogOut className="h-4 w-4" />,
      destructive: true,
      onClick: onSignOut || (() => signOut({ callbackUrl: `/${locale}` })),
      href: onSignOut ? undefined : "/api/auth/signout",
    },
  ];

  return (
    <Dropdown
      align="right"
      items={items}
      className={className}
      trigger={
        <div className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-primary-500/20 transition-all p-0.5 cursor-pointer">
          <Avatar
            src={user.image}
            name={user.name || "User"}
            size="sm"
            className="border border-neutral-200 dark:border-neutral-700"
          />
        </div>
      }
    />
  );
}

export default UserMenu;
