/**
 * Sanity CMS Integration
 * 
 * To use Sanity:
 * 1. Create a project at https://sanity.io
 * 2. Install Sanity Studio: npx sanity@latest init
 * 3. Add these env variables to Cloudflare:
 *    - SANITY_PROJECT_ID
 *    - SANITY_DATASET (usually "production")
 *    - SANITY_API_TOKEN (for mutations)
 */

export interface SanityConfig {
  projectId: string;
  dataset: string;
  apiVersion?: string;
  token?: string;
  useCdn?: boolean;
}

// Sanity CDN URL builder
function buildSanityUrl(config: SanityConfig, query: string, params?: Record<string, string | number | boolean>): string {
  const { projectId, dataset, apiVersion = "2024-01-01", useCdn = true } = config;
  const host = useCdn ? "apicdn.sanity.io" : "api.sanity.io";
  
  const url = new URL(`https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(`$${key}`, JSON.stringify(value));
    });
  }
  
  return url.toString();
}

// Sanity client for Cloudflare Workers
export function createSanityClient(env: {
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  SANITY_API_TOKEN?: string;
}) {
  const config: SanityConfig = {
    projectId: env.SANITY_PROJECT_ID || "",
    dataset: env.SANITY_DATASET || "production",
    token: env.SANITY_API_TOKEN,
  };

  if (!config.projectId) {
    return null;
  }

  return {
    async fetch<T>(query: string, params?: Record<string, string | number | boolean>): Promise<T> {
      const url = buildSanityUrl(config, query, params);
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (config.token) {
        headers["Authorization"] = `Bearer ${config.token}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Sanity fetch failed: ${response.statusText}`);
      }

      const data = await response.json() as { result: T };
      return data.result;
    },

    // Mutation (create, update, delete)
    async mutate(mutations: SanityMutation[]) {
      if (!config.token) {
        throw new Error("Sanity token required for mutations");
      }

      const url = `https://${config.projectId}.api.sanity.io/v2024-01-01/data/mutate/${config.dataset}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.token}`,
        },
        body: JSON.stringify({ mutations }),
      });

      if (!response.ok) {
        throw new Error(`Sanity mutation failed: ${response.statusText}`);
      }

      return response.json();
    },
  };
}

// Sanity mutation types
export interface SanityMutation {
  create?: Record<string, unknown>;
  createOrReplace?: Record<string, unknown>;
  createIfNotExists?: Record<string, unknown>;
  delete?: { id: string };
  patch?: {
    id: string;
    set?: Record<string, unknown>;
    unset?: string[];
  };
}

// GROQ queries for your content types
export const sanityQueries = {
  // Get all videos
  allVideos: `*[_type == "video" && isPublished == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    "thumbnail": thumbnail.asset->url,
    duration,
    views,
    likes,
    isPremium,
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
  }`,

  // Get single video by slug
  videoBySlug: `*[_type == "video" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    "thumbnail": thumbnail.asset->url,
    duration,
    views,
    likes,
    isPremium,
    abyssEmbed,
    publishedAt,
    "actress": actress->{
      _id,
      name,
      slug,
      bio,
      "image": image.asset->url
    },
    "categories": categories[]->{
      _id,
      name,
      slug
    }
  }`,

  // Get all categories
  allCategories: `*[_type == "category"] | order(sortOrder asc) {
    _id,
    name,
    slug,
    description,
    "thumbnail": thumbnail.asset->url,
    videoCount
  }`,

  // Get all actresses
  allActresses: `*[_type == "actress"] | order(name asc) {
    _id,
    name,
    slug,
    bio,
    "image": image.asset->url,
    videoCount
  }`,

  // Get videos by category
  videosByCategory: `*[_type == "video" && isPublished == true && $categoryId in categories[]._ref] | order(publishedAt desc) {
    _id,
    title,
    slug,
    "thumbnail": thumbnail.asset->url,
    duration,
    views,
    isPremium,
    "actress": actress->{name, slug}
  }`,

  // Get videos by actress
  videosByActress: `*[_type == "video" && isPublished == true && actress._ref == $actressId] | order(publishedAt desc) {
    _id,
    title,
    slug,
    "thumbnail": thumbnail.asset->url,
    duration,
    views,
    isPremium
  }`,

  // Search videos
  searchVideos: `*[_type == "video" && isPublished == true && (
    title match $query ||
    description match $query ||
    actress->name match $query
  )] | order(publishedAt desc)[0...$limit] {
    _id,
    title,
    slug,
    "thumbnail": thumbnail.asset->url,
    duration,
    views,
    isPremium,
    "actress": actress->{name, slug}
  }`,
};

// Sanity image URL builder
export function sanityImageUrl(
  projectId: string,
  dataset: string,
  imageRef: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpg" | "png";
  }
): string {
  // Extract image ID from reference like "image-abc123-1920x1080-jpg"
  const [, id, dimensions, format] = imageRef.split("-");
  const ext = format || "jpg";
  
  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${ext}`;
  
  const params = new URLSearchParams();
  if (options?.width) params.set("w", options.width.toString());
  if (options?.height) params.set("h", options.height.toString());
  if (options?.quality) params.set("q", options.quality.toString());
  if (options?.format) params.set("fm", options.format);
  
  const paramString = params.toString();
  if (paramString) {
    url += `?${paramString}`;
  }
  
  return url;
}

// Type definitions for Sanity content
export interface SanityVideo {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  thumbnail?: string;
  duration?: number;
  views: number;
  likes: number;
  isPremium: boolean;
  abyssEmbed: string;
  publishedAt: string;
  actress?: SanityActress;
  categories?: SanityCategory[];
}

export interface SanityCategory {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  thumbnail?: string;
  videoCount: number;
}

export interface SanityActress {
  _id: string;
  name: string;
  slug: { current: string };
  bio?: string;
  image?: string;
  videoCount: number;
}
