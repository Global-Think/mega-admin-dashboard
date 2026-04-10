'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { updatePasswordAction, type AuthActionState } from '@/components/auth/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export function ResetPasswordForm({ nextPath }: { nextPath: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, formAction] = useActionState(updatePasswordAction, {
    error: null,
    feedback: null,
  } satisfies AuthActionState);

  return (
    <Card className="w-full max-w-md rounded-[2rem] border shadow-none">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl">Set a new password</CardTitle>
        <CardDescription className="text-sm leading-7">
          Choose a new password for your admin account, then we will take you back into the app.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {state.error ? (
          <Alert variant="error">
            <AlertTitle>Password update failed</AlertTitle>
            <AlertDescription className="text-red-700">{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-4" action={formAction}>
          <input type="hidden" name="nextPath" value={nextPath} />

          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          <ResetPasswordSubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

function ResetPasswordSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save new password'}
    </Button>
  );
}
