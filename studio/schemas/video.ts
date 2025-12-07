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
      name: 'abyssEmbed',
      title: 'Abyss Embed URL',
      type: 'url',
      description: 'e.g., https://abyss.to/embed/abc123',
      validation: (Rule) => Rule.required(),
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
