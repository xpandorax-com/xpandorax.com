// Cut schema for XpandoraX (Short Videos like TikTok/Reels)
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'cut',
  title: 'Cuts',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      description: 'Vertical thumbnail (9:16 aspect ratio recommended)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Direct URL to the short video (MP4, WebM, etc.)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'embedCode',
      title: 'Embed Code',
      type: 'text',
      rows: 4,
      description: 'Paste the full embed code (iframe) for playback (optional, falls back to videoUrl)',
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Video duration in seconds (typically 15-60 seconds for shorts)',
      validation: (Rule) => Rule.max(180).warning('Cuts are typically under 3 minutes'),
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'isPremium',
      title: 'Premium Content',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as premium/exclusive content',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle ON to show this cut on the website',
    }),
    defineField({
      name: 'actress',
      title: 'Model',
      type: 'reference',
      to: [{ type: 'actress' }],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'hashtags',
      title: 'Hashtags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add hashtags for discovery (without # symbol)',
    }),
    defineField({
      name: 'soundName',
      title: 'Sound/Music Name',
      type: 'string',
      description: 'Name of the sound or music used',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      isPremium: 'isPremium',
      actress: 'actress.name',
    },
    prepare({ title, media, isPremium, actress }) {
      return {
        title: isPremium ? `👑 ${title}` : title,
        subtitle: actress || 'No model assigned',
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
      title: 'Views, High to Low',
      name: 'viewsDesc',
      by: [{ field: 'views', direction: 'desc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
