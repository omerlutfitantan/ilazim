export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Row<T> = T;
type Insert<T> = Partial<T> & Record<string, unknown>;
type Update<T> = Partial<T>;

export type UserRole = "buyer" | "seller" | "admin";
export type ListingKind = "service" | "product";
export type ListingStatus = "draft" | "open" | "awarded" | "completed" | "cancelled";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";
export type SellerType = "service" | "product" | "both";

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string | null;
  display_name: string | null;
  slug: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city_id: string | null;
  district_id: string | null;
  seller_status: SellerStatus | null;
  seller_type: SellerType | null;
  seller_headline: string | null;
  is_first_member: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  kind: ListingKind;
  parent_id: string | null;
  name: string;
  slug: string;
  h1: string;
  meta_title: string;
  meta_description: string;
  content: string;
  faq: Json;
  icon: string | null;
  image_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ListingRow = {
  id: string;
  user_id: string;
  category_id: string;
  kind: ListingKind;
  title: string;
  slug: string;
  description: string;
  city_id: string;
  district_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  image_urls: string[];
  status: ListingStatus;
  awarded_offer_id: string | null;
  offer_count: number;
  show_phone: boolean;
  published_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OfferRow = {
  id: string;
  listing_id: string;
  seller_id: string;
  amount: number;
  message: string;
  eta_text: string | null;
  image_urls: string[];
  fee_charged: number;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
};

export type ReviewRow = {
  id: string;
  listing_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type WalletRow = {
  id: string;
  user_id: string;
  cash_balance: number;
  credit_balance: number;
  available_balance: number;
  updated_at: string;
};

export type WalletTxRow = {
  id: string;
  wallet_id: string;
  user_id: string;
  type: string;
  amount: number;
  balance_kind: string;
  listing_id: string | null;
  offer_id: string | null;
  note: string | null;
  meta: Json;
  created_at: string;
};

export type LocationRow = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  type: "city" | "district";
  lat: number | null;
  lng: number | null;
};

export type SellerCategoryRow = {
  user_id: string;
  category_id: string;
  created_at: string;
};

export type SellerHiddenListingRow = {
  seller_id: string;
  listing_id: string;
  created_at: string;
};

export type SellerStatsRow = {
  seller_id: string;
  review_count: number;
  rating_avg: number;
  completed_jobs: number;
  offer_count: number;
  updated_at: string;
};

export type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Json;
  read_at: string | null;
  created_at: string;
};

export type PlatformSettingsRow = {
  id: number;
  bid_fee_amount: number;
  new_seller_credit_amount: number;
  new_seller_discount_percent: number;
  new_seller_discounted_offer_count: number;
  currency: string;
  site_name: string;
  updated_at: string;
};

export type PromoCampaignRow = {
  id: string;
  name: string;
  credit_amount: number;
  bid_fee_discount_percent: number;
  discounted_offer_count: number;
  max_redemptions: number | null;
  redeemed_count: number;
  apply_on: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  user_id: string;
  amount: number;
  provider: string;
  provider_ref: string | null;
  status: string;
  checkout_payload: Json;
  created_at: string;
  updated_at: string;
};

export type SellerPromoRow = {
  id: string;
  user_id: string;
  campaign_id: string | null;
  remaining_discounted_offers: number;
  discount_percent: number;
  granted_credit: number;
  created_at: string;
};

type Table<R, I = Insert<R>, U = Update<R>> = {
  Row: Row<R>;
  Insert: I;
  Update: U;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      categories: Table<CategoryRow>;
      listings: Table<ListingRow>;
      offers: Table<OfferRow>;
      reviews: Table<ReviewRow>;
      wallets: Table<WalletRow>;
      wallet_transactions: Table<WalletTxRow>;
      locations: Table<LocationRow>;
      seller_categories: Table<SellerCategoryRow>;
      seller_hidden_listings: Table<SellerHiddenListingRow>;
      seller_stats: Table<SellerStatsRow>;
      conversations: Table<ConversationRow>;
      messages: Table<MessageRow>;
      notifications: Table<NotificationRow>;
      platform_settings: Table<PlatformSettingsRow>;
      promo_campaigns: Table<PromoCampaignRow>;
      payments: Table<PaymentRow>;
      seller_promos: Table<SellerPromoRow>;
    };
    Views: Record<string, never>;
    Functions: {
      place_offer: {
        Args: {
          p_listing_id: string;
          p_amount: number;
          p_message: string;
          p_eta_text?: string | null;
          p_image_urls?: string[];
        };
        Returns: string;
      };
      accept_offer: { Args: { p_offer_id: string }; Returns: undefined };
      complete_listing: { Args: { p_listing_id: string }; Returns: undefined };
      cancel_listing: { Args: { p_listing_id: string }; Returns: undefined };
      submit_review: {
        Args: { p_listing_id: string; p_rating: number; p_comment: string };
        Returns: string;
      };
      request_seller_role: {
        Args: {
          p_seller_type: SellerType;
          p_headline: string;
          p_bio: string;
          p_city_id: string;
          p_district_id?: string | null;
          p_phone?: string | null;
          p_category_ids?: string[];
        };
        Returns: undefined;
      };
      set_seller_categories: {
        Args: { p_category_ids: string[] };
        Returns: undefined;
      };
      geo_distance_km: {
        Args: {
          lat1: number;
          lng1: number;
          lat2: number;
          lng2: number;
        };
        Returns: number | null;
      };
      review_seller: {
        Args: { p_user_id: string; p_approve: boolean };
        Returns: undefined;
      };
      grant_balance: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_kind: "cash" | "credit";
          p_note?: string | null;
        };
        Returns: undefined;
      };
      create_topup_payment: { Args: { p_amount: number }; Returns: string };
      apply_topup: { Args: { p_payment_id: string }; Returns: undefined };
      update_platform_settings: {
        Args: {
          p_bid_fee: number;
          p_new_credit: number;
          p_discount: number;
          p_offer_count: number;
        };
        Returns: undefined;
      };
      publish_listing: {
        Args: {
          p_category_id: string;
          p_title: string;
          p_description: string;
          p_city_id: string;
          p_district_id?: string | null;
          p_budget_min?: number | null;
          p_budget_max?: number | null;
          p_image_urls?: string[];
          p_show_phone?: boolean;
          p_phone?: string | null;
        };
        Returns: string;
      };
      send_message: {
        Args: { p_conversation_id: string; p_body: string };
        Returns: string;
      };
      mark_conversation_read: { Args: { p_conversation_id: string }; Returns: undefined };
      reveal_listing_phone: { Args: { p_listing_id: string }; Returns: string };
      delete_review: { Args: { p_review_id: string; p_reason?: string }; Returns: undefined };
      hide_listing_for_seller: { Args: { p_listing_id: string }; Returns: undefined };
      listing_match_recipients: {
        Args: { p_listing_id: string };
        Returns: { user_id: string; email: string; display_name: string | null }[];
      };
    };
    Enums: {
      user_role: UserRole;
      listing_kind: ListingKind;
      listing_status: ListingStatus;
      offer_status: OfferStatus;
      seller_status: SellerStatus;
      seller_type: SellerType;
    };
    CompositeTypes: Record<string, never>;
  };
};
