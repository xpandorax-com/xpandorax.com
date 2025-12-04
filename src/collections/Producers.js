/**
 * Producers Collection
 * Manages studio and content producer profiles
 */

export const Producers = {
  slug: 'producers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'verified', 'country', 'videoCount', 'createdAt'],
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
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Studio Name',
              admin: {
                description: 'Official studio or producer name',
              },
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              label: 'URL Slug',
              admin: {
                description: 'Unique URL identifier',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description',
              admin: {
                description: 'Studio description and overview',
              },
            },
          ],
        },
        {
          label: 'Branding',
          fields: [
            {
              name: 'logo',
              type: 'text',
              label: 'Logo URL',
              admin: {
                description: 'URL to the studio logo',
              },
            },
            {
              name: 'banner',
              type: 'text',
              label: 'Banner URL',
              admin: {
                description: 'URL to the studio banner image',
              },
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'website',
              type: 'text',
              label: 'Website',
              admin: {
                description: 'Official website URL',
              },
            },
            {
              name: 'email',
              type: 'email',
              label: 'Contact Email',
              admin: {
                description: 'Business contact email',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'country',
                  type: 'text',
                  label: 'Country',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'foundedYear',
                  type: 'number',
                  label: 'Founded Year',
                  admin: {
                    width: '50%',
                    description: 'Year the studio was established',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar Fields
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Verified',
      admin: {
        position: 'sidebar',
        description: 'Verified studio profile',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total profile views',
      },
    },
    {
      name: 'subscribers',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total subscribers',
      },
    },
  ],
  timestamps: true,
}
