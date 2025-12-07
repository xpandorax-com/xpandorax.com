import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { slateEditor } from "@payloadcms/richtext-slate";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Collections
import { Users } from "./collections/Users";
import { Videos } from "./collections/Videos";
import { Categories } from "./collections/Categories";
import { Actresses } from "./collections/Actresses";
import { Subscriptions } from "./collections/Subscriptions";

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:8787",
  
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "- XpandoraX Admin",
      favicon: "/favicon.ico",
      ogImage: "/images/og-admin.png",
    },
    components: {
      // Custom admin components can be added here
    },
  },

  editor: slateEditor({}),

  collections: [
    Users,
    Videos,
    Categories,
    Actresses,
    Subscriptions,
  ],

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || "file:./data.db",
    },
  }),

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:8787",
    "http://localhost:5173",
  ],

  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:8787",
    "http://localhost:5173",
  ],
});
