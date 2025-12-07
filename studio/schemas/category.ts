// Category schema for XpandoraX
export default {
  name: 'category',
  title: 'Categories',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
      description: 'Lower numbers appear first',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'thumbnail',
    },
  },
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
};
