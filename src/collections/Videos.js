/**
 * Videos Collection
 * Manages video content with metadata, relationships, and publishing workflow
 */

export const Videos = {
  slug: 'videos',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'quality', 'views', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req }) => ['admin', 'editor'].includes(req.user?.role),
    update: ({ req }) => ['admin', 'editor'].includes(req.user?.role),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    // Main Information
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Video Title',
              admin: {
                description: 'The title displayed for this video',
              },
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              label: 'URL Slug',
              admin: {
                description: 'Unique URL identifier for this video',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description',
              admin: {
                description: 'Detailed description of the video content',
              },
            },
            {
              name: 'thumbnail',
              type: 'text',
              label: 'Thumbnail URL',
              admin: {
                description: 'URL to the video thumbnail image',
              },
            },
            {
              name: 'videoUrl',
              type: 'text',
              required: true,
              label: 'Video URL',
              admin: {
                description: 'URL to the video file or embed source',
              },
            },
          ],
        },
        {
          label: 'Metadata',
          fields: [
            {
              name: 'duration',
              type: 'number',
              label: 'Duration',
              admin: {
                description: 'Video duration in seconds',
              },
            },
            {
              name: 'quality',
              type: 'select',
              label: 'Video Quality',
              defaultValue: '1080p',
              options: [
                { label: '4K Ultra HD', value: '4K' },
                { label: '1080p Full HD', value: '1080p' },
                { label: '720p HD', value: '720p' },
                { label: '480p SD', value: '480p' },
              ],
            },
            {
              name: 'tags',
              type: 'array',
              label: 'Tags',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  label: 'Tag',
                },
              ],
              admin: {
                description: 'Keywords for search and categorization',
              },
            },
          ],
        },
        {
          label: 'Relationships',
          fields: [
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: 'Categories',
              admin: {
                description: 'Assign this video to categories',
              },
            },
            {
              name: 'models',
              type: 'relationship',
              relationTo: 'models',
              hasMany: true,
              label: 'Featured Models',
              admin: {
                description: 'Models appearing in this video',
              },
            },
            {
              name: 'producer',
              type: 'relationship',
              relationTo: 'producers',
              label: 'Producer/Studio',
              admin: {
                description: 'The studio or producer of this video',
              },
            },
          ],
        },
      ],
    },
    // Sidebar Fields
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Featured', value: 'featured' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Publishing status',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total view count',
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total likes',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publish Date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When this video was published',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.publishedAt && data.status === 'published') {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
