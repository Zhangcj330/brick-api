"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/src/components/providers/AuthProvider";

const logoImage = "/brickAI_logo_transparent.png";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
] as const;

interface AppNavigatorProps {
  rightSlot?: React.ReactNode;
}

export function AppNavigator({ rightSlot }: AppNavigatorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const defaultRightSlot = (
    <div className="flex min-w-[112px] justify-end">
      {isLoading ? (
        <div className="h-10 w-24 rounded-full border border-gray-200 bg-white/70" aria-hidden="true" />
      ) : isAuthenticated ? (
        <button
          type="button"
          disabled={isSigningOut}
          onClick={() => {
            void handleSignOut();
          }}
          className="rounded-full border border-gray-200 bg-white/88 px-4 py-2 text-sm text-gray-700 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      ) : (
        <Link
          href="/auth"
          className="rounded-full border border-gray-200 bg-white/88 px-4 py-2 text-sm text-gray-700 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition hover:text-gray-950"
        >
          Sign in
        </Link>
      )}
    </div>
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
      <div className="flex justify-start pl-4 sm:pl-6 md:pl-8">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 text-sm tracking-wide text-gray-700 transition hover:text-gray-900"
        >
          <img
            src={logoImage}
            alt="Brick AI logo"
            className="h-20 w-auto sm:h-24"
          />
        </Link>
      </div>

      <nav className="flex items-center rounded-full border border-gray-200 bg-white/88 p-1 shadow-[0_16px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href ||
                pathname.startsWith("/report/") ||
                pathname.startsWith("/workspace/")
              : item.href === "/explore"
                ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition sm:px-5 ${
                isActive
                  ? "bg-gray-950 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex justify-end">
        {rightSlot ?? defaultRightSlot}
      </div>
    </div>
  );
}
