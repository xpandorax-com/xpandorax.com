// Video schema for XpandoraX
export default {
  name: 'video',
  title: 'Videos',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'mainServerUrl',
      title: 'Main Server URL (Premium - B2 + CDN)',
      type: 'url',
      description: 'Premium ad-free video from Backblaze B2 + Cloudflare CDN. Format: https://cdn.xpandorax.com/videos/filename.mp4. Only available to premium subscribers. No ads, globally cached.',
    },
    {
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
    },
    {
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
    },
    {
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Video duration in seconds',
    },
    {
      name: 'isFeatured',
      title: 'Featured Video',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle ON to show this video on the website',
    },
    {
      name: 'actress',
      title: 'Main Model',
      type: 'reference',
      to: [{ type: 'actress' }],
    },
    {
      name: 'producer',
      title: 'Producer',
      type: 'reference',
      to: [{ type: 'producer' }],
      description: 'The producer/studio that released this video',
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      isFeatured: 'isFeatured',
    },
    prepare(selection) {
      const { title, media, isFeatured } = selection;
      return {
        title: `${isFeatured ? '⭐ ' : ''}${title}`,
        media,
      };
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
};
