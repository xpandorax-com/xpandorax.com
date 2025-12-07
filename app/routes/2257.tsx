import type { MetaFunction } from "@remix-run/cloudflare";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Mail, FileText } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "18 U.S.C. 2257 Compliance - XpandoraX" },
    { name: "description", content: "Record-keeping requirements compliance statement." },
  ];
};

export default function Compliance2257Page() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold">18 U.S.C. 2257 Compliance Statement</h1>
      <p className="mt-2 text-muted-foreground">Record-Keeping Requirements Compliance</p>
      
      <Separator className="my-6" />

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">Exemption Statement</h2>
          <p className="text-muted-foreground mt-2">
            XpandoraX is not the primary producer (as that term is defined in 18 U.S.C. § 2257) 
            of any of the visual content contained on the website. XpandoraX limits its handling 
            of content that appears on the website to the following activities: video embedding 
            from third-party hosting services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Third-Party Content</h2>
          <p className="text-muted-foreground mt-2">
            All visual content appearing on this website is hosted by third-party services. 
            The original producers of all content appearing on this website are responsible 
            for maintaining the records required by 18 U.S.C. § 2257 with respect to such content.
          </p>
          <p className="text-muted-foreground mt-2">
            For records relating to any content appearing on this website, please contact the 
            content&apos;s original producer directly. The original producers may be identified by 
            examining any credits, watermarks, or other identifiers appearing in the content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Content Providers</h2>
          <p className="text-muted-foreground mt-2">
            All content providers warrant that:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>All individuals depicted in visual depictions of actual or simulated sexually explicit conduct were at least 18 years of age at the time of creation</li>
            <li>They have obtained valid photo identification and age verification for all performers</li>
            <li>They maintain all required records under 18 U.S.C. § 2257</li>
            <li>They have the necessary rights and licenses to distribute the content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Age Verification</h2>
          <p className="text-muted-foreground mt-2">
            XpandoraX requires all users to confirm that they are at least 18 years of age 
            (or the age of majority in their jurisdiction) before accessing the website. 
            This verification is performed through our age gate system.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Custodian of Records</h2>
          <p className="text-muted-foreground mt-2">
            As XpandoraX does not produce primary content, we do not maintain 2257 records. 
            However, for any questions regarding content or compliance, please contact:
          </p>
          <div className="mt-4 rounded-lg border bg-card p-4">
            <p className="font-medium">Compliance Department</p>
            <p className="text-muted-foreground mt-2">
              Email:{" "}
              <a href="mailto:compliance@xpandorax.com" className="text-primary hover:underline">
                compliance@xpandorax.com
              </a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Reporting Concerns</h2>
          <p className="text-muted-foreground mt-2">
            If you have any concerns about the compliance status of any content appearing on 
            our website, or believe any content may violate 18 U.S.C. § 2257, please report 
            it immediately:
          </p>
          <div className="mt-4 flex gap-4">
            <Button asChild>
              <a href="mailto:compliance@xpandorax.com">
                <Mail className="mr-2 h-4 w-4" />
                Report Content
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dmca">
                <FileText className="mr-2 h-4 w-4" />
                DMCA Policy
              </a>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Content Removal</h2>
          <p className="text-muted-foreground mt-2">
            XpandoraX takes all reports seriously and will promptly investigate and remove any 
            content that violates our policies or applicable law. Content removal requests 
            should be sent to{" "}
            <a href="mailto:compliance@xpandorax.com" className="text-primary hover:underline">
              compliance@xpandorax.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
