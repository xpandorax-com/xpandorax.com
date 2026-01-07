# Video Block for Portable Text

A custom Sanity video block that supports:
- **Self-hosted videos** via Backblaze B2 direct URLs
- **External embeds** (YouTube, Vimeo, etc.) via iframe codes
- **Plyr.io player** on the frontend with full customization
- **Live preview** in Sanity Studio

## Installation

### Frontend (Main Project)

Install the required dependencies:

```bash
# Install Plyr and @portabletext/react
npm install plyr @portabletext/react
```

### Studio

The studio components use built-in Sanity UI, no additional dependencies needed.

## File Structure

```
studio/
├── schemas/
│   ├── videoBlock.ts       # Video block schema definition
│   ├── richContent.ts      # Helper for adding videoBlock to Portable Text
│   └── index.ts            # Updated to export videoBlock
└── components/
    ├── VideoBlockInput.tsx   # Custom input with live preview
    └── VideoBlockPreview.tsx # Video preview component

app/components/
├── portable-text-video.tsx       # Frontend video renderer with Plyr
└── portable-text-components.tsx  # PortableText components config
```

## Usage

### 1. Add Video Block to a Schema

Edit any schema that has rich content to include the videoBlock:

```typescript
// studio/schemas/article.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },                    // Text blocks
        { type: 'image' },                    // Images
        { type: 'videoBlock' },               // <-- Video blocks
      ],
    }),
  ],
});
```

Or use the `richContent` helper:

```typescript
import { richContentField } from './richContent';

defineField({
  ...richContentField,
  name: 'content',
  title: 'Content',
});
```

### 2. Render on Frontend

```tsx
// app/routes/article.$slug.tsx
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '~/components/portable-text-components';

export default function ArticlePage() {
  const { article } = useLoaderData<typeof loader>();
  
  return (
    <article className="prose prose-lg max-w-4xl mx-auto">
      <h1>{article.title}</h1>
      
      <PortableText 
        value={article.body} 
        components={portableTextComponents}
      />
    </article>
  );
}
```

## Video Block Fields

### Source Type
- **Self-Hosted (B2/Direct URL)**: For Backblaze B2 or any direct MP4 URL
- **External Embed**: For YouTube, Vimeo, or any iframe embed code

### Self-Hosted Options
| Field | Description |
|-------|-------------|
| `videoUrl` | Direct URL to MP4 file (e.g., `https://f005.backblazeb2.com/file/bucket/video.mp4`) |
| `title` | Optional video title |
| `caption` | Optional caption shown below video |
| `posterUrl` | Direct URL to thumbnail image |
| `posterImage` | Or upload thumbnail to Sanity |
| `playerOptions` | Autoplay, loop, muted, controls style, etc. |
| `aspectRatio` | 16:9, 4:3, 1:1, 9:16, 21:9 |
| `maxWidth` | Full width, large, medium, small |

### External Embed Options
| Field | Description |
|-------|-------------|
| `embedCode` | Full iframe embed code from YouTube/Vimeo |
| `title` | Optional video title |
| `caption` | Optional caption |
| `aspectRatio` | 16:9, 4:3, 1:1, 9:16, 21:9 |
| `maxWidth` | Full width, large, medium, small |

## Player Options (Self-Hosted)

```typescript
playerOptions: {
  autoplay: false,      // Auto-play (will be muted)
  loop: false,          // Loop video
  muted: false,         // Start muted
  controls: true,       // Show controls
  controlsStyle: 'default' | 'minimal' | 'full',
  playsinline: true,    // Inline play on mobile
}
```

### Control Styles

- **default**: play-large, play, progress, current-time, mute, volume, fullscreen
- **minimal**: play-large, play, progress, mute, fullscreen  
- **full**: All Plyr controls including settings, PiP, captions, etc.

## Backblaze B2 URL Format

Your B2 URLs should be in the friendly URL format:

```
https://f005.backblazeb2.com/file/{bucket-name}/path/to/video.mp4
```

Or with Cloudflare CDN (recommended):

```
https://cdn.xpandorax.com/videos/video.mp4
```

## Example Video Block Data

```json
{
  "_type": "videoBlock",
  "_key": "abc123",
  "sourceType": "selfHosted",
  "videoUrl": "https://f005.backblazeb2.com/file/xpandorax-com/videos/sample.mp4",
  "title": "Sample Video",
  "caption": "This is a sample video from B2",
  "posterUrl": "https://cdn.xpandorax.com/thumbnails/sample-thumb.jpg",
  "aspectRatio": "16:9",
  "maxWidth": "full",
  "playerOptions": {
    "autoplay": false,
    "loop": false,
    "muted": false,
    "controls": true,
    "controlsStyle": "default",
    "playsinline": true
  }
}
```

## Customizing Plyr Styles

Add to your `tailwind.css` or global styles:

```css
/* Custom Plyr theme */
.plyr-container {
  --plyr-color-main: #00b2ff;
  --plyr-video-background: #000;
  --plyr-badge-background: #00b2ff;
}

/* Custom play button */
.plyr__control--overlaid {
  background: var(--plyr-color-main);
}
```

## Troubleshooting

### Video not playing?
1. Check the URL is accessible (CORS headers must allow your domain)
2. Ensure B2 bucket is public
3. Check browser console for errors

### Embed not showing?
1. Make sure embed code includes `<iframe>`
2. Check if site allows embedding
3. Try "Load Preview" button in Studio

### Plyr not loading?
1. Make sure `plyr` is installed: `npm install plyr`
2. Plyr CSS is loaded dynamically, should work automatically
3. Check for JS errors in console

## Related Files

- [videoBlock.ts](studio/schemas/videoBlock.ts) - Schema definition
- [VideoBlockPreview.tsx](studio/components/VideoBlockPreview.tsx) - Studio preview
- [portable-text-video.tsx](app/components/portable-text-video.tsx) - Frontend component
- [portable-text-components.tsx](app/components/portable-text-components.tsx) - PortableText config
