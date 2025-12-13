import { useRouteError, isRouteErrorResponse, Link } from "@remix-run/react";
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  showRefresh?: boolean;
  showHome?: boolean;
  showBack?: boolean;
}

export function ErrorPage({
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try again.",
  statusCode,
  showRefresh = true,
  showHome = true,
  showBack = true,
}: ErrorPageProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        {/* Status Code */}
        {statusCode && (
          <p className="mb-2 text-6xl font-bold text-muted-foreground">
            {statusCode}
          </p>
        )}

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold">{title}</h1>

        {/* Message */}
        <p className="mb-8 text-muted-foreground">{message}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {showBack && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
          {showRefresh && (
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHome && (
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    let title: string;
    let message: string;

    switch (error.status) {
      case 400:
        title = "Bad Request";
        message = "The request was invalid. Please check your input and try again.";
        break;
      case 401:
        title = "Unauthorized";
        message = "You need to be logged in to access this page.";
        break;
      case 403:
        title = "Forbidden";
        message = "You don't have permission to access this page.";
        break;
      case 404:
        title = "Page Not Found";
        message = "The page you're looking for doesn't exist or has been moved.";
        break;
      case 500:
        title = "Server Error";
        message = "Something went wrong on our end. Please try again later.";
        break;
      default:
        title = `Error ${error.status}`;
        message = error.statusText || "An unexpected error occurred.";
    }

    return (
      <ErrorPage
        title={title}
        message={message}
        statusCode={error.status}
      />
    );
  }

  // Handle non-Response errors
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <ErrorPage
      title="Something went wrong"
      message={errorMessage}
    />
  );
}

// Not found component for 404 pages
export function NotFound({ resource = "Page" }: { resource?: string }) {
  return (
    <ErrorPage
      title={`${resource} Not Found`}
      message={`The ${resource.toLowerCase()} you're looking for doesn't exist or has been removed.`}
      statusCode={404}
      showRefresh={false}
    />
  );
}

// Loading error component
export function LoadingError() {
  return (
    <ErrorPage
      title="Failed to Load"
      message="We couldn't load the content. Please check your connection and try again."
      showBack={false}
    />
  );
}
