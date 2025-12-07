import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { eq, and, gt } from "drizzle-orm";
import { createDatabase } from "~/db";
import { users } from "~/db/schema";
import { hashPassword } from "~/lib/auth";
import {
  verifyToken,
  validatePasswordStrength,
  checkRateLimit,
  getClientIp,
} from "~/lib/security";
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
import { AlertCircle, Loader2, ShieldCheck, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Reset Password - XpandoraX" },
    { name: "description", content: "Set a new password for your account." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");

  if (!token || !email) {
    return json({ valid: false, error: "Invalid or missing reset link." });
  }

  const db = createDatabase(context.cloudflare.env.DB);

  // Find user with valid reset token
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email.toLowerCase()),
        gt(users.passwordResetExpires, new Date())
      )
    )
    .limit(1);

  if (!user || !user.passwordResetToken) {
    return json({ valid: false, error: "This reset link has expired or is invalid. Please request a new one." });
  }

  // Verify token
  const isValidToken = await verifyToken(token, user.passwordResetToken);
  if (!isValidToken) {
    return json({ valid: false, error: "Invalid reset token. Please request a new password reset." });
  }

  return json({ valid: true, email });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const email = (formData.get("email") as string)?.toLowerCase();
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const clientIp = getClientIp(request);

  // Rate limiting
  const rateLimitKey = `reset-password:${clientIp}`;
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return json(
      { error: `Too many attempts. Please try again in ${rateLimit.retryAfter} seconds.` },
      { status: 429 }
    );
  }

  if (!token || !email) {
    return json({ error: "Invalid request" }, { status: 400 });
  }

  // Validate password match
  if (newPassword !== confirmPassword) {
    return json({ error: "Passwords do not match" }, { status: 400 });
  }

  // Validate password strength
  const strengthCheck = validatePasswordStrength(newPassword);
  if (!strengthCheck.valid) {
    return json({ error: strengthCheck.errors[0] }, { status: 400 });
  }

  const db = createDatabase(context.cloudflare.env.DB);

  // Find user with valid reset token
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        gt(users.passwordResetExpires, new Date())
      )
    )
    .limit(1);

  if (!user || !user.passwordResetToken) {
    return json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }

  // Verify token
  const isValidToken = await verifyToken(token, user.passwordResetToken);
  if (!isValidToken) {
    return json({ error: "Invalid reset token." }, { status: 400 });
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password and clear reset token
  await db
    .update(users)
    .set({
      hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return json({ success: true });
}

export default function ResetPasswordPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Get token and email from URL for form submission
  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  const token = url?.searchParams.get("token") || "";
  const email = url?.searchParams.get("email") || loaderData.email || "";

  if (actionData?.success) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been updated. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!loaderData.valid) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription className="text-red-400">
              {loaderData.error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request New Reset Link</Link>
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const passwordRequirements = [
    { text: "At least 8 characters" },
    { text: "One uppercase letter" },
    { text: "One lowercase letter" },
    { text: "One number" },
    { text: "One special character (!@#$%^&*)" },
  ];

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          </div>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <Form method="post">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />
          
          <CardContent className="space-y-4">
            {actionData?.error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {actionData.error}
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
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
