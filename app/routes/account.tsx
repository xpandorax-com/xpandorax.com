import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";
import { eq } from "drizzle-orm";
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
  const { user } = await requireAuth(request, context);
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
    <div className="container-responsive py-4 sm:py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Account Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account and subscription</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{user.username}</p>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Crown className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your premium subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base">Status</span>
                  <Badge variant="premium">Premium Active</Badge>
                </div>

                {subscription && (
                  <>
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0">
                      <span className="text-sm text-muted-foreground">Current period ends</span>
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        {subscription.currentPeriodEnd
                          ? formatDate(subscription.currentPeriodEnd)
                          : "N/A"}
                      </span>
                    </div>

                    {subscription.status === "cancelled" && (
                      <div className="rounded-lg bg-yellow-500/10 p-3 sm:p-4 text-sm">
                        <p className="flex items-center gap-2 font-medium text-yellow-600">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          Subscription Cancelled
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
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
                      <Button variant="outline" className="w-full touch-target">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[95vw] sm:max-w-lg mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg sm:text-xl">Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          Are you sure you want to cancel your premium subscription?
                          You&apos;ll continue to have access until the end of your
                          current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="w-full sm:w-auto touch-target">Keep Subscription</AlertDialogCancel>
                        <Form method="post" className="w-full sm:w-auto">
                          <input type="hidden" name="_action" value="cancel_subscription" />
                          <AlertDialogAction type="submit" className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-target">
                            Yes, Cancel
                          </AlertDialogAction>
                        </Form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            ) : (
              <div className="text-center py-4 sm:py-6">
                <Crown className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                <h3 className="mt-3 sm:mt-4 font-semibold text-sm sm:text-base">Not a Premium Member</h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                  Upgrade to premium for ad-free browsing and exclusive content.
                </p>
                <Button asChild className="mt-3 sm:mt-4 touch-target" variant="premium">
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
