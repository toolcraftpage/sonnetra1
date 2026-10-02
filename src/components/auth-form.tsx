"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeAuthEmail, validatePassword } from "@/lib/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type AuthFormMode = "login" | "signup" | "forgot-password";

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("A valid email address is required.");
      return;
    }

    if (mode !== "forgot-password" && !validatePassword(password)) {
      setError("Password must be at least 8 characters and include a number.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Authentication is not configured in this environment.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (authError) {
          throw new Error(authError.message);
        }

        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
        const { error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        });

        if (authError) {
          throw new Error(authError.message);
        }

        setSuccess("Check your email to confirm the account and complete sign-up.");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      setSuccess("If that account exists, a password reset link was sent to the email address.");
      setEmail("");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "An unexpected authentication error occurred.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageTitle = mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Reset password";
  const submitLabel = mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="panel-kicker">Account access</p>
        <h1>{pageTitle}</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hello@example.com"
            disabled={isSubmitting}
            required
          />

          {mode !== "forgot-password" ? (
            <>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                required
              />
            </>
          ) : null}

          {mode === "signup" ? (
            <>
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                disabled={isSubmitting}
                required
              />
            </>
          ) : null}

          {error ? <p className="form-message error">{error}</p> : null}
          {success ? <p className="form-message success">{success}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait…" : submitLabel}
          </button>
        </form>

        <div className="auth-links">
          {mode !== "login" ? <Link href="/login">Back to login</Link> : null}
          {mode !== "signup" ? <Link href="/signup">Create account</Link> : null}
          {mode !== "forgot-password" ? <Link href="/forgot-password">Forgot password?</Link> : null}
        </div>
      </div>
    </div>
  );
}
