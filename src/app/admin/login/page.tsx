"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction } from "../actions";
import { Button, Card, Field, Input } from "@/components/ui";

function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") ?? "/admin";
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <Card className="w-full max-w-sm p-8">
      <div className="mb-6 text-center">
        <p className="font-display text-sage text-3xl">Luci</p>
        <p className="text-muted mt-1 text-sm">Panel de administración</p>
      </div>
      <form action={action} className="space-y-4">
        <input type="hidden" name="from" value={from} />
        <Field label="Email">
          <Input name="email" type="email" placeholder="admin@luci.com" required />
        </Field>
        <Field label="Contraseña">
          <Input name="password" type="password" placeholder="••••••••" required />
        </Field>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-cream flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
