import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Welcome to Premium! - XpandoraX" },
  ];
};

export default function PremiumSuccessPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold">Welcome to Premium!</h1>
        
        <p className="mt-4 text-muted-foreground">
          Thank you for subscribing! Your premium access has been activated.
          You can now enjoy ad-free browsing and access to all premium content.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild variant="premium">
            <Link to="/">
              <Crown className="mr-2 h-4 w-4" />
              Start Watching
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/account">
              View Account
            </Link>
          </Button>
        </div>

        <div className="mt-8 rounded-lg border bg-card p-6 text-left">
          <h3 className="font-semibold mb-3">What&apos;s included:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              100% ad-free browsing
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Access to all premium videos
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Priority video streaming
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Cancel anytime from account settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
