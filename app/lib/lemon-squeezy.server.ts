import type { LemonSqueezyCheckoutResponse } from "~/types";

const LEMON_SQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";

interface CreateCheckoutParams {
  apiKey: string;
  storeId: string;
  variantId: string;
  userId: string;
  userEmail: string;
  redirectUrl: string;
}

export async function createCheckout(
  params: CreateCheckoutParams
): Promise<string> {
  const { apiKey, storeId, variantId, userId, userEmail, redirectUrl } = params;

  const response = await fetch(`${LEMON_SQUEEZY_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
            },
          },
          checkout_options: {
            dark: true,
            success_url: redirectUrl,
            button_color: "#7c3aed", // Purple color matching our theme
          },
          product_options: {
            enabled_variants: [parseInt(variantId)],
            redirect_url: redirectUrl,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Lemon Squeezy checkout error:", error);
    throw new Error("Failed to create checkout");
  }

  const data = (await response.json()) as LemonSqueezyCheckoutResponse;
  return data.data.attributes.url;
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}

export async function cancelSubscription(
  apiKey: string,
  subscriptionId: string
): Promise<void> {
  const response = await fetch(
    `${LEMON_SQUEEZY_API_URL}/subscriptions/${subscriptionId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Lemon Squeezy cancel error:", error);
    throw new Error("Failed to cancel subscription");
  }
}

export async function getSubscription(
  apiKey: string,
  subscriptionId: string
): Promise<{
  status: string;
  renewsAt: string | null;
  endsAt: string | null;
}> {
  const response = await fetch(
    `${LEMON_SQUEEZY_API_URL}/subscriptions/${subscriptionId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get subscription");
  }

  const data = await response.json();
  return {
    status: data.data.attributes.status,
    renewsAt: data.data.attributes.renews_at,
    endsAt: data.data.attributes.ends_at,
  };
}
