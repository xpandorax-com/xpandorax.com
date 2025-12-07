import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Shield, Users, Video, Crown, Globe, Heart } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "About Us - XpandoraX" },
    { name: "description", content: "Learn more about XpandoraX and our mission." },
  ];
};

export default function AboutPage() {
  const stats = [
    { label: "Videos", value: "10,000+", icon: Video },
    { label: "Categories", value: "100+", icon: Globe },
    { label: "Models", value: "1,000+", icon: Users },
    { label: "Happy Users", value: "50,000+", icon: Heart },
  ];

  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          About XpandoraX
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Your premier destination for premium video content. We&apos;re dedicated to providing 
          a safe, enjoyable, and high-quality viewing experience.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-8" />

      <div className="space-y-8">
        {/* Our Mission */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            XpandoraX was founded with a simple mission: to create the best video directory 
            platform on the internet. We believe in providing a seamless, user-friendly 
            experience that allows our users to discover and enjoy content easily.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We work with content creators and hosting platforms to bring you a curated 
            selection of high-quality videos, all accessible from one convenient location.
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Vast Video Library</CardTitle>
                <CardDescription>
                  Thousands of videos across hundreds of categories, updated daily with 
                  fresh content.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Model Profiles</CardTitle>
                <CardDescription>
                  Browse detailed profiles of your favorite models and discover their 
                  complete video collections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Crown className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Premium Experience</CardTitle>
                <CardDescription>
                  Upgrade to premium for an ad-free experience and access to exclusive 
                  content.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Safe & Secure</CardTitle>
                <CardDescription>
                  We prioritize user privacy and security with encrypted connections and 
                  strict data protection.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Content Policy */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Content Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on XpandoraX is hosted by third-party services. We do not host 
            any videos directly. We are committed to complying with all applicable laws 
            and regulations, including DMCA takedown procedures and 18 U.S.C. 2257 
            record-keeping requirements.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We have a zero-tolerance policy for illegal content. If you encounter any 
            content that violates our policies, please report it immediately through 
            our contact page.
          </p>
        </section>

        {/* Age Verification */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Age Verification</h2>
          <p className="text-muted-foreground leading-relaxed">
            XpandoraX is intended only for adults 18 years of age or older. By using 
            our website, you confirm that you meet this age requirement. We implement 
            an age verification gate to ensure compliance with this policy.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
          <p className="text-muted-foreground mb-6">
            Create a free account to save favorites, track your viewing history, and more.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/register">Create Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/premium">
                <Crown className="mr-2 h-4 w-4" />
                Go Premium
              </Link>
            </Button>
          </div>
        </section>

        {/* Legal Links */}
        <section className="text-center border-t pt-8">
          <p className="text-sm text-muted-foreground">
            For more information, please review our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            ,{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            ,{" "}
            <Link to="/dmca" className="text-primary hover:underline">
              DMCA Policy
            </Link>
            , and{" "}
            <Link to="/2257" className="text-primary hover:underline">
              2257 Compliance
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
