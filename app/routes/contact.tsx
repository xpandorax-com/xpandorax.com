import type { MetaFunction, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Mail, MessageSquare, Send, CheckCircle, HelpCircle, Flag, Shield } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Contact Us - XpandoraX" },
    { name: "description", content: "Get in touch with our support team." },
  ];
};

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const result = contactSchema.safeParse(data);
  if (!result.success) {
    return json(
      { success: false, errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // In production, you would send this to an email service or save to database
  // For now, we'll just simulate success
  console.log("Contact form submission:", result.data);

  return json({ success: true, message: "Your message has been sent successfully!" });
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Type guard to check if actionData has errors
  const hasErrors = actionData && 'errors' in actionData;
  const errors = hasErrors ? actionData.errors : null;

  return (
    <div className="container-responsive max-w-6xl py-4 sm:py-8 px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Contact Us</h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Have a question or concern? We&apos;re here to help.
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="h-5 w-5" />
                Send us a Message
              </CardTitle>
              <CardDescription className="text-sm">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {actionData?.success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold">Message Sent!</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Thank you for contacting us. We&apos;ll respond to your inquiry within 24-48 hours.
                  </p>
                  <Button asChild className="mt-4 touch-target">
                    <a href="/">Return to Homepage</a>
                  </Button>
                </div>
              ) : (
                <Form method="post" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                      {errors?.name && (
                        <p className="text-sm text-destructive">{errors.name[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="h-12 sm:h-10 text-base sm:text-sm"
                      />
                      {errors?.email && (
                        <p className="text-sm text-destructive">{errors.email[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help you?"
                      required
                      className="h-12 sm:h-10 text-base sm:text-sm"
                    />
                    {errors?.subject && (
                      <p className="text-sm text-destructive">{errors.subject[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="Please describe your question or concern in detail..."
                      required
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-3 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors?.message && (
                      <p className="text-sm text-destructive">{errors.message[0]}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-12 sm:h-10 touch-target" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Quick Contact */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Mail className="h-5 w-5" />
                Quick Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div>
                <p className="text-sm font-medium">General Inquiries</p>
                <a
                  href="mailto:support@xpandorax.com"
                  className="text-sm text-primary hover:underline touch-manipulation"
                >
                  support@xpandorax.com
                </a>
              </div>
              <div>
                <p className="text-sm font-medium">DMCA / Copyright</p>
                <a
                  href="mailto:dmca@xpandorax.com"
                  className="text-sm text-primary hover:underline touch-manipulation"
                >
                  dmca@xpandorax.com
                </a>
              </div>
              <div>
                <p className="text-sm font-medium">Business Inquiries</p>
                <a
                  href="mailto:business@xpandorax.com"
                  className="text-sm text-primary hover:underline touch-manipulation"
                >
                  business@xpandorax.com
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Help Topics */}
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <HelpCircle className="h-5 w-5" />
                Common Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 sm:px-6">
              <a
                href="/dmca"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary py-1 touch-manipulation"
              >
                <Flag className="h-4 w-4" />
                Report Copyright Issue
              </a>
              <a
                href="/privacy"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary py-1 touch-manipulation"
              >
                <Shield className="h-4 w-4" />
                Privacy Concerns
              </a>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Response Time:</strong><br />
                We typically respond to all inquiries within 24-48 business hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
