import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import {
  getSession,
  verifyPassword,
  createLucia,
  createSessionCookie,
  getUserByEmail,
} from "~/lib/auth";
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
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Log In - XpandoraX" },
    { name: "description", content: "Log in to your XpandoraX account." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await getSession(request, context);

  if (user) {
    return redirect("/");
  }

  return json({});
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

  return redirect("/", {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

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
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Log in
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
