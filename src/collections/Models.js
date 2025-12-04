/**
 * Models Collection
 * Manages performer profiles with detailed information and social links
 */

export const Models = {
  slug: 'models',
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
              label: 'Model Name',
              admin: {
                description: 'Stage or professional name',
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
              name: 'avatar',
              type: 'text',
              label: 'Profile Photo URL',
              admin: {
                description: 'URL to the model profile image',
              },
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Biography',
              admin: {
                description: 'Professional biography',
              },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
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
                  name: 'age',
                  type: 'number',
                  label: 'Age',
                  min: 18,
                  admin: {
                    width: '50%',
                    description: 'Must be 18 or older',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'height',
                  type: 'text',
                  label: 'Height',
                  admin: {
                    width: '50%',
                    description: 'Example: 5\'7" or 170cm',
                  },
                },
                {
                  name: 'measurements',
                  type: 'text',
                  label: 'Measurements',
                  admin: {
                    width: '50%',
                    description: 'Example: 34-24-36',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hairColor',
                  type: 'text',
                  label: 'Hair Color',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'eyeColor',
                  type: 'text',
                  label: 'Eye Color',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Social Links',
          fields: [
            {
              name: 'socialLinks',
              type: 'group',
              label: 'Social Media',
              fields: [
                {
                  name: 'twitter',
                  type: 'text',
                  label: 'Twitter/X URL',
                },
                {
                  name: 'instagram',
                  type: 'text',
                  label: 'Instagram URL',
                },
                {
                  name: 'website',
                  type: 'text',
                  label: 'Personal Website',
                },
                {
                  name: 'onlyfans',
                  type: 'text',
                  label: 'OnlyFans URL',
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
        description: 'Verified profile',
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
