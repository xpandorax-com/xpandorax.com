import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>["image"]>[0];

// Environment type for Sanity config
export interface SanityEnv {
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  SANITY_API_TOKEN?: string;
}

// Check if Sanity is configured
export function isSanityConfigured(env: SanityEnv): boolean {
  return !!(env.SANITY_PROJECT_ID && env.SANITY_PROJECT_ID !== "your-project-id");
}

// Sanity client configuration
// You'll need to set these environment variables in Cloudflare
export function createSanityClient(env: SanityEnv) {
  const projectId = env.SANITY_PROJECT_ID || "your-project-id";
  const dataset = env.SANITY_DATASET || "production";
  
  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: true, // Use CDN for faster reads
    token: env.SANITY_API_TOKEN, // Optional: for authenticated requests
  });
}

// Sanity client for write operations (mutations)
// Uses useCdn: false which is required for writes
export function createSanityWriteClient(env: SanityEnv) {
  const projectId = env.SANITY_PROJECT_ID || "your-project-id";
  const dataset = env.SANITY_DATASET || "production";
  
  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false, // Must be false for write operations
    token: env.SANITY_API_TOKEN, // Required for write operations
  });
}

// Image URL builder
export function createImageBuilder(client: ReturnType<typeof createSanityClient>) {
  return imageUrlBuilder(client);
}

export function urlFor(client: ReturnType<typeof createSanityClient>, source: SanityImageSource) {
  return createImageBuilder(client).image(source);
}

// ==================== SANITY QUERIES ====================

// Videos
export const VIDEOS_QUERY = `*[_type == "video" && isPublished == true] | order(publishedAt desc) {
  _id,
  title,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  "previewVideo": previewVideo.asset->url,
  duration,
  abyssEmbed,
  publishedAt,
  "actress": actress->{
    _id,
    name,
    slug,
    "image": image.asset->url
  },
  "categories": categories[]->{
    _id,
    name,
    slug
  }
}`;

export const VIDEO_BY_SLUG_QUERY = `*[_type == "video" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  "previewVideo": previewVideo.asset->url,
  duration,
  abyssEmbed,
  servers,
  publishedAt,
  "actress": actress->{
    _id,
    name,
    slug,
    "image": image.asset->url,
    "videoCount": count(*[_type == "video" && actress._ref == ^._id && isPublished == true])
  },
  "categories": categories[]->{
    _id,
    name,
    slug
  }
}`;

export const FEATURED_VIDEOS_QUERY = `*[_type == "video" && isPublished == true && isFeatured == true] | order(publishedAt desc)[0...8] {
  _id,
  title,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  "previewVideo": previewVideo.asset->url,
  duration
}`;

export const RECENT_VIDEOS_QUERY = `*[_type == "video" && isPublished == true] | order(publishedAt desc)[0...12] {
  _id,
  title,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  "previewVideo": previewVideo.asset->url,
  duration
}`;

// Premium videos query removed - premium feature is no longer used

// Categories
export const CATEGORIES_QUERY = `*[_type == "category"] | order(sortOrder asc) {
  _id,
  name,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  "videoCount": count(*[_type == "video" && references(^._id) && isPublished == true])
}`;

export const CATEGORY_BY_SLUG_QUERY = `*[_type == "category" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  "videos": *[_type == "video" && references(^._id) && isPublished == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    "thumbnail": thumbnail.asset->url,
    "previewVideo": previewVideo.asset->url,
    duration
  }
}`;

// Models/Actresses
export const MODELS_QUERY = `*[_type == "actress"] | order(name asc) {
  _id,
  name,
  slug,
  bio,
  "image": image.asset->url,
  "videoCount": count(*[_type == "video" && actress._ref == ^._id && isPublished == true])
}`;

export const MODEL_BY_SLUG_QUERY = `*[_type == "actress" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  bio,
  "image": image.asset->url,
  "gallery": gallery[]{
    _key,
    asset,
    "url": asset->url,
    caption,
    alt
  },
  "videos": *[_type == "video" && actress._ref == ^._id && isPublished == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    "thumbnail": thumbnail.asset->url,
    "previewVideo": previewVideo.asset->url,
    duration
  }
}`;

// Search
export const SEARCH_QUERY = `*[_type == "video" && isPublished == true && (
  title match $query + "*" ||
  description match $query + "*"
)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  "previewVideo": previewVideo.asset->url,
  duration
}`;

