// Actress/Model schema for XpandoraX
export default {
  name: 'actress',
  title: 'Models',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 5,
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'birthDate',
      title: 'Birth Date',
      type: 'date',
    },
    {
      name: 'nationality',
      title: 'Nationality',
      type: 'string',
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'twitter', title: 'Twitter/X', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'onlyfans', title: 'OnlyFans', type: 'url' },
      ],
    },
    {
      name: 'gallery',
      title: 'Picture Gallery',
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
            },
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
          ],
        },
      ],
      description: 'Add photos of the model for the picture gallery',
    },
    {
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      description: 'Total views for this model and their pictures',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
};
