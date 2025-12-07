import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

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
              .title('Categories')
              .icon(() => '📁')
              .child(S.documentTypeList('category').title('Categories')),
            S.listItem()
              .title('Models')
              .icon(() => '👤')
              .child(S.documentTypeList('actress').title('Models')),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) =>
                !['video', 'category', 'actress'].includes(listItem.getId() || '')
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
