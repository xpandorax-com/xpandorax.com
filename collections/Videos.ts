import type { CollectionConfig } from "payload";

export const Videos: CollectionConfig = {
  slug: "videos",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "isPremium", "views", "createdAt"],
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
      name: "title",
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
      admin: {
        description: "URL-friendly identifier (auto-generated from title if empty)",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
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
      name: "description",
      type: "textarea",
    },
    {
      name: "thumbnail",
      type: "text",
      required: true,
      admin: {
        description: "URL to the video thumbnail image",
      },
    },
    {
      name: "abyssEmbed",
      type: "text",
      required: true,
      admin: {
        description: "Abyss.to embed URL (e.g., https://abyss.to/embed/abc123)",
      },
    },
    {
      name: "duration",
      type: "number",
      admin: {
        description: "Duration in seconds",
      },
    },
    {
      name: "views",
      type: "number",
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "isPremium",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Only premium users can watch this video",
      },
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: {
        description: "Select categories for this video",
      },
    },
    {
      name: "actresses",
      type: "relationship",
      relationTo: "actresses",
      hasMany: true,
      admin: {
        description: "Select models featured in this video",
      },
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        description: "Leave empty to publish immediately",
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update actress video counts when video is created
        if (operation === "create" && doc.actresses?.length) {
          // This would need to be implemented based on your needs
        }
      },
    ],
  },
};
