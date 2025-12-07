import type { MetaFunction } from "@remix-run/cloudflare";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Mail, AlertTriangle } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "DMCA Policy - XpandoraX" },
    { name: "description", content: "Our Digital Millennium Copyright Act policy and takedown procedures." },
  ];
};

export default function DmcaPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold">DMCA Policy</h1>
      <p className="mt-2 text-muted-foreground">Digital Millennium Copyright Act Compliance</p>
      
      <Separator className="my-6" />

      <div className="mb-8 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-500">Important Notice</h3>
            <p className="text-sm text-muted-foreground mt-1">
              XpandoraX respects the intellectual property rights of others. All videos displayed 
              on this website are hosted by third-party services and are only embedded here.
            </p>
          </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Overview</h2>
          <p className="text-muted-foreground mt-2">
            XpandoraX complies with the Digital Millennium Copyright Act (DMCA) and responds 
            promptly to properly submitted takedown notices. We do not host any video content 
            directly - all videos are embedded from third-party hosting services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Filing a DMCA Notice</h2>
          <p className="text-muted-foreground mt-2">
            If you believe that your copyrighted work has been copied and is accessible on this 
            website in a way that constitutes copyright infringement, please provide our DMCA 
            Agent with the following information:
          </p>
          <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-2">
            <li>
              A physical or electronic signature of the copyright owner or a person authorized 
              to act on their behalf
            </li>
            <li>
              Identification of the copyrighted work claimed to have been infringed
            </li>
            <li>
              Identification of the material that is claimed to be infringing, including the 
              URL or other specific location on our website
            </li>
            <li>
              Your contact information, including your address, telephone number, and email address
            </li>
            <li>
              A statement that you have a good faith belief that the disputed use is not authorized 
              by the copyright owner, its agent, or the law
            </li>
            <li>
              A statement, made under penalty of perjury, that the information in the notice is 
              accurate and that you are the copyright owner or are authorized to act on the 
              copyright owner&apos;s behalf
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Submit Your DMCA Notice</h2>
          <p className="text-muted-foreground mt-2">
            Please send your properly formatted DMCA takedown notice to:
          </p>
          <div className="mt-4 rounded-lg border bg-card p-4">
            <p className="font-medium">DMCA Agent</p>
            <p className="text-muted-foreground mt-2">
              Email:{" "}
              <a href="mailto:dmca@xpandorax.com" className="text-primary hover:underline">
                dmca@xpandorax.com
              </a>
            </p>
          </div>
          <Button asChild className="mt-4">
            <a href="mailto:dmca@xpandorax.com">
              <Mail className="mr-2 h-4 w-4" />
              Send DMCA Notice
            </a>
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Response Time</h2>
          <p className="text-muted-foreground mt-2">
            Upon receiving a valid DMCA takedown notice, we will:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Remove or disable access to the allegedly infringing material within 24-48 hours</li>
            <li>Notify the third-party video host of the claim</li>
            <li>Take reasonable steps to notify the user who posted the content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Counter-Notification</h2>
          <p className="text-muted-foreground mt-2">
            If you believe that your content was removed by mistake or misidentification, you may 
            file a counter-notification with the following information:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Your physical or electronic signature</li>
            <li>Identification of the removed material and its previous location</li>
            <li>
              A statement under penalty of perjury that you have a good faith belief the material 
              was removed by mistake or misidentification
            </li>
            <li>Your name, address, and telephone number</li>
            <li>
              Consent to the jurisdiction of the federal court in your district and that you will 
              accept service of process from the complainant
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Repeat Infringers</h2>
          <p className="text-muted-foreground mt-2">
            XpandoraX has a policy to terminate the accounts of users who are repeat copyright 
            infringers in appropriate circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. False Claims</h2>
          <p className="text-muted-foreground mt-2">
            Please be aware that under Section 512(f) of the DMCA, any person who knowingly 
            materially misrepresents that material is infringing may be subject to liability 
            for damages, including costs and attorneys&apos; fees.
          </p>
        </section>
      </div>
    </div>
  );
}
