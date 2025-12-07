import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { subscriptions } from "~/db/schema";
import { requireAuth } from "~/lib/auth";
import { cancelSubscription } from "~/lib/lemon-squeezy.server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Crown, User, Mail, Calendar, AlertTriangle } from "lucide-react";
import { formatDate } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "Account - XpandoraX" },
    { name: "description", content: "Manage your XpandoraX account." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user, db } = await requireAuth(request, context);

  // Fetch subscription if premium
  let subscription = null;
  if (user.lemonSqueezySubscriptionId) {
    subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.lemonSqueezySubscriptionId, user.lemonSqueezySubscriptionId),
    });
  }

  // Check premium status
  let isPremium = false;
  if (user.isPremium) {
    isPremium = user.premiumExpiresAt
      ? new Date(user.premiumExpiresAt) > new Date()
      : true;
  }

  return json({
    user,
    subscription,
    isPremium,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { user, db } = await requireAuth(request, context);
  const env = context.cloudflare.env;
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "cancel_subscription") {
    if (!user.lemonSqueezySubscriptionId) {
      return json({ error: "No subscription found" }, { status: 400 });
    }

    try {
      await cancelSubscription(env.LEMON_SQUEEZY_API_KEY, user.lemonSqueezySubscriptionId);
      return json({ success: true, message: "Subscription cancelled" });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return json({ error: "Failed to cancel subscription" }, { status: 500 });
    }
  }

  return json({ error: "Unknown action" }, { status: 400 });
}

export default function AccountPage() {
  const { user, subscription, isPremium } = useLoaderData<typeof loader>();

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account and subscription</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>
              Manage your premium subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge variant="premium">Premium Active</Badge>
                </div>

                {subscription && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current period ends</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {subscription.currentPeriodEnd
                          ? formatDate(subscription.currentPeriodEnd)
                          : "N/A"}
                      </span>
                    </div>

                    {subscription.status === "cancelled" && (
                      <div className="rounded-lg bg-yellow-500/10 p-4 text-sm">
                        <p className="flex items-center gap-2 font-medium text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          Subscription Cancelled
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          Your premium access will end on{" "}
                          {subscription.currentPeriodEnd
                            ? formatDate(subscription.currentPeriodEnd)
                            : "your billing date"}
                          .
                        </p>
                      </div>
                    )}

                    {subscription.status === "active" && (
                      <Separator />
                    )}
                  </>
                )}

                {subscription?.status === "active" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your premium subscription?
                          You&apos;ll continue to have access until the end of your
                          current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <Form method="post">
                          <input type="hidden" name="_action" value="cancel_subscription" />
                          <AlertDialogAction type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, Cancel
                          </AlertDialogAction>
                        </Form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <Crown className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Not a Premium Member</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upgrade to premium for ad-free browsing and exclusive content.
                </p>
                <Button asChild className="mt-4" variant="premium">
                  <a href="/premium">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
