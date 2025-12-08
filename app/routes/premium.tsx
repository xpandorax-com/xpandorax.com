import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";
import { getSession, requireAuth } from "~/lib/auth";
import { createCheckout } from "~/lib/lemon-squeezy.server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Check, Crown, Sparkles, Ban, Shield, Zap } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Remove Ads - Premium - XpandoraX" },
    { name: "description", content: "Upgrade to premium and enjoy ad-free browsing on XpandoraX." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await getSession(request, context);

  // Check if already premium
  let isPremium = false;
  if (user?.isPremium) {
    isPremium = user.premiumExpiresAt
      ? new Date(user.premiumExpiresAt) > new Date()
      : true;
  }

  return json({
    user,
    isPremium,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { user } = await requireAuth(request, context);
  const env = context.cloudflare.env;

  // Create Lemon Squeezy checkout
  const checkoutUrl = await createCheckout({
    apiKey: env.LEMON_SQUEEZY_API_KEY,
    storeId: env.LEMON_SQUEEZY_STORE_ID,
    variantId: env.LEMON_SQUEEZY_VARIANT_ID,
    userId: user.id,
    userEmail: user.email,
    redirectUrl: `${env.APP_URL}/premium/success`,
  });

  return redirect(checkoutUrl);
}

const features = [
  {
    icon: Ban,
    title: "No Ads",
    description: "Browse without any banner ads or pop-unders",
  },
  {
    icon: Crown,
    title: "Premium Content",
    description: "Access exclusive premium-only videos",
  },
  {
    icon: Zap,
    title: "Faster Streaming",
    description: "Priority access to our video servers",
  },
  {
    icon: Shield,
    title: "Support Us",
    description: "Help us create more quality content",
  },
];

export default function PremiumPage() {
  const { user, isPremium } = useLoaderData<typeof loader>();

  if (isPremium) {
    return (
      <div className="container-responsive py-8 sm:py-12 px-4">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">You&apos;re Premium!</h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
            Thank you for supporting XpandoraX. Enjoy your ad-free experience and
            access to all premium content.
          </p>
          <Button asChild className="mt-4 sm:mt-6 touch-target" variant="outline">
            <a href="/">Browse Videos</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-8 sm:py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Remove Ads & Go Premium</h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-muted-foreground">
            Enjoy an ad-free experience and unlock exclusive content
          </p>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 mb-8 sm:mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-4 sm:p-6 rounded-lg border bg-card"
              >
                <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pricing Card */}
        <Card className="mx-auto max-w-md border-primary">
          <CardHeader className="text-center px-4 sm:px-6">
            <div className="mx-auto mb-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              MOST POPULAR
            </div>
            <CardTitle className="text-xl sm:text-2xl">Monthly Premium</CardTitle>
            <CardDescription className="text-sm">Cancel anytime</CardDescription>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <span className="text-4xl sm:text-5xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 sm:space-y-3 text-left text-sm sm:text-base">
              {[
                "100% ad-free browsing",
                "Access to all premium videos",
                "Priority video streaming",
                "Support content creators",
                "Cancel anytime",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 sm:gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="px-4 sm:px-6">
            {user ? (
              <Form method="post" className="w-full">
                <Button type="submit" className="w-full h-12 sm:h-11 touch-target" variant="premium" size="lg">
                  <Crown className="mr-2 h-5 w-5" />
                  Subscribe Now
                </Button>
              </Form>
            ) : (
              <Button asChild className="w-full h-12 sm:h-11 touch-target" variant="premium" size="lg">
                <a href="/login?redirect=/premium">
                  <Crown className="mr-2 h-5 w-5" />
                  Log in to Subscribe
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Trust badges */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>🔒 Secure payment powered by Lemon Squeezy</p>
          <p className="mt-1">Cancel anytime from your account settings</p>
        </div>
      </div>
    </div>
  );
}
