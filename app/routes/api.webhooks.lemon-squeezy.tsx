import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { createDatabase } from "~/db";
import { users, subscriptions } from "~/db/schema";
import { verifyWebhookSignature } from "~/lib/lemon-squeezy.server";
import { generateId } from "~/lib/utils";
import type { LemonSqueezyWebhookPayload } from "~/types";

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const db = createDatabase(env.DB);

  // Get raw body and signature
  const payload = await request.text();
  const signature = request.headers.get("x-signature") || "";

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(
    payload,
    signature,
    env.LEMON_SQUEEZY_WEBHOOK_SECRET
  );

  if (!isValid) {
    console.error("Invalid webhook signature");
    return json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(payload) as LemonSqueezyWebhookPayload;
  const eventName = data.meta.event_name;
  const userId = data.meta.custom_data?.user_id;

  console.log(`Processing webhook: ${eventName}`, { userId });

  try {
    switch (eventName) {
      case "subscription_created": {
        if (!userId) {
          console.error("No user_id in custom data");
          return json({ error: "Missing user_id" }, { status: 400 });
        }

        const { attributes } = data.data;

        // Create subscription record
        await db.insert(subscriptions).values({
          id: generateId(),
          userId,
          lemonSqueezySubscriptionId: data.data.id,
          lemonSqueezyOrderId: String(attributes.order_id),
          lemonSqueezyProductId: String(attributes.product_id),
          lemonSqueezyVariantId: String(attributes.variant_id),
          status: attributes.status as "active",
          currentPeriodEnd: attributes.renews_at
            ? new Date(attributes.renews_at)
            : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Update user premium status
        await db
          .update(users)
          .set({
            isPremium: true,
            premiumExpiresAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            lemonSqueezyCustomerId: String(attributes.customer_id),
            lemonSqueezySubscriptionId: data.data.id,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`Subscription created for user ${userId}`);
        break;
      }

      case "subscription_updated": {
        const { attributes } = data.data;
        const subscriptionId = data.data.id;

        // Find subscription by Lemon Squeezy ID
        const subscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.lemonSqueezySubscriptionId, subscriptionId),
        });

        if (!subscription) {
          console.error(`Subscription not found: ${subscriptionId}`);
          return json({ error: "Subscription not found" }, { status: 404 });
        }

        // Update subscription
        await db
          .update(subscriptions)
          .set({
            status: attributes.status,
            currentPeriodEnd: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            cancelledAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id));

        // Update user premium status based on subscription status
        const isPremium = ["active", "on_trial"].includes(attributes.status);
        await db
          .update(users)
          .set({
            isPremium,
            premiumExpiresAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : attributes.ends_at
              ? new Date(attributes.ends_at)
              : null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, subscription.userId));

        console.log(`Subscription updated: ${subscriptionId}`);
        break;
      }

      case "subscription_cancelled": {
        const subscriptionId = data.data.id;
        const { attributes } = data.data;

        // Find subscription
        const subscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.lemonSqueezySubscriptionId, subscriptionId),
        });

        if (!subscription) {
          console.error(`Subscription not found: ${subscriptionId}`);
          return json({ error: "Subscription not found" }, { status: 404 });
        }

        // Update subscription status
        await db
          .update(subscriptions)
          .set({
            status: "cancelled",
            cancelledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id));

        // User remains premium until the end of their billing period
        if (attributes.ends_at) {
          await db
            .update(users)
            .set({
              premiumExpiresAt: new Date(attributes.ends_at),
              updatedAt: new Date(),
            })
            .where(eq(users.id, subscription.userId));
        }

        console.log(`Subscription cancelled: ${subscriptionId}`);
        break;
      }

      case "subscription_expired": {
        const subscriptionId = data.data.id;

        // Find subscription
        const subscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.lemonSqueezySubscriptionId, subscriptionId),
        });

        if (!subscription) {
          console.error(`Subscription not found: ${subscriptionId}`);
          return json({ error: "Subscription not found" }, { status: 404 });
        }

        // Update subscription status
        await db
          .update(subscriptions)
          .set({
            status: "expired",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id));

        // Remove premium status
        await db
          .update(users)
          .set({
            isPremium: false,
            premiumExpiresAt: null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, subscription.userId));

        console.log(`Subscription expired: ${subscriptionId}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventName}`);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return json({ error: "Internal error" }, { status: 500 });
  }
}

// Reject GET requests
export async function loader() {
  return json({ error: "Method not allowed" }, { status: 405 });
}
