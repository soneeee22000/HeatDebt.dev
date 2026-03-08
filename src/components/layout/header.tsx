/**
 * Application header with HEATDEBT branding and logout.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearAuthCookie } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();

  function handleSignOut() {
    clearAuthCookie();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="flex-1 flex items-center">
          <Link href="/dashboard" className="flex items-baseline space-x-1">
            <h1 className="font-extrabold text-xl tracking-tight">
              <span className="text-primary-foreground">HEAT</span>
              <span className="text-orange-500">DEBT</span>
            </h1>
            <p className="text-sm text-muted-foreground hidden sm:block ml-2">
              Montgomery, Alabama
            </p>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-[10px] text-muted-foreground">
            <span>Powered by</span>
            <span className="font-semibold text-primary-foreground">
              Google Gemini
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-primary-foreground"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
