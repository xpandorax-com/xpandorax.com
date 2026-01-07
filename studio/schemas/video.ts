// Video schema for XpandoraX
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'video',
  title: 'Videos',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'abyssEmbed',
      title: 'Primary Embed URL',
      type: 'url',
      description: 'Main video embed URL (e.g., https://short.icu/abc123)',
    }),
    defineField({
      name: 'servers',
      title: 'Additional Servers',
      type: 'array',
      description: 'Add backup/alternative video servers',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Server Name',
              type: 'string',
              description: 'e.g., Server 2, DoodStream, Filemoon',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'Embed URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'url',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'downloadLinks',
      title: 'Download Links',
      type: 'array',
      description: 'Add download links for the video',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Link Name',
              type: 'string',
              description: 'e.g., 720p, 1080p, 4K, Download Server 1',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'Download URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'url',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Video duration in seconds',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Video',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle ON to show this video on the website',
    }),
    defineField({
      name: 'actress',
      title: 'Main Model',
      type: 'reference',
      to: [{ type: 'actress' }],
    }),
    defineField({
      name: 'producer',
      title: 'Producer',
      type: 'reference',
      to: [{ type: 'producer' }],
      description: 'The producer/studio that released this video',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      isFeatured: 'isFeatured',
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
