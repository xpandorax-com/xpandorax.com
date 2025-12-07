import type { CollectionConfig } from "payload";

export const Actresses: CollectionConfig = {
  slug: "actresses",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "videoCount", "createdAt"],
    group: "Content",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "image",
      type: "text",
      admin: {
        description: "URL to the model's profile image",
      },
    },
    {
      name: "bio",
      type: "textarea",
      admin: {
        description: "Brief biography or description",
      },
    },
    {
      name: "videoCount",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: "Number of videos featuring this model (auto-calculated)",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Show this model on the homepage",
      },
    },
    {
      name: "socialLinks",
      type: "group",
      fields: [
        {
          name: "twitter",
          type: "text",
        },
        {
          name: "instagram",
          type: "text",
        },
        {
          name: "onlyfans",
          type: "text",
        },
      ],
    },
  ],
  timestamps: true,
};
