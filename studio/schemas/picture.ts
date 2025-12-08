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
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
              description: 'Optional caption for this image',
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Alternative text for accessibility',
            },
          ],
        },
      ],
      description: 'Upload one or more images. The first image will be used as the thumbnail.',
      validation: (Rule) => Rule.required().min(1).error('At least one image is required'),
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
      images: 'images',
      actressName: 'actress.name',
    },
    prepare(selection) {
      const { title, images, actressName } = selection;
      const imageCount = images?.length || 0;
      return {
        title,
        subtitle: `${imageCount} image${imageCount !== 1 ? 's' : ''}${actressName ? ` • Model: ${actressName}` : ''}`,
        media: images?.[0],
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
