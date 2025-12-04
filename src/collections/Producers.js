export const Producers = {
  slug: 'producers',
  admin: {
    useAsTitle: 'name',
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
      name: 'logo',
      type: 'text',
      admin: {
        description: 'URL to the producer/studio logo',
      },
    },
    {
      name: 'banner',
      type: 'text',
      admin: {
        description: 'URL to the producer banner image',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'foundedYear',
      type: 'number',
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
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
