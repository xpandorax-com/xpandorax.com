import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

// Configuration
const PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:5173';
// Environment variables available for reference
// CDN_URL: process.env.SANITY_STUDIO_CDN_URL || 'https://cdn.xpandorax.com'
// UPLOAD_API_URL: process.env.SANITY_STUDIO_UPLOAD_API_URL || 'https://xpandorax.com/api/upload-picture'

/**
 * Sanity Studio Configuration for XpandoraX
 * 
 * Media Storage:
 * - Thumbnails: Sanity CDN (fast thumbnail delivery)
 * - Full Images: Backblaze B2 + Cloudflare CDN (xpandorax-com bucket)
 * - Videos: Third-party embed servers
 * 
 * CDN: https://cdn.xpandorax.com (Cloudflare proxied)
 * Upload Endpoint: ${UPLOAD_API_URL}
 */
export default defineConfig({
  name: 'xpandorax',
  title: 'XpandoraX CMS',

  projectId: 'p9gceue4',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Videos')
              .icon(() => '🎬')
              .child(
                S.documentTypeList('video')
                  .title('Videos')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
              ),
            S.listItem()
              .title('Pictures')
              .icon(() => '🖼️')
              .child(
                S.documentTypeList('picture')
                  .title('Pictures')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
              ),
            S.listItem()
              .title('Categories')
              .icon(() => '📁')
              .child(S.documentTypeList('category').title('Categories')),
            S.listItem()
              .title('Models')
              .icon(() => '👤')
              .child(S.documentTypeList('actress').title('Models')),
            S.listItem()
              .title('Producers')
              .icon(() => '🏢')
              .child(S.documentTypeList('producer').title('Producers')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
  
  document: {
    // Enable preview functionality for documents
    productionUrl: async (prev, context) => {
      const { document } = context;
      const type = document._type;
      const slug = (document.slug as { current?: string })?.current;
      
      if (!slug) return prev;
      
      // Generate preview URLs based on document type
      switch (type) {
        case 'video':
          return `${PREVIEW_URL}/video/${slug}`;
        case 'picture':
          return `${PREVIEW_URL}/pictures/${slug}`;
        case 'actress':
          return `${PREVIEW_URL}/model/${slug}`;
        case 'producer':
          return `${PREVIEW_URL}/producer/${slug}`;
        case 'category':
          return `${PREVIEW_URL}/category/${slug}`;
        default:
          return prev;
      }
    },
  },
});
