// Producer schema for XpandoraX
export default {
  name: 'producer',
  title: 'Producers',
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
      rows: 5,
      description: 'About this producer/studio',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'website',
      title: 'Official Website',
      type: 'url',
    },
    {
      name: 'founded',
      title: 'Founded Year',
      type: 'number',
    },
    {
      name: 'country',
      title: 'Country',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'logo',
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
