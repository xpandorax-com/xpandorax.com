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
        // Always secure in production (Cloudflare Workers)
        secure: true,
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
        lastLoginAt: attributes.lastLoginAt,
        lemonSqueezyCustomerId: attributes.lemonSqueezyCustomerId,
        lemonSqueezySubscriptionId: attributes.lemonSqueezySubscriptionId,
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
  lastLoginAt: Date | null;
  lemonSqueezyCustomerId: string | null;
  lemonSqueezySubscriptionId: string | null;
}

export type Auth = ReturnType<typeof createLucia>;
