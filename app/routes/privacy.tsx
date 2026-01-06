import type { MetaFunction } from "@remix-run/cloudflare";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - XpandoraX" },
    { name: "description", content: "Learn how we collect, use, and protect your personal information." },
  ];
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: December 8, 2025</p>
      
      <Separator className="my-6" />

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p className="text-muted-foreground mt-2">
            XpandoraX (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <h3 className="text-lg font-medium mt-4">Personal Information</h3>
          <p className="text-muted-foreground mt-2">
            When you register for an account, we may collect:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Email address</li>
            <li>Username</li>
            <li>Password (encrypted)</li>
            <li>Payment information (processed by third-party providers)</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">Automatically Collected Information</h3>
          <p className="text-muted-foreground mt-2">
            When you visit our website, we automatically collect:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited and time spent</li>
            <li>Referring website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <p className="text-muted-foreground mt-2">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Provide and maintain our Service</li>
            <li>Send administrative information</li>
            <li>Respond to inquiries and support requests</li>
            <li>Improve our website and services</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Cookies and Tracking</h2>
          <p className="text-muted-foreground mt-2">
            We use cookies and similar tracking technologies to track activity on our website. 
            Cookies are small data files stored on your device. You can instruct your browser 
            to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          <p className="text-muted-foreground mt-2">
            We use the following types of cookies:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Essential cookies:</strong> Required for website functionality</li>
            <li><strong>Session cookies:</strong> To maintain your login session</li>
            <li><strong>Analytics cookies:</strong> To understand how visitors use our site</li>
            <li><strong>Advertising cookies:</strong> To display relevant advertisements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Third-Party Services</h2>
          <p className="text-muted-foreground mt-2">
            We may employ third-party companies and services to facilitate our Service:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li><strong>Video Hosting:</strong> Videos are hosted by third-party services</li>
            <li><strong>Advertising:</strong> ExoClick and JuicyAds for ad-supported content</li>
            <li><strong>Analytics:</strong> To monitor and analyze website usage</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            These third parties have access to your information only to perform specific tasks 
            on our behalf and are obligated not to disclose or use it for other purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Data Security</h2>
          <p className="text-muted-foreground mt-2">
            We implement appropriate technical and organizational measures to protect your 
            personal information. However, no method of transmission over the Internet or 
            electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Data Retention</h2>
          <p className="text-muted-foreground mt-2">
            We retain your personal information only for as long as necessary to fulfill the 
            purposes outlined in this Privacy Policy, unless a longer retention period is 
            required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Your Rights</h2>
          <p className="text-muted-foreground mt-2">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            To exercise these rights, please contact us at{" "}
            <a href="mailto:privacy@xpandorax.com" className="text-primary hover:underline">
              privacy@xpandorax.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">9. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground mt-2">
            Our Service is not intended for anyone under the age of 18. We do not knowingly 
            collect personal information from children. If you are a parent or guardian and 
            believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
          <p className="text-muted-foreground mt-2">
            We may update our Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the 
            &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">11. Contact Us</h2>
          <p className="text-muted-foreground mt-2">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@xpandorax.com" className="text-primary hover:underline">
              privacy@xpandorax.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
