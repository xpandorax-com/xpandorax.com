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
      name: 'previewVideo',
      title: 'Preview Video',
      type: 'file',
      description: 'Short preview video (10-30 seconds, fast-forward style). Will play when user clicks the video card.',
      options: {
        accept: 'video/*',
      },
    },
    {
      name: 'abyssEmbed',
      title: 'Primary Embed URL',
      type: 'url',
      description: 'Main video embed URL (e.g., https://short.icu/abc123)',
      validation: (Rule) => Rule.required(),
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
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Video duration in seconds',
    },
    {
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'isPremium',
      title: 'Premium Only',
      type: 'boolean',
      initialValue: false,
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
      isPremium: 'isPremium',
    },
    prepare(selection) {
      const { title, media, isPremium } = selection;
      return {
        title: `${isPremium ? '👑 ' : ''}${title}`,
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
      title: 'Views, High to Low',
      name: 'viewsDesc',
      by: [{ field: 'views', direction: 'desc' }],
    },
  ],
};
