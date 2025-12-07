"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";

const AGE_VERIFIED_KEY = "xpandorax_age_verified";

export function AgeGateModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already verified age
    const verified = localStorage.getItem(AGE_VERIFIED_KEY);
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    setIsOpen(false);
  };

  const handleDeny = () => {
    // Redirect to a safe site
    window.location.href = "https://www.google.com";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Age Verification Required
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This website contains adult content that is only suitable for
            individuals who are 18 years of age or older. By entering this site,
            you confirm that you are at least 18 years old and agree to our{" "}
            <a href="/terms" className="text-primary underline">
              Terms of Service
            </a>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full bg-primary hover:bg-primary/90"
          >
            I am 18 or older - Enter
          </AlertDialogAction>
          <button
            onClick={handleDeny}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            I am under 18 - Exit
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
