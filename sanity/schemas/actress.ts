import { defineField, defineType } from "sanity";

export default defineType({
  name: "actress",
  title: "Actress / Model",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "image",
      title: "Profile Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "videoCount",
      title: "Video Count",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Auto-updated based on videos featuring this actress",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        { name: "twitter", title: "Twitter/X", type: "url" },
        { name: "instagram", title: "Instagram", type: "url" },
        { name: "onlyfans", title: "OnlyFans", type: "url" },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "videoCount",
      media: "image",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: `${subtitle || 0} videos`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Video Count",
      name: "videoCountDesc",
      by: [{ field: "videoCount", direction: "desc" }],
    },
  ],
});
