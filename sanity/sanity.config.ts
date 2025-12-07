/**
 * Sanity Studio Configuration
 * 
 * To set up Sanity Studio:
 * 1. Run: npx sanity@latest init --env
 * 2. Choose "Clean project with no predefined schemas"
 * 3. Copy your project ID to .env file
 * 4. Replace the contents of sanity.config.ts with this file
 * 5. Run: npx sanity dev
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "xpandorax",
  title: "XpandoraX CMS",

  // Replace with your actual project ID and dataset
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "your-project-id",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",

  plugins: [
    structureTool(),
    visionTool(), // GROQ query playground
  ],

  schema: {
    types: schemaTypes,
  },

  // Custom studio configuration
  studio: {
    components: {
      // Add custom components here if needed
    },
  },
});
