import type { MetaFunction, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useActionData, Form, useNavigation, Link } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { users } from "~/db/schema";
import {
  generatePasswordResetToken,
  hashToken,
  checkRateLimit,
  getClientIp,
  SECURITY_CONFIG,
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
import { AlertCircle, Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Forgot Password - XpandoraX" },
    { name: "description", content: "Reset your password." },
  ];
};

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const clientIp = getClientIp(request);

  // Rate limiting for password reset requests
  const rateLimitKey = `forgot-password:${clientIp}`;
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return json(
      { error: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.` },
      { status: 429 }
    );
  }

  if (!email || !email.includes("@")) {
    return json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const db = createDatabase(context.cloudflare.env.DB);

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success to prevent email enumeration
  if (!user) {
    return json({ success: true, message: "If an account exists with that email, you will receive a password reset link." });
  }

  // Generate password reset token
  const token = generatePasswordResetToken();
  const hashedToken = await hashToken(token);
  const expiresAt = new Date(Date.now() + SECURITY_CONFIG.PASSWORD_RESET_EXPIRES_IN);

  // Save token to database
  await db
    .update(users)
    .set({
      passwordResetToken: hashedToken,
      passwordResetExpires: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Build reset URL
  const baseUrl = context.cloudflare.env.APP_URL || "https://xpandorax.com";
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  // In production, you would send an email here
  // For now, we'll log the reset URL (remove in production!)
  console.log("Password reset URL:", resetUrl);

  // TODO: Send email with reset link
  // You can integrate with:
  // - Resend (https://resend.com) - Modern email API
  // - Mailgun
  // - SendGrid
  // - Cloudflare Email Workers

  // For admin account, we'll show the link directly (remove in production!)
  if (user.role === "admin") {
    return json({ 
      success: true, 
      message: "Password reset link generated.",
      // Only show this in development - REMOVE IN PRODUCTION
      resetUrl: resetUrl,
      note: "For security in production, this link should only be sent via email."
    });
  }

  return json({ 
    success: true, 
    message: "If an account exists with that email, you will receive a password reset link shortly." 
  });
}

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        {actionData?.success ? (
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-4 text-sm text-green-500">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">{actionData.message}</p>
                {actionData.resetUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-yellow-400 mb-2">{actionData.note}</p>
                    <a 
                      href={actionData.resetUrl} 
                      className="text-xs text-purple-400 hover:underline break-all"
                    >
                      {actionData.resetUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </CardContent>
        ) : (
          <Form method="post">
            <CardContent className="space-y-4">
              {actionData?.error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {actionData.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
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
        )}
      </Card>
    </div>
  );
}
