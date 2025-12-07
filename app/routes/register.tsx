import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useActionData, Form, Link } from "@remix-run/react";
import { createDatabase } from "~/db";
import {
  getSession,
  createUser,
  createLucia,
  createSessionCookie,
  getUserByEmail,
  getUserByUsername,
} from "~/lib/auth";
import { registerSchema } from "~/lib/validations";
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
import { AlertCircle, UserPlus } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign Up - XpandoraX" },
    { name: "description", content: "Create your XpandoraX account." },
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
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate input
  const result = registerSchema.safeParse({
    email,
    username,
    password,
    confirmPassword,
  });
  if (!result.success) {
    return json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const db = createDatabase(context.cloudflare.env.DB);

  // Check if email already exists
  const existingEmail = await getUserByEmail(db, email);
  if (existingEmail) {
    return json(
      { error: "An account with this email already exists" },
      { status: 400 }
    );
  }

  // Check if username already exists
  const existingUsername = await getUserByUsername(db, username);
  if (existingUsername) {
    return json(
      { error: "This username is already taken" },
      { status: 400 }
    );
  }

  // Create user
  const user = await createUser(db, { email, username, password });

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

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to create your account
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                required
                autoComplete="username"
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
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Create account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
