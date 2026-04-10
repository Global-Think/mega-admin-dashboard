'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { sendPasswordResetAction, signInAction, type AuthActionState } from '@/components/auth/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string;
  initialError?: string;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastAction, setLastAction] = useState<'sign-in' | 'reset' | null>(null);
  const [signInState, signInFormAction] = useActionState(signInAction, {
    error: initialError ?? null,
    feedback: null,
  } satisfies AuthActionState);
  const [resetState, resetFormAction] = useActionState(sendPasswordResetAction, {
    error: null,
    feedback: null,
  } satisfies AuthActionState);

  const activeState = lastAction === 'reset' ? resetState : signInState;

  return (
    <Card className="w-full max-w-md rounded-[2rem] border shadow-none">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl">Sign in</CardTitle>
        <CardDescription className="text-sm leading-7">Sign in to continue.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {activeState.error ? (
          <Alert variant="error">
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription className="text-red-700">{activeState.error}</AlertDescription>
          </Alert>
        ) : null}

        {activeState.feedback ? (
          <Alert variant="success">
            <AlertTitle>Check your email</AlertTitle>
            <AlertDescription className="text-emerald-700">{activeState.feedback}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-4" action={signInFormAction} onSubmit={() => setLastAction('sign-in')}>
          <input type="hidden" name="nextPath" value={nextPath} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <SignInSubmitButton />
        </form>

        <form action={resetFormAction} onSubmit={() => setLastAction('reset')}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="nextPath" value={nextPath} />
          <ResetPasswordEmailButton email={email} />
        </form>
      </CardContent>
    </Card>
  );
}

function SignInSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  );
}

function ResetPasswordEmailButton({ email }: { email: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" className="w-full" disabled={pending || !email.trim()}>
      {pending ? 'Sending reset link...' : 'Email me a password reset link'}
    </Button>
  );
}
