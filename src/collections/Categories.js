/**
 * Categories Collection
 * Manages content categories for organization and navigation
 */

export const Categories = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'featured'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req }) => ['admin', 'editor'].includes(req.user?.role),
    update: ({ req }) => ['admin', 'editor'].includes(req.user?.role),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Category Name',
      admin: {
        description: 'Display name for this category',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'Unique URL identifier for this category',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Brief description of this category',
      },
    },
    {
      name: 'thumbnail',
      type: 'text',
      label: 'Thumbnail URL',
      admin: {
        description: 'URL to the category thumbnail image',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Display Order',
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured',
      admin: {
        position: 'sidebar',
        description: 'Show in featured sections',
      },
    },
  ],
  timestamps: true,
}
