"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useAuth } from "@/src/components/providers/AuthProvider";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/src/lib/supabase";

const logoImage = "/brickAI_logo_transparent.png";

type AuthMode = "signin" | "signup";

interface AuthPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AuthPage({ onBack, onSuccess }: AuthPageProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      onSuccess();
    }
  }, [isAuthenticated, isLoading, onSuccess]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        onSuccess();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        onSuccess();
        return;
      }

      setInfoMessage(
        "Account created. Check your email to confirm the address before signing in.",
      );
      setMode("signin");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleForgotPassword = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!formData.email.trim()) {
      setErrorMessage("Enter your email first, then request a reset link.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/auth`,
        },
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setInfoMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not send reset email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setInfoMessage("");

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Google sign-in failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="relative z-10 border-b border-gray-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm tracking-wide text-gray-700 transition hover:text-gray-900"
          >
            <img
              src={logoImage}
              alt="Brick AI logo"
              className="h-28 w-auto"
            />
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="-translate-y-8 flex w-full max-w-md flex-col items-center sm:-translate-y-10">
          {/* Auth Card */}
          <div className="w-full rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-gray-900">Welcome to Brick AI</h1>
              <p className="text-sm text-gray-600">help Australians find the right home</p>
            </div>

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {infoMessage ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {infoMessage}
              </div>
            ) : null}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs uppercase tracking-[0.35em] text-gray-500">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        className="h-12 border-gray-300 bg-white pl-10 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs uppercase tracking-[0.35em] text-gray-500">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Smith"
                        className="h-12 border-gray-300 bg-white pl-10 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.35em] text-gray-500">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled={isSubmitting}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 border-gray-300 bg-white pl-10 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.35em] text-gray-500">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    disabled={isSubmitting}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className="h-12 border-gray-300 bg-white pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signin" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      void handleForgotPassword();
                    }}
                    className="text-sm text-gray-600 transition hover:text-gray-900"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-gray-900 font-medium text-white transition hover:bg-gray-800"
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <Separator className="flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <Separator className="flex-1 bg-gray-200" />
            </div>

            {/* Social Sign In */}
            <div className="space-y-3">
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void handleGoogleSignIn();
                }}
                variant="outline"
                className="h-12 w-full rounded-xl border-gray-300 bg-white text-gray-900 transition hover:border-gray-400 hover:bg-gray-50"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            {/* Toggle Mode */}
            <div className="mt-8 text-center text-sm">
              <span className="text-gray-600">
                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
              </span>{" "}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setErrorMessage("");
                  setInfoMessage("");
                  setMode(mode === "signin" ? "signup" : "signin");
                }}
                className="font-medium text-gray-900 transition hover:text-gray-700"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to Brick AI's Terms of Service and Privacy Policy
          </p>
        </div>
      </main>
    </>
  );
}
