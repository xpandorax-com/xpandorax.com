import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { users } from "~/db/schema";
import { getSession, hashPassword, createBlankSessionCookie, createLucia } from "~/lib/auth";
import { validatePasswordStrength } from "~/lib/security";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertCircle, Loader2, ShieldCheck, CheckCircle, XCircle } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Change Password - XpandoraX" },
    { name: "description", content: "Change your password to continue." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user, session } = await getSession(request, context);

  if (!user || !session) {
    return redirect("/login");
  }

  return json({
    mustChange: user.mustChangePassword,
    email: user.email,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { user, session, lucia, db } = await getSession(request, context);

  if (!user || !session || !lucia || !db) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate new password matches confirmation
  if (newPassword !== confirmPassword) {
    return json({ error: "New passwords do not match" }, { status: 400 });
  }

  // Validate password strength
  const strengthCheck = validatePasswordStrength(newPassword);
  if (!strengthCheck.valid) {
    return json({ error: strengthCheck.errors[0], passwordErrors: strengthCheck.errors }, { status: 400 });
  }

  // For forced password change (first login), we skip current password check
  // but verify the default password was used
  if (!user.mustChangePassword) {
    // Regular password change - verify current password
    const { verifyPassword } = await import("~/lib/auth");
    const validCurrentPassword = await verifyPassword(user.hashedPassword, currentPassword);
    if (!validCurrentPassword) {
      return json({ error: "Current password is incorrect" }, { status: 400 });
    }
  }

  // Ensure new password is different from current
  const { verifyPassword } = await import("~/lib/auth");
  const sameAsOld = await verifyPassword(user.hashedPassword, newPassword);
  if (sameAsOld) {
    return json({ error: "New password must be different from your current password" }, { status: 400 });
  }

  // Hash new password and update user
  const hashedPassword = await hashPassword(newPassword);
  
  await db
    .update(users)
    .set({
      hashedPassword,
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Invalidate all existing sessions and create new one
  await lucia.invalidateUserSessions(user.id);
  const newSession = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(newSession.id).serialize();

  // Redirect based on role
  const redirectTo = user.role === "admin" ? "/admin" : "/";

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
}

export default function ChangePasswordPage() {
  const { mustChange, email } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const passwordRequirements = [
    { text: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { text: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { text: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { text: "One number", test: (p: string) => /[0-9]/.test(p) },
    { text: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-2xl font-bold">
              {mustChange ? "Set New Password" : "Change Password"}
            </CardTitle>
          </div>
          <CardDescription>
            {mustChange
              ? "For security, please set a new password for your account."
              : "Update your password to keep your account secure."}
          </CardDescription>
          {mustChange && (
            <p className="text-sm text-muted-foreground">
              Logged in as: <strong>{email}</strong>
            </p>
          )}
        </CardHeader>
        <Form method="post">
          <CardContent className="space-y-4">
            {actionData?.error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {actionData.error}
              </div>
            )}

            {!mustChange && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  required={!mustChange}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            {/* Password requirements */}
            <div className="bg-gray-900 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-300">Password requirements:</p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-[10px]">•</span>
                    </div>
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {mustChange ? "Set Password & Continue" : "Update Password"}
                </>
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
