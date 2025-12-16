import type { User } from "lucia";
export type { User };

// Sanity CMS types (content is managed by Sanity, not D1)
export interface Video {
  _id: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  thumbnail: string;
  videoUrl: string;
  isPremium: boolean;
  views: number;
  actress?: Actress | null;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string | null;
  videoCount?: number;
}

export interface Actress {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  birthDate?: string;
}

// Ad configuration type
export interface AdConfig {
  enabled: boolean;
  provider: 'google-adsense' | 'custom' | 'exoclick' | 'juicyads';
  adUnitId?: string;
  exoclickZoneId?: string;
  juicyadsZoneId?: string;
  positions: ('header' | 'sidebar' | 'footer' | 'in-content')[];
}

// Loader data types
export interface RootLoaderData {
  user: User | null;
  appName: string;
  appUrl: string;
}

export interface VideoWithRelations extends Video {
  actress: Actress | null;
  categories: Category[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "video.other" | "article";
  twitterCard?: "summary" | "summary_large_image" | "player";
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Lemon Squeezy types
export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      user_email: string;
      user_name: string;
      status: string;
      customer_id: number;
      order_id: number;
      product_id: number;
      variant_id: number;
      renews_at: string | null;
      ends_at: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface LemonSqueezyCheckoutResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      url: string;
    };
  };
}
