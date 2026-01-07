/**
 * Rich Content Helper for Portable Text
 * 
 * This file exports a reusable richContent field definition that includes
 * the videoBlock for embedding videos in Portable Text.
 * 
 * Usage in any schema:
 * 
 * import { richContentField } from './richContent';
 * 
 * defineField({
 *   ...richContentField,
 *   name: 'content',
 *   title: 'Content',
 * })
 * 
 * Or use it inline:
 * 
 * defineField({
 *   name: 'body',
 *   title: 'Body',
 *   type: 'array',
 *   of: [
 *     { type: 'block' },
 *     { type: 'image' },
 *     { type: 'videoBlock' },  // <-- Add video blocks
 *   ],
 * })
 */

import { defineField, defineArrayMember } from 'sanity';

/**
 * Standard block content types for Portable Text
 */
export const blockContent = defineArrayMember({
  type: 'block',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'H2', value: 'h2' },
    { title: 'H3', value: 'h3' },
    { title: 'H4', value: 'h4' },
    { title: 'Quote', value: 'blockquote' },
  ],
  lists: [
    { title: 'Bullet', value: 'bullet' },
    { title: 'Numbered', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Bold', value: 'strong' },
      { title: 'Italic', value: 'em' },
      { title: 'Underline', value: 'underline' },
      { title: 'Strike', value: 'strike-through' },
      { title: 'Code', value: 'code' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object',
        title: 'External Link',
        fields: [
          {
            name: 'href',
            type: 'url',
            title: 'URL',
          },
          {
            name: 'blank',
            type: 'boolean',
            title: 'Open in new tab',
            initialValue: true,
          },
        ],
      },
    ],
  },
});

/**
 * Image block for Portable Text
 */
export const imageBlock = defineArrayMember({
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative Text',
      description: 'Important for SEO and accessibility',
    },
    {
      name: 'caption',
      type: 'string',
      title: 'Caption',
    },
  ],
});

/**
 * Video block for Portable Text (B2 + External embeds)
 */
export const videoBlockMember = defineArrayMember({
  type: 'videoBlock',
});

/**
 * Complete rich content field with all block types
 * Use this as a drop-in replacement for basic array fields
 */
export const richContentField = defineField({
  name: 'richContent',
  title: 'Rich Content',
  type: 'array',
  of: [
    blockContent,
    imageBlock,
    videoBlockMember,
  ],
});

/**
 * Example: Simple body field with video support
 */
export const bodyWithVideos = defineField({
  name: 'body',
  title: 'Body',
  type: 'array',
  of: [
    { type: 'block' },
    { type: 'image', options: { hotspot: true } },
    { type: 'videoBlock' },
  ],
});

export default richContentField;
