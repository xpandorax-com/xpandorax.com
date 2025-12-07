import type { CollectionConfig } from "payload";

export const Subscriptions: CollectionConfig = {
  slug: "subscriptions",
  admin: {
    useAsTitle: "lemonSqueezySubscriptionId",
    defaultColumns: ["user", "status", "currentPeriodEnd", "createdAt"],
    group: "Admin",
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      return {
        user: {
          equals: user?.id,
        },
      };
    },
    create: () => false, // Created via webhook only
    update: () => false, // Updated via webhook only
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
    },
    {
      name: "lemonSqueezySubscriptionId",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "lemonSqueezyCustomerId",
      type: "text",
      required: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "Active", value: "active" },
        { label: "Paused", value: "paused" },
        { label: "Past Due", value: "past_due" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Expired", value: "expired" },
        { label: "Unpaid", value: "unpaid" },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: "planId",
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "variantId",
      type: "text",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "currentPeriodStart",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "currentPeriodEnd",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "cancelledAt",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
};
