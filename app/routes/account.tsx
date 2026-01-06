import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { User, Mail } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Account - XpandoraX" },
    { name: "description", content: "Manage your XpandoraX account." },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { user } = await requireAuth(request, context);

  return json({
    user,
  });
}

export default function AccountPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="container-responsive py-4 sm:py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Account Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your account</p>
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
      </div>
    </div>
  );
}
