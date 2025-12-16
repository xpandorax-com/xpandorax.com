import React from 'react';
import { B2ImageArrayInput } from '../components/B2ImageArrayInput';
import { defineType, defineField, type ArrayOfObjectsInputProps } from 'sanity';

// Picture schema for XpandoraX - Standalone pictures not tied to models
export default defineType({
  name: 'picture',
  title: 'Pictures',
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
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Small preview image (stored in Sanity CDN for fast loading)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Full Images (B2 + CDN)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'url',
              title: 'Image URL',
              type: 'url',
              description: 'CDN URL from Backblaze B2 (https://cdn.xpandorax.com/...)',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
          ],
          preview: {
            select: {
              url: 'url',
              caption: 'caption',
            },
          },
        },
      ],
      description: 'Full-size images uploaded to Backblaze B2 and served via Cloudflare CDN for global edge caching',
      components: {
        input: B2ImageArrayInput as unknown as React.ComponentType<ArrayOfObjectsInputProps>,
      },
    }),
    defineField({
      name: 'actress',
      title: 'Model',
      type: 'reference',
      to: [{ type: 'actress' }],
      description: 'The model featured in this picture',
    }),
    defineField({
      name: 'producer',
      title: 'Producer',
      type: 'reference',
      to: [{ type: 'producer' }],
      description: 'The producer/studio that released this picture',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle ON to show this picture on the website',
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
      images: 'images',
      actressName: 'actress.name',
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
