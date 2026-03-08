/**
 * Application header with HEATDEBT branding.
 */

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-baseline space-x-1">
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
        </div>
      </div>
    </header>
  );
}
