/**
 * Login page for HEATDEBT.
 * Dev credentials: admin / 12345
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { validateCredentials, setAuthCookie } from "@/lib/auth";
import { Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (validateCredentials(username, pin)) {
      setAuthCookie();
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-extrabold text-3xl tracking-tight">
              <span className="text-primary-foreground">HEAT</span>
              <span className="text-orange-500">DEBT</span>
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Urban Thermal Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6 pb-6 px-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-primary-foreground">
                Sign In
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">Password</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Demo:{" "}
              <span className="text-primary-foreground font-mono">admin</span> /{" "}
              <span className="text-primary-foreground font-mono">12345</span>
            </p>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