// Stats
export const STATS_QUERY = `{
  "totalVideos": count(*[_type == "video"]),
  "publishedVideos": count(*[_type == "video" && isPublished == true]),
  "totalCategories": count(*[_type == "category"]),
  "totalActresses": count(*[_type == "actress"]),
  "totalProducers": count(*[_type == "producer"]),
  "totalPictures": count(*[_type == "picture" && isPublished == true]),
  "totalCuts": count(*[_type == "cut" && isPublished == true])
}`;

// Cuts (Short Videos)
export const CUTS_QUERY = `*[_type == "cut" && isPublished == true] | order(publishedAt desc) {
  _id,
  title,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  videoUrl,
  embedUrl,
  duration,
  views,
  likes,
  isPremium,
  soundName,
  hashtags,
  publishedAt,
  "actress": actress->{
    _id,
    name,
    slug,
    "image": image.asset->url
  },
  "categories": categories[]->{
    _id,
    name,
    slug
  }
}`;

export const CUT_BY_SLUG_QUERY = `*[_type == "cut" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  "thumbnail": thumbnail.asset->url,
  videoUrl,
  embedUrl,
  duration,
  views,
  likes,
  isPremium,
  soundName,
  hashtags,
  publishedAt,
  "actress": actress->{
    _id,
    name,
    slug,
    "image": image.asset->url,
    "cutCount": count(*[_type == "cut" && actress._ref == ^._id && isPublished == true])
  },
  "categories": categories[]->{
    _id,
    name,
    slug
  }
}`;

export const FEATURED_CUTS_QUERY = `*[_type == "cut" && isPublished == true && isFeatured == true] | order(publishedAt desc)[0...8] {
  _id,
  title,
  slug,
  "thumbnail": thumbnail.asset->url,
  videoUrl,
  duration,
  views,
  isPremium
}`;

export const POPULAR_CUTS_QUERY = `*[_type == "cut" && isPublished == true] | order(views desc)[0...12] {
  _id,
  title,
  slug,
  "thumbnail": thumbnail.asset->url,
  videoUrl,
  duration,
  views,
  isPremium
}`;

// ==================== TYPE DEFINITIONS ====================

export interface SanityVideo {
  _id: string;
  title: string;
  slug: { current: string } | string;
  description?: string;
  thumbnail?: string;
  previewVideo?: string;
  duration?: number;
  views?: number;
  isPremium?: boolean;
  abyssEmbed: string;
  mainServerUrl?: string;
  servers?: { name: string; url: string }[];
  downloadLinks?: { name: string; url: string }[];
  publishedAt?: string;
  actress?: SanityActress;
  producer?: SanityProducer;
  categories?: SanityCategory[];
}

export interface SanityCategory {
  _id: string;
  name: string;
  slug: { current: string } | string;
  description?: string;
  thumbnail?: string;
  videoCount?: number;
  videos?: SanityVideo[];
}

export interface SanityActress {
  _id: string;
  name: string;
  slug: { current: string } | string;
  bio?: string;
  image?: string;
  views?: number;
  videoCount?: number;
  videos?: SanityVideo[];
  gallery?: SanityGalleryImage[];
}

export interface SanityGalleryImage {
  _key: string;
  asset: {
    _ref: string;
    url?: string;
  };
  caption?: string;
  alt?: string;
  url?: string;
}

export interface SanityProducer {
  _id: string;
  name: string;
  slug: { current: string } | string;
  description?: string;
  logo?: string;
  website?: string;
  founded?: number;
  country?: string;
  videoCount?: number;
  videos?: SanityVideo[];
}

export interface SanityPicture {
  _id: string;
  title: string;
  slug: { current: string } | string;
  image?: string;
  actress?: SanityActress;
  producer?: SanityProducer;
  categories?: SanityCategory[];
  isPublished: boolean;
  publishedAt?: string;
}

export interface SanityCut {
  _id: string;
  title: string;
  slug: { current: string } | string;
  description?: string;
  thumbnail?: string;
  videoUrl: string;
  embedUrl?: string;
  duration?: number;
  views?: number;
  likes?: number;
  isPremium?: boolean;
  soundName?: string;
  hashtags?: string[];
  publishedAt?: string;
  actress?: SanityActress;
  categories?: SanityCategory[];
}

// Helper to get slug string from Sanity slug object
export function getSlug(slug: { current: string } | string): string {
  return typeof slug === "string" ? slug : slug.current;
}
