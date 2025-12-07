import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useActionData, Form, Link, useNavigation } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { users } from "~/db/schema";
import {
  getSession,
  verifyPassword,
  createLucia,
  createSessionCookie,
  getUserByEmail,
} from "~/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  isAccountLocked,
  calculateLockoutEnd,
  SECURITY_CONFIG,
} from "~/lib/security";
import { loginSchema } from "~/lib/validations";
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
import { AlertCircle, Loader2, LogIn, Lock } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Log In - XpandoraX" },
    { name: "description", content: "Log in to your XpandoraX account." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await getSession(request, context);

  if (user) {
    // Check if user needs to change password
    if (user.mustChangePassword) {
      return redirect("/change-password");
    }
    return redirect("/");
  }

  return json({});
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const clientIp = getClientIp(request);

  // Rate limiting
  const rateLimitKey = `login:${clientIp}`;
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return json(
      { error: `Too many login attempts. Please try again in ${rateLimit.retryAfter} seconds.`, locked: true },
      { status: 429 }
    );
  }

  // Validate input
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const db = createDatabase(context.cloudflare.env.DB);

  // Find user by email
  const user = await getUserByEmail(db, email);
  if (!user) {
    return json(
      { error: "Invalid email or password" },
      { status: 400 }
    );
  }

  // Check if account is locked
  if (isAccountLocked(user.lockedUntil)) {
    const remainingTime = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 60000);
    return json(
      { error: `Account is locked. Please try again in ${remainingTime} minutes.`, locked: true },
      { status: 403 }
    );
  }

  // Verify password
  const validPassword = await verifyPassword(user.hashedPassword, password);
  if (!validPassword) {
    // Increment failed login attempts
    const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
    const shouldLock = newFailedAttempts >= SECURITY_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS;
    
    await db
      .update(users)
      .set({
        failedLoginAttempts: newFailedAttempts,
        lockedUntil: shouldLock ? calculateLockoutEnd() : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    if (shouldLock) {
      return json(
        { error: `Too many failed attempts. Account locked for ${SECURITY_CONFIG.LOCKOUT_DURATION / 60000} minutes.`, locked: true },
        { status: 403 }
      );
    }

    const remainingAttempts = SECURITY_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS - newFailedAttempts;
    return json(
      { error: `Invalid email or password. ${remainingAttempts} attempts remaining.` },
      { status: 400 }
    );
  }

  // Reset failed login attempts and update last login info
  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: clientIp,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Create session
  const lucia = createLucia(db);
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = createSessionCookie(lucia, session.id);

  // Check if user must change password
  if (user.mustChangePassword) {
    return redirect("/change-password", {
      headers: {
        "Set-Cookie": sessionCookie,
      },
    });
  }

  // Redirect admin to admin panel, regular users to home
  const redirectTo = user.role === "admin" ? "/admin" : "/";

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Form method="post">
          <CardContent className="space-y-4">
            {actionData?.error && (
              <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                actionData.locked 
                  ? "bg-red-500/10 text-red-500" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                {actionData.locked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {actionData.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
