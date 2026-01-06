import type { MetaFunction } from "@remix-run/cloudflare";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms of Service - XpandoraX" },
    { name: "description", content: "Read our terms of service and conditions of use." },
  ];
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-muted-foreground">Last updated: December 8, 2025</p>
      
      <Separator className="my-6" />

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mt-2">
            By accessing and using XpandoraX (&quot;the Service&quot;), you accept and agree to be bound 
            by these Terms of Service. If you do not agree to these terms, please do not use 
            our Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Age Requirement</h2>
          <p className="text-muted-foreground mt-2">
            You must be at least 18 years of age (or the age of majority in your jurisdiction, 
            whichever is greater) to access this website. By using this website, you represent 
            and warrant that you meet this age requirement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. User Accounts</h2>
          <p className="text-muted-foreground mt-2">
            When you create an account with us, you must provide accurate, complete, and current 
            information. You are responsible for safeguarding your password and for any activities 
            or actions under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
          <p className="text-muted-foreground mt-2">You agree not to:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Upload or transmit viruses or malicious code</li>
            <li>Collect or harvest user information without consent</li>
            <li>Reproduce, duplicate, copy, sell, or resell any portion of the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Content</h2>
          <p className="text-muted-foreground mt-2">
            All content on this website is provided for entertainment purposes only. We do not 
            claim ownership of third-party content. All videos are hosted by third-party services 
            and are embedded on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
          <p className="text-muted-foreground mt-2">
            The Service and its original content, features, and functionality are owned by 
            XpandoraX and are protected by international copyright, trademark, patent, trade 
            secret, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground mt-2">
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any 
            kind, either express or implied. We do not warrant that the Service will be 
            uninterrupted, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
          <p className="text-muted-foreground mt-2">
            In no event shall XpandoraX be liable for any indirect, incidental, special, 
            consequential, or punitive damages resulting from your use of or inability to 
            use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
          <p className="text-muted-foreground mt-2">
            We reserve the right to modify or replace these terms at any time. We will provide 
            notice of any material changes by posting the new Terms on this page with an updated 
            revision date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Contact</h2>
          <p className="text-muted-foreground mt-2">
            If you have any questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@xpandorax.com" className="text-primary hover:underline">
              legal@xpandorax.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
