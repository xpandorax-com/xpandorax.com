import { R2ImageArrayInput } from '../components/R2ImageArrayInput';

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
      description: 'Small preview image (stored in Sanity CDN for fast loading)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'images',
      title: 'Full Images (R2)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'url',
              title: 'Image URL',
              type: 'url',
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
            prepare({ url, caption }) {
              return {
                title: caption || 'Image',
                subtitle: url ? url.split('/').pop() : 'No URL',
              };
            },
          },
        },
      ],
      description: 'Full-size images uploaded to Cloudflare R2',
      components: {
        input: R2ImageArrayInput,
      },
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
      images: 'images',
      actressName: 'actress.name',
    },
    prepare(selection) {
      const { title, media, images, actressName } = selection;
      const imageCount = images?.length || 0;
      return {
        title,
        subtitle: `${imageCount} image${imageCount !== 1 ? 's' : ''}${actressName ? ` • Model: ${actressName}` : ''}`,
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
