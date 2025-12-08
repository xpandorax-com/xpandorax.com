// Picture schema for XpandoraX - Standalone pictures not tied to models
export default {
  name: 'picture',
  title: 'Pictures',
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
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Thumbnail image displayed in picture listings (stored in Sanity CDN)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'r2ImageUrl',
      title: 'Full Image URL (R2)',
      type: 'url',
      description: 'URL of the full-size image stored in Cloudflare R2. Use the upload API at /api/upload-picture to get this URL.',
    },
    {
      name: 'actress',
      title: 'Model',
      type: 'reference',
      to: [{ type: 'actress' }],
      description: 'The model featured in this picture',
    },
    {
      name: 'producer',
      title: 'Producer',
      type: 'reference',
      to: [{ type: 'producer' }],
      description: 'The producer/studio that released this picture',
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    },
    {
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle ON to show this picture on the website',
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
      actressName: 'actress.name',
    },
    prepare(selection) {
      const { title, media, actressName } = selection;
      return {
        title,
        subtitle: actressName ? `Model: ${actressName}` : '',
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
