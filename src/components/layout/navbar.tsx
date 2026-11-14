"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Menu,
  X,
  Search,
  PlusCircle,
  HelpCircle,
  Home,
  User,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/dashboard/notification-bell";

export interface NavbarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export interface NavbarProps {
  user?: NavbarUser | null;
  onSignOut?: () => void;
  className?: string;
}

export function Navbar({ user, onSignOut, className }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "About", href: "/about", icon: HelpCircle },
  ];

  const userDropdownItems = user
    ? [
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
        {
          label: "Dashboard Overview",
          icon: <LayoutDashboard className="h-4 w-4" />,
          href: "/dashboard",
        },
        {
          label: "My Profile",
          icon: <User className="h-4 w-4" />,
          href: "/profile",
        },
        ...(user.role === "admin"
          ? [
              {
                label: "Admin Panel",
                icon: <ShieldCheck className="h-4 w-4 text-primary-600" />,
                href: "/admin/analytics",
              },
            ]
          : []),
        { divider: true, label: "" },
        {
          label: "Sign Out",
          icon: <LogOut className="h-4 w-4" />,
          destructive: true,
          onClick: onSignOut,
          href: onSignOut ? undefined : "/api/auth/signout",
        },
      ]
    : [];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90 transition-colors",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20 group-hover:bg-primary-700 transition-colors">
              <MapPin className="h-5 w-5 fill-white/20 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Found<span className="text-primary-600">It</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 -mt-1">
                India Lost & Found
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/" || pathname === "/en" || pathname === "/hi"
                  : pathname?.includes(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-neutral-100 text-primary-700 font-semibold dark:bg-neutral-800 dark:text-primary-400"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Desktop: CTAs + Notifications + User / Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Fast CTAs */}
          <Link href="/report/lost">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="h-4 w-4" />}
              className="shadow-sm"
            >
              Report Lost
            </Button>
          </Link>

          <Link href="/report/found">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<MapPin className="h-4 w-4" />}
              className="shadow-sm"
            >
              Report Found
            </Button>
          </Link>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <>
              {/* Notifications */}
              <NotificationBell />

              {/* User Dropdown */}
              <Dropdown
                align="right"
                items={userDropdownItems}
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: Hamburger and Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-neutral-200 bg-white px-4 pt-3 pb-6 dark:border-neutral-800 dark:bg-neutral-950 md:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
                >
                  <Icon className="h-5 w-5 text-neutral-400" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="my-4 border-t border-neutral-200 dark:border-neutral-800" />

          {/* Action buttons on mobile */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/report/lost" className="w-full">
              <Button variant="primary" className="w-full justify-center">
                Report Lost
              </Button>
            </Link>
            <Link href="/report/found" className="w-full">
              <Button variant="secondary" className="w-full justify-center">
                Report Found
              </Button>
            </Link>
          </div>

          <div className="mt-4">
            {user ? (
              <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={user.image} name={user.name || "User"} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-neutral-900 dark:text-neutral-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-white p-2 text-center font-medium shadow-sm border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="rounded-lg bg-white p-2 text-center font-medium shadow-sm border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth/sign-in" className="w-full">
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up" className="w-full">
                  <Button variant="primary" className="w-full justify-center">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
