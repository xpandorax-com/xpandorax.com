import type { User, Session } from "lucia";
import type { Video, Category, Actress } from "~/db/schema";

// Loader data types
export interface RootLoaderData {
  user: User | null;
  isPremium: boolean;
  adConfig: AdConfig | null;
  appName: string;
  appUrl: string;
}

export interface AdConfig {
  exoclickZoneId: string;
  juicyadsZoneId: string;
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
