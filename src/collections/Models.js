export const Models = {
  slug: 'models',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'verified', 'createdAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'avatar',
      type: 'text',
      admin: {
        description: 'URL to the model avatar/profile image',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'age',
      type: 'number',
    },
    {
      name: 'height',
      type: 'text',
      admin: {
        description: 'e.g., 5\'7" or 170cm',
      },
    },
    {
      name: 'measurements',
      type: 'text',
      admin: {
        description: 'e.g., 34-24-36',
      },
    },
    {
      name: 'hairColor',
      type: 'text',
    },
    {
      name: 'eyeColor',
      type: 'text',
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        {
          name: 'twitter',
          type: 'text',
        },
        {
          name: 'instagram',
          type: 'text',
        },
        {
          name: 'website',
          type: 'text',
        },
        {
          name: 'onlyfans',
          type: 'text',
        },
      ],
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'subscribers',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
