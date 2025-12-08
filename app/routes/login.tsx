import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useActionData, Form, Link, useNavigation } from "@remix-run/react";
import {
  getSession,
  verifyPassword,
  createLucia,
  createSessionCookie,
  getUserByEmail,
} from "~/lib/auth";
import { loginSchema } from "~/lib/validations";
import { createDatabase } from "~/db";
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
import { AlertCircle, Loader2, LogIn } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Log In - XpandoraX" },
    { name: "description", content: "Log in to your XpandoraX account." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const { user } = await getSession(request, context);
    if (user) {
      return redirect("/");
    }
    return json({});
  } catch (error) {
    console.error("Login loader error:", error);
    return json({});
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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

  // Verify password
  const validPassword = await verifyPassword(user.hashedPassword, password);
  if (!validPassword) {
    return json(
      { error: "Invalid email or password" },
      { status: 400 }
    );
  }

  // Create session
  const lucia = createLucia(db);
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = createSessionCookie(lucia, session.id);

  // Redirect to home
  return redirect("/", {
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
    <div className="container-responsive flex min-h-[calc(100vh-8rem)] items-center justify-center py-4 sm:py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-sm">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Form method="post">
          <CardContent className="space-y-4 px-4 sm:px-6">
            {actionData?.error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{actionData.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isSubmitting}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isSubmitting}
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-4 sm:px-6">
            <Button type="submit" className="w-full h-12 sm:h-10 touch-target" disabled={isSubmitting}>
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
              <Link to="/register" className="text-primary hover:underline touch-manipulation">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
