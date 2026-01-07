// Video Block Schema for Portable Text
// Supports both self-hosted (Backblaze B2) and external embeds (YouTube/Vimeo)
import { defineType, defineField } from 'sanity';
import { PlayIcon } from '@sanity/icons';

/**
 * Video Block Type for Portable Text Editor
 * 
 * Features:
 * - Self-hosted videos via Backblaze B2 direct URLs
 * - External embeds (YouTube, Vimeo, etc.) via iframe code
 * - Player options: autoplay, loop, muted, controls
 * - Optional poster thumbnail, title, caption
 * - Type selector for video source type
 */
export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Video Block',
  type: 'object',
  icon: PlayIcon,
  fields: [
    // Video source type selector
    defineField({
      name: 'sourceType',
      title: 'Video Source',
      type: 'string',
      options: {
        list: [
          { title: 'Self-Hosted (B2/Direct URL)', value: 'selfHosted' },
          { title: 'External Embed (YouTube/Vimeo)', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'selfHosted',
      validation: (Rule) => Rule.required(),
    }),

    // Self-hosted video URL (Backblaze B2)
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Direct URL to video file (e.g., https://f005.backblazeb2.com/file/bucket/video.mp4)',
      hidden: ({ parent }) => parent?.sourceType !== 'selfHosted',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { sourceType?: string };
          if (parent?.sourceType === 'selfHosted' && !value) {
            return 'Video URL is required for self-hosted videos';
          }
          return true;
        }),
    }),

    // External embed code (YouTube/Vimeo)
    defineField({
      name: 'embedCode',
      title: 'Embed Code',
      type: 'text',
      rows: 4,
      description: 'Paste the full iframe embed code from YouTube, Vimeo, etc.',
      hidden: ({ parent }) => parent?.sourceType !== 'external',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { sourceType?: string };
          if (parent?.sourceType === 'external' && !value) {
            return 'Embed code is required for external videos';
          }
          return true;
        }),
    }),

    // Optional title
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title for the video (shown in player)',
    }),

    // Optional caption
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      rows: 2,
      description: 'Optional caption shown below the video',
    }),

    // Poster thumbnail URL
    defineField({
      name: 'posterUrl',
      title: 'Poster Thumbnail URL',
      type: 'url',
      description: 'Optional thumbnail image URL (shown before video plays)',
      hidden: ({ parent }) => parent?.sourceType !== 'selfHosted',
    }),

    // Alternative: Sanity image for poster
    defineField({
      name: 'posterImage',
      title: 'Poster Thumbnail (Upload)',
      type: 'image',
      description: 'Or upload a thumbnail image directly',
      options: {
        hotspot: true,
      },
      hidden: ({ parent }) => parent?.sourceType !== 'selfHosted',
    }),

    // Player options (for self-hosted videos)
    defineField({
      name: 'playerOptions',
      title: 'Player Options',
      type: 'object',
      hidden: ({ parent }) => parent?.sourceType !== 'selfHosted',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: 'autoplay',
          title: 'Autoplay',
          type: 'boolean',
          description: 'Start playing automatically (will be muted)',
          initialValue: false,
        }),
        defineField({
          name: 'loop',
          title: 'Loop',
          type: 'boolean',
          description: 'Loop the video',
          initialValue: false,
        }),
        defineField({
          name: 'muted',
          title: 'Muted',
          type: 'boolean',
          description: 'Start muted',
          initialValue: false,
        }),
        defineField({
          name: 'controls',
          title: 'Show Controls',
          type: 'boolean',
          description: 'Show player controls',
          initialValue: true,
        }),
        defineField({
          name: 'controlsStyle',
          title: 'Controls Style',
          type: 'string',
          options: {
            list: [
              { title: 'Default', value: 'default' },
              { title: 'Minimal', value: 'minimal' },
              { title: 'Full', value: 'full' },
            ],
          },
          initialValue: 'default',
        }),
        defineField({
          name: 'playsinline',
          title: 'Play Inline (Mobile)',
          type: 'boolean',
          description: 'Play inline on mobile instead of fullscreen',
          initialValue: true,
        }),
      ],
    }),

    // Layout options
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          { title: '16:9 (Widescreen)', value: '16:9' },
          { title: '4:3 (Standard)', value: '4:3' },
          { title: '1:1 (Square)', value: '1:1' },
          { title: '9:16 (Vertical)', value: '9:16' },
          { title: '21:9 (Ultra-wide)', value: '21:9' },
        ],
      },
      initialValue: '16:9',
    }),

    // Maximum width constraint
    defineField({
      name: 'maxWidth',
      title: 'Maximum Width',
      type: 'string',
      options: {
        list: [
          { title: 'Full Width', value: 'full' },
          { title: 'Large (1024px)', value: 'lg' },
          { title: 'Medium (768px)', value: 'md' },
          { title: 'Small (512px)', value: 'sm' },
        ],
      },
      initialValue: 'full',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      sourceType: 'sourceType',
      videoUrl: 'videoUrl',
      posterUrl: 'posterUrl',
      posterImage: 'posterImage',
    },
    prepare({ title, sourceType, videoUrl, posterUrl, posterImage }) {
      const subtitle = sourceType === 'selfHosted' 
        ? `Self-hosted: ${videoUrl?.slice(0, 50) || 'No URL'}...`
        : 'External embed';
      
      return {
        title: title || 'Video Block',
        subtitle,
        media: PlayIcon,
      };
    },
  },

  // Use custom input component for enhanced preview
  components: {
    input: (props) => {
      // Lazy load the component to avoid circular deps
      const VideoBlockInput = require('../components/VideoBlockInput').VideoBlockInput;
      return VideoBlockInput(props);
    },
  },
});

export default videoBlock;
