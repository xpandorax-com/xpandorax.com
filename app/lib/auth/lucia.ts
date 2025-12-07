import { Lucia, TimeSpan } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import type { Database } from "~/db";
import { sessions, users } from "~/db/schema";

export function createLucia(db: Database) {
  const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

  return new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(30, "d"), // 30 days
    sessionCookie: {
      name: "xpandorax_session",
      attributes: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
    getUserAttributes: (attributes) => {
      return {
        email: attributes.email,
        username: attributes.username,
        isPremium: attributes.isPremium,
        premiumExpiresAt: attributes.premiumExpiresAt,
        role: attributes.role,
        mustChangePassword: attributes.mustChangePassword,
      };
    },
  });
}

// Type augmentation for Lucia
declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof createLucia>;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  username: string;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  role: "user" | "admin";
  mustChangePassword: boolean;
}

export type Auth = ReturnType<typeof createLucia>;
