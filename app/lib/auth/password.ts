import { eq } from "drizzle-orm";
import type { Database } from "~/db";
import { users, type User, type NewUser } from "~/db/schema";

// Cloudflare Workers-compatible password hashing using Web Crypto API (PBKDF2)
const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const saltBase64 = arrayBufferToBase64(salt.buffer);
  const hashBase64 = arrayBufferToBase64(derivedBits);

  return `${saltBase64}:${hashBase64}`;
}

export async function verifyPassword(
  hashedPassword: string,
  password: string
): Promise<boolean> {
  const [saltBase64, storedHashBase64] = hashedPassword.split(":");
  if (!saltBase64 || !storedHashBase64) {
    return false;
  }

  const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const computedHashBase64 = arrayBufferToBase64(derivedBits);
  return computedHashBase64 === storedHashBase64;
}

export function generateUserId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return arrayBufferToBase64(bytes.buffer).replace(/[+/=]/g, "").slice(0, 16);
}

export async function createUser(
  db: Database,
  data: {
    email: string;
    username: string;
    password: string;
  }
): Promise<User> {
  const id = generateUserId();
  const hashedPassword = await hashPassword(data.password);
  const now = new Date();

  const newUser: NewUser = {
    id,
    email: data.email.toLowerCase(),
    username: data.username,
    hashedPassword,
    isPremium: false,
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(users).values(newUser);

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

export async function getUserByEmail(
  db: Database,
  email: string
): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
}

export async function getUserByUsername(
  db: Database,
  username: string
): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.username, username),
  });
}

export async function getUserById(
  db: Database,
  id: string
): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function updateUserPremiumStatus(
  db: Database,
  userId: string,
  isPremium: boolean,
  expiresAt?: Date
): Promise<void> {
  await db
    .update(users)
    .set({
      isPremium,
      premiumExpiresAt: expiresAt ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserLemonSqueezy(
  db: Database,
  userId: string,
  customerId: string,
  subscriptionId: string
): Promise<void> {
  await db
    .update(users)
    .set({
      lemonSqueezyCustomerId: customerId,
      lemonSqueezySubscriptionId: subscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
