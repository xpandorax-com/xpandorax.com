import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "username", "isPremium", "createdAt"],
    group: "Admin",
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      return {
        id: {
          equals: user?.id,
        },
      };
    },
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "username",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "role",
      type: "select",
      defaultValue: "user",
      options: [
        { label: "User", value: "user" },
        { label: "Admin", value: "admin" },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === "admin",
      },
    },
    {
      name: "isPremium",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether the user has an active premium subscription",
      },
    },
    {
      name: "premiumExpiresAt",
      type: "date",
      admin: {
        description: "When the premium subscription expires",
      },
    },
    {
      name: "lemonSqueezyCustomerId",
      type: "text",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "lemonSqueezySubscriptionId",
      type: "text",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "ageVerified",
      type: "checkbox",
      defaultValue: false,
    },
  ],
  timestamps: true,
};
