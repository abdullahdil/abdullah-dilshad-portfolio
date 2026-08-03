"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-controls";

const initialState: AuthActionState = { error: null };

type LoginFormProps = {
  configured: boolean;
  bannerError?: string | null;
};

export function LoginForm({ configured, bannerError }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const error = state.error ?? bannerError ?? null;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Operator ID (Email)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="operator@example.com"
          autoComplete="username"
          required
          disabled={!configured || pending}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Access Key (Password)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••••••"
          autoComplete="current-password"
          required
          minLength={8}
          disabled={!configured || pending}
        />
      </div>

      {error ? (
        <p
          className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="secondary"
        className="w-full"
        disabled={!configured || pending}
      >
        {pending ? "Authorizing…" : "Sign In"}
      </Button>
    </form>
  );
}
