import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_properties_product_line" AS ENUM('foncier', 'immobilier');
  CREATE TYPE "public"."enum_properties_kind" AS ENUM('terrain', 'villa', 'appartement', 'immeuble', 'bureau', 'commerce');
  CREATE TYPE "public"."enum_properties_availability" AS ENUM('disponible', 'en-cours', 'realise', 'vendu', 'a-louer');
  CREATE TYPE "public"."enum_properties_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__properties_v_version_product_line" AS ENUM('foncier', 'immobilier');
  CREATE TYPE "public"."enum__properties_v_version_kind" AS ENUM('terrain', 'villa', 'appartement', 'immeuble', 'bureau', 'commerce');
  CREATE TYPE "public"."enum__properties_v_version_availability" AS ENUM('disponible', 'en-cours', 'realise', 'vendu', 'a-louer');
  CREATE TYPE "public"."enum__properties_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__properties_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_width" AS ENUM('narrow', 'full');
  CREATE TYPE "public"."enum_pages_blocks_service_split_image_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum_pages_blocks_property_list_mode" AS ENUM('filter', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_property_list_product_line" AS ENUM('foncier', 'immobilier');
  CREATE TYPE "public"."enum_pages_blocks_property_list_availability" AS ENUM('disponible', 'en-cours', 'realise');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_width" AS ENUM('narrow', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_service_split_image_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum__pages_v_blocks_property_list_mode" AS ENUM('filter', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_property_list_product_line" AS ENUM('foncier', 'immobilier');
  CREATE TYPE "public"."enum__pages_v_blocks_property_list_availability" AS ENUM('disponible', 'en-cours', 'realise');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_leads_type" AS ENUM('form', 'cart');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('nouveau', 'contacte', 'converti', 'perdu');
  CREATE TYPE "public"."enum_cities_region" AS ENUM('Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor');
  CREATE TYPE "public"."enum_amenities_category" AS ENUM('viabilisation', 'confort', 'securite', 'exterieur');
  CREATE TYPE "public"."enum_site_settings_socials_platform" AS ENUM('facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'x');
  CREATE TABLE "properties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"city_id" integer,
  	"latitude" numeric,
  	"longitude" numeric,
  	"surface" numeric,
  	"plot_size" numeric,
  	"bedrooms" numeric,
  	"bathrooms" numeric,
  	"floors" varchar,
  	"year" numeric,
  	"title_deed" varchar,
  	"featured_image_id" integer,
  	"video_url" varchar,
  	"brochure_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"product_line" "enum_properties_product_line",
  	"kind" "enum_properties_kind",
  	"availability" "enum_properties_availability" DEFAULT 'disponible',
  	"show_price" boolean DEFAULT false,
  	"price" numeric,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_properties_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "properties_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"description" jsonb,
  	"address" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"slug" varchar,
  	"price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "properties_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"amenities_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_properties_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_city_id" integer,
  	"version_latitude" numeric,
  	"version_longitude" numeric,
  	"version_surface" numeric,
  	"version_plot_size" numeric,
  	"version_bedrooms" numeric,
  	"version_bathrooms" numeric,
  	"version_floors" varchar,
  	"version_year" numeric,
  	"version_title_deed" varchar,
  	"version_featured_image_id" integer,
  	"version_video_url" varchar,
  	"version_brochure_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_product_line" "enum__properties_v_version_product_line",
  	"version_kind" "enum__properties_v_version_kind",
  	"version_availability" "enum__properties_v_version_availability" DEFAULT 'disponible',
  	"version_show_price" boolean DEFAULT false,
  	"version_price" numeric,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__properties_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__properties_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_properties_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_description" jsonb,
  	"version_address" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_slug" varchar,
  	"version_price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_properties_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"amenities_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_image_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"category_id" integer,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_cover_image_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_category_id" integer,
  	"version_author_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background_image_id" integer,
  	"video_url" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_pages_blocks_rich_text_width" DEFAULT 'narrow',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_entries_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_timeline_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_value_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar
  );
  
  CREATE TABLE "pages_blocks_value_grid_items_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_value_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_value_grid_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_service_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum_pages_blocks_service_split_image_position" DEFAULT 'start',
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_split_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_property_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_pages_blocks_property_list_mode" DEFAULT 'filter',
  	"product_line" "enum_pages_blocks_property_list_product_line",
  	"availability" "enum_pages_blocks_property_list_availability",
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_property_list_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gallery_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_testimonials_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_block_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background_image_id" integer,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"subject" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_form_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer,
  	"media_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background_image_id" integer,
  	"video_url" varchar,
  	"cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"subheading" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__pages_v_blocks_rich_text_width" DEFAULT 'narrow',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text_locales" (
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_entries_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_timeline_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_value_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_value_grid_items_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_value_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_value_grid_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_service_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_position" "enum__pages_v_blocks_service_split_image_position" DEFAULT 'start',
  	"cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_split_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_property_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"mode" "enum__pages_v_blocks_property_list_mode" DEFAULT 'filter',
  	"product_line" "enum__pages_v_blocks_property_list_product_line",
  	"availability" "enum__pages_v_blocks_property_list_availability",
  	"limit" numeric DEFAULT 6,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_property_list_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_block_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items_locales" (
  	"question" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background_image_id" integer,
  	"cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"subject" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_form_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_slug" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer,
  	"media_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"linkedin" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team_locales" (
  	"role" varchar NOT NULL,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"author" varchar NOT NULL,
  	"location" varchar,
  	"photo_id" integer,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"quote" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"type" "enum_leads_type" DEFAULT 'form' NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'nouveau' NOT NULL,
  	"locale" varchar,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"message" varchar,
  	"source" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"properties_id" integer
  );
  
  CREATE TABLE "cities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"region" "enum_cities_region",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cities_locales" (
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "amenities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_amenities_category" DEFAULT 'viabilisation',
  	"icon" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "amenities_locales" (
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_site_settings_socials_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Compagnie Prestige Immobilier',
  	"default_seo_image_id" integer,
  	"email" varchar DEFAULT 'contact@cpi.sn',
  	"whatsapp_number" varchar DEFAULT '221764508374' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"tagline" varchar,
  	"address" varchar,
  	"opening_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_header_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "navigation_header_children_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "navigation_header_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "navigation_footer_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "navigation_legal_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "properties_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "amenities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_brochure_id_media_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties" ADD CONSTRAINT "properties_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "properties_locales" ADD CONSTRAINT "properties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_amenities_fk" FOREIGN KEY ("amenities_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "properties_rels" ADD CONSTRAINT "properties_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_parent_id_properties_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_city_id_cities_id_fk" FOREIGN KEY ("version_city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_brochure_id_media_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v" ADD CONSTRAINT "_properties_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_properties_v_locales" ADD CONSTRAINT "_properties_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_properties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v_rels" ADD CONSTRAINT "_properties_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_properties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v_rels" ADD CONSTRAINT "_properties_v_rels_amenities_fk" FOREIGN KEY ("amenities_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_properties_v_rels" ADD CONSTRAINT "_properties_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text_locales" ADD CONSTRAINT "pages_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items_locales" ADD CONSTRAINT "pages_blocks_stats_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_entries" ADD CONSTRAINT "pages_blocks_timeline_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_entries_locales" ADD CONSTRAINT "pages_blocks_timeline_entries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline" ADD CONSTRAINT "pages_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_timeline_locales" ADD CONSTRAINT "pages_blocks_timeline_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_grid_items" ADD CONSTRAINT "pages_blocks_value_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_value_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_grid_items_locales" ADD CONSTRAINT "pages_blocks_value_grid_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_value_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_grid" ADD CONSTRAINT "pages_blocks_value_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_grid_locales" ADD CONSTRAINT "pages_blocks_value_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_value_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_split" ADD CONSTRAINT "pages_blocks_service_split_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_split" ADD CONSTRAINT "pages_blocks_service_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_split_locales" ADD CONSTRAINT "pages_blocks_service_split_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_property_list" ADD CONSTRAINT "pages_blocks_property_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_property_list_locales" ADD CONSTRAINT "pages_blocks_property_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_property_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_locales" ADD CONSTRAINT "pages_blocks_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_block" ADD CONSTRAINT "pages_blocks_testimonials_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_block_locales" ADD CONSTRAINT "pages_blocks_testimonials_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items_locales" ADD CONSTRAINT "pages_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_locales" ADD CONSTRAINT "pages_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_locales" ADD CONSTRAINT "pages_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form" ADD CONSTRAINT "pages_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_form_locales" ADD CONSTRAINT "pages_blocks_contact_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_locales" ADD CONSTRAINT "_pages_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text_locales" ADD CONSTRAINT "_pages_v_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items_locales" ADD CONSTRAINT "_pages_v_blocks_stats_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_entries" ADD CONSTRAINT "_pages_v_blocks_timeline_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_entries_locales" ADD CONSTRAINT "_pages_v_blocks_timeline_entries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline" ADD CONSTRAINT "_pages_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_timeline_locales" ADD CONSTRAINT "_pages_v_blocks_timeline_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_value_grid_items" ADD CONSTRAINT "_pages_v_blocks_value_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_value_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_value_grid_items_locales" ADD CONSTRAINT "_pages_v_blocks_value_grid_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_value_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_value_grid" ADD CONSTRAINT "_pages_v_blocks_value_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_value_grid_locales" ADD CONSTRAINT "_pages_v_blocks_value_grid_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_value_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_split" ADD CONSTRAINT "_pages_v_blocks_service_split_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_split" ADD CONSTRAINT "_pages_v_blocks_service_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_split_locales" ADD CONSTRAINT "_pages_v_blocks_service_split_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_service_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_property_list" ADD CONSTRAINT "_pages_v_blocks_property_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_property_list_locales" ADD CONSTRAINT "_pages_v_blocks_property_list_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_property_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_locales" ADD CONSTRAINT "_pages_v_blocks_gallery_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_block" ADD CONSTRAINT "_pages_v_blocks_testimonials_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_block_locales" ADD CONSTRAINT "_pages_v_blocks_testimonials_block_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items_locales" ADD CONSTRAINT "_pages_v_blocks_faq_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_locales" ADD CONSTRAINT "_pages_v_blocks_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_locales" ADD CONSTRAINT "_pages_v_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form" ADD CONSTRAINT "_pages_v_blocks_contact_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_form_locales" ADD CONSTRAINT "_pages_v_blocks_contact_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_locales" ADD CONSTRAINT "team_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_rels" ADD CONSTRAINT "leads_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities_locales" ADD CONSTRAINT "cities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_locales" ADD CONSTRAINT "amenities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_phones" ADD CONSTRAINT "site_settings_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_socials" ADD CONSTRAINT "site_settings_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_seo_image_id_media_id_fk" FOREIGN KEY ("default_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_children" ADD CONSTRAINT "navigation_header_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_children_locales" ADD CONSTRAINT "navigation_header_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_locales" ADD CONSTRAINT "navigation_header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links_locales" ADD CONSTRAINT "navigation_footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_locales" ADD CONSTRAINT "navigation_footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_legal" ADD CONSTRAINT "navigation_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_legal_locales" ADD CONSTRAINT "navigation_legal_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_legal"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city_id");
  CREATE INDEX "properties_featured_image_idx" ON "properties" USING btree ("featured_image_id");
  CREATE INDEX "properties_brochure_idx" ON "properties" USING btree ("brochure_id");
  CREATE INDEX "properties_seo_seo_og_image_idx" ON "properties" USING btree ("seo_og_image_id");
  CREATE INDEX "properties_updated_at_idx" ON "properties" USING btree ("updated_at");
  CREATE INDEX "properties_created_at_idx" ON "properties" USING btree ("created_at");
  CREATE INDEX "properties__status_idx" ON "properties" USING btree ("_status");
  CREATE UNIQUE INDEX "properties_slug_idx" ON "properties_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "properties_locales_locale_parent_id_unique" ON "properties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "properties_rels_order_idx" ON "properties_rels" USING btree ("order");
  CREATE INDEX "properties_rels_parent_idx" ON "properties_rels" USING btree ("parent_id");
  CREATE INDEX "properties_rels_path_idx" ON "properties_rels" USING btree ("path");
  CREATE INDEX "properties_rels_amenities_id_idx" ON "properties_rels" USING btree ("amenities_id");
  CREATE INDEX "properties_rels_media_id_idx" ON "properties_rels" USING btree ("media_id");
  CREATE INDEX "_properties_v_parent_idx" ON "_properties_v" USING btree ("parent_id");
  CREATE INDEX "_properties_v_version_version_city_idx" ON "_properties_v" USING btree ("version_city_id");
  CREATE INDEX "_properties_v_version_version_featured_image_idx" ON "_properties_v" USING btree ("version_featured_image_id");
  CREATE INDEX "_properties_v_version_version_brochure_idx" ON "_properties_v" USING btree ("version_brochure_id");
  CREATE INDEX "_properties_v_version_seo_version_seo_og_image_idx" ON "_properties_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_properties_v_version_version_updated_at_idx" ON "_properties_v" USING btree ("version_updated_at");
  CREATE INDEX "_properties_v_version_version_created_at_idx" ON "_properties_v" USING btree ("version_created_at");
  CREATE INDEX "_properties_v_version_version__status_idx" ON "_properties_v" USING btree ("version__status");
  CREATE INDEX "_properties_v_created_at_idx" ON "_properties_v" USING btree ("created_at");
  CREATE INDEX "_properties_v_updated_at_idx" ON "_properties_v" USING btree ("updated_at");
  CREATE INDEX "_properties_v_snapshot_idx" ON "_properties_v" USING btree ("snapshot");
  CREATE INDEX "_properties_v_published_locale_idx" ON "_properties_v" USING btree ("published_locale");
  CREATE INDEX "_properties_v_latest_idx" ON "_properties_v" USING btree ("latest");
  CREATE INDEX "_properties_v_autosave_idx" ON "_properties_v" USING btree ("autosave");
  CREATE INDEX "_properties_v_version_version_slug_idx" ON "_properties_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_properties_v_locales_locale_parent_id_unique" ON "_properties_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_properties_v_rels_order_idx" ON "_properties_v_rels" USING btree ("order");
  CREATE INDEX "_properties_v_rels_parent_idx" ON "_properties_v_rels" USING btree ("parent_id");
  CREATE INDEX "_properties_v_rels_path_idx" ON "_properties_v_rels" USING btree ("path");
  CREATE INDEX "_properties_v_rels_amenities_id_idx" ON "_properties_v_rels" USING btree ("amenities_id");
  CREATE INDEX "_properties_v_rels_media_id_idx" ON "_properties_v_rels" USING btree ("media_id");
  CREATE INDEX "posts_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE INDEX "posts_seo_seo_og_image_idx" ON "posts" USING btree ("seo_og_image_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_properties_id_idx" ON "posts_rels" USING btree ("properties_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_image_idx" ON "_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_posts_v_version_seo_version_seo_og_image_idx" ON "_posts_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_posts_v_version_version_category_idx" ON "_posts_v" USING btree ("version_category_id");
  CREATE INDEX "_posts_v_version_version_author_idx" ON "_posts_v" USING btree ("version_author_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_properties_id_idx" ON "_posts_v_rels" USING btree ("properties_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_background_image_idx" ON "pages_blocks_hero" USING btree ("background_image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_locales_locale_parent_id_unique" ON "pages_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_rich_text_locales_locale_parent_id_unique" ON "pages_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_stats_items_locales_locale_parent_id_unique" ON "pages_blocks_stats_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE INDEX "pages_blocks_timeline_entries_order_idx" ON "pages_blocks_timeline_entries" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_entries_parent_id_idx" ON "pages_blocks_timeline_entries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_timeline_entries_locales_locale_parent_id_uniqu" ON "pages_blocks_timeline_entries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_timeline_order_idx" ON "pages_blocks_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_timeline_parent_id_idx" ON "pages_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_timeline_path_idx" ON "pages_blocks_timeline" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_timeline_locales_locale_parent_id_unique" ON "pages_blocks_timeline_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_value_grid_items_order_idx" ON "pages_blocks_value_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_value_grid_items_parent_id_idx" ON "pages_blocks_value_grid_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_value_grid_items_locales_locale_parent_id_uniqu" ON "pages_blocks_value_grid_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_value_grid_order_idx" ON "pages_blocks_value_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_value_grid_parent_id_idx" ON "pages_blocks_value_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_value_grid_path_idx" ON "pages_blocks_value_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_value_grid_locales_locale_parent_id_unique" ON "pages_blocks_value_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_service_split_order_idx" ON "pages_blocks_service_split" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_split_parent_id_idx" ON "pages_blocks_service_split" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_split_path_idx" ON "pages_blocks_service_split" USING btree ("_path");
  CREATE INDEX "pages_blocks_service_split_image_idx" ON "pages_blocks_service_split" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_service_split_locales_locale_parent_id_unique" ON "pages_blocks_service_split_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_property_list_order_idx" ON "pages_blocks_property_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_property_list_parent_id_idx" ON "pages_blocks_property_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_property_list_path_idx" ON "pages_blocks_property_list" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_property_list_locales_locale_parent_id_unique" ON "pages_blocks_property_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_gallery_locales_locale_parent_id_unique" ON "pages_blocks_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_testimonials_block_order_idx" ON "pages_blocks_testimonials_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_block_parent_id_idx" ON "pages_blocks_testimonials_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_block_path_idx" ON "pages_blocks_testimonials_block" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_testimonials_block_locales_locale_parent_id_uni" ON "pages_blocks_testimonials_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_faq_items_locales_locale_parent_id_unique" ON "pages_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_faq_locales_locale_parent_id_unique" ON "pages_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_background_image_idx" ON "pages_blocks_cta" USING btree ("background_image_id");
  CREATE UNIQUE INDEX "pages_blocks_cta_locales_locale_parent_id_unique" ON "pages_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_contact_form_order_idx" ON "pages_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_form_parent_id_idx" ON "pages_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_form_path_idx" ON "pages_blocks_contact_form" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_contact_form_locales_locale_parent_id_unique" ON "pages_blocks_contact_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_properties_id_idx" ON "pages_rels" USING btree ("properties_id");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_background_image_idx" ON "_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_rich_text_locales_locale_parent_id_unique" ON "_pages_v_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_stats_items_locales_locale_parent_id_unique" ON "_pages_v_blocks_stats_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_timeline_entries_order_idx" ON "_pages_v_blocks_timeline_entries" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_entries_parent_id_idx" ON "_pages_v_blocks_timeline_entries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_timeline_entries_locales_locale_parent_id_un" ON "_pages_v_blocks_timeline_entries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_order_idx" ON "_pages_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_timeline_parent_id_idx" ON "_pages_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_timeline_path_idx" ON "_pages_v_blocks_timeline" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_timeline_locales_locale_parent_id_unique" ON "_pages_v_blocks_timeline_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_value_grid_items_order_idx" ON "_pages_v_blocks_value_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_value_grid_items_parent_id_idx" ON "_pages_v_blocks_value_grid_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_value_grid_items_locales_locale_parent_id_un" ON "_pages_v_blocks_value_grid_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_value_grid_order_idx" ON "_pages_v_blocks_value_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_value_grid_parent_id_idx" ON "_pages_v_blocks_value_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_value_grid_path_idx" ON "_pages_v_blocks_value_grid" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_value_grid_locales_locale_parent_id_unique" ON "_pages_v_blocks_value_grid_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_service_split_order_idx" ON "_pages_v_blocks_service_split" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_split_parent_id_idx" ON "_pages_v_blocks_service_split" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_split_path_idx" ON "_pages_v_blocks_service_split" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_split_image_idx" ON "_pages_v_blocks_service_split" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_service_split_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_service_split_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_property_list_order_idx" ON "_pages_v_blocks_property_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_property_list_parent_id_idx" ON "_pages_v_blocks_property_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_property_list_path_idx" ON "_pages_v_blocks_property_list" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_property_list_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_property_list_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_gallery_locales_locale_parent_id_unique" ON "_pages_v_blocks_gallery_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_block_order_idx" ON "_pages_v_blocks_testimonials_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_block_parent_id_idx" ON "_pages_v_blocks_testimonials_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_block_path_idx" ON "_pages_v_blocks_testimonials_block" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_testimonials_block_locales_locale_parent_id_" ON "_pages_v_blocks_testimonials_block_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_faq_items_locales_locale_parent_id_unique" ON "_pages_v_blocks_faq_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_faq_locales_locale_parent_id_unique" ON "_pages_v_blocks_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_background_image_idx" ON "_pages_v_blocks_cta" USING btree ("background_image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_locales_locale_parent_id_unique" ON "_pages_v_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_form_order_idx" ON "_pages_v_blocks_contact_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_form_parent_id_idx" ON "_pages_v_blocks_contact_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_form_path_idx" ON "_pages_v_blocks_contact_form" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_contact_form_locales_locale_parent_id_unique" ON "_pages_v_blocks_contact_form_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_properties_id_idx" ON "_pages_v_rels" USING btree ("properties_id");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE UNIQUE INDEX "team_locales_locale_parent_id_unique" ON "team_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "leads_reference_idx" ON "leads" USING btree ("reference");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "leads_rels_order_idx" ON "leads_rels" USING btree ("order");
  CREATE INDEX "leads_rels_parent_idx" ON "leads_rels" USING btree ("parent_id");
  CREATE INDEX "leads_rels_path_idx" ON "leads_rels" USING btree ("path");
  CREATE INDEX "leads_rels_properties_id_idx" ON "leads_rels" USING btree ("properties_id");
  CREATE INDEX "cities_updated_at_idx" ON "cities" USING btree ("updated_at");
  CREATE INDEX "cities_created_at_idx" ON "cities" USING btree ("created_at");
  CREATE UNIQUE INDEX "cities_slug_idx" ON "cities_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "cities_locales_locale_parent_id_unique" ON "cities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities_updated_at_idx" ON "amenities" USING btree ("updated_at");
  CREATE INDEX "amenities_created_at_idx" ON "amenities" USING btree ("created_at");
  CREATE UNIQUE INDEX "amenities_slug_idx" ON "amenities_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "amenities_locales_locale_parent_id_unique" ON "amenities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_phones_order_idx" ON "site_settings_phones" USING btree ("_order");
  CREATE INDEX "site_settings_phones_parent_id_idx" ON "site_settings_phones" USING btree ("_parent_id");
  CREATE INDEX "site_settings_socials_order_idx" ON "site_settings_socials" USING btree ("_order");
  CREATE INDEX "site_settings_socials_parent_id_idx" ON "site_settings_socials" USING btree ("_parent_id");
  CREATE INDEX "site_settings_default_seo_image_idx" ON "site_settings" USING btree ("default_seo_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_children_order_idx" ON "navigation_header_children" USING btree ("_order");
  CREATE INDEX "navigation_header_children_parent_id_idx" ON "navigation_header_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_children_locales_locale_parent_id_unique" ON "navigation_header_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_order_idx" ON "navigation_header" USING btree ("_order");
  CREATE INDEX "navigation_header_parent_id_idx" ON "navigation_header" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_locales_locale_parent_id_unique" ON "navigation_header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_columns_links_locales_locale_parent_id_uni" ON "navigation_footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_columns_locales_locale_parent_id_unique" ON "navigation_footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_legal_order_idx" ON "navigation_legal" USING btree ("_order");
  CREATE INDEX "navigation_legal_parent_id_idx" ON "navigation_legal" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_legal_locales_locale_parent_id_unique" ON "navigation_legal_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_properties_fk" FOREIGN KEY ("properties_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_amenities_fk" FOREIGN KEY ("amenities_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_properties_id_idx" ON "payload_locked_documents_rels" USING btree ("properties_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_cities_id_idx" ON "payload_locked_documents_rels" USING btree ("cities_id");
  CREATE INDEX "payload_locked_documents_rels_amenities_id_idx" ON "payload_locked_documents_rels" USING btree ("amenities_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "properties" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "properties_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_properties_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_properties_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_properties_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline_entries_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_timeline_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_value_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_value_grid_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_value_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_value_grid_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_split_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_property_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_property_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stats_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline_entries_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_timeline_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_value_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_value_grid_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_value_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_value_grid_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_split_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_property_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_property_list_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials_block_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "amenities_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_socials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_legal" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_legal_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "properties" CASCADE;
  DROP TABLE "properties_locales" CASCADE;
  DROP TABLE "properties_rels" CASCADE;
  DROP TABLE "_properties_v" CASCADE;
  DROP TABLE "_properties_v_locales" CASCADE;
  DROP TABLE "_properties_v_rels" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_rich_text_locales" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats_items_locales" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages_blocks_timeline_entries" CASCADE;
  DROP TABLE "pages_blocks_timeline_entries_locales" CASCADE;
  DROP TABLE "pages_blocks_timeline" CASCADE;
  DROP TABLE "pages_blocks_timeline_locales" CASCADE;
  DROP TABLE "pages_blocks_value_grid_items" CASCADE;
  DROP TABLE "pages_blocks_value_grid_items_locales" CASCADE;
  DROP TABLE "pages_blocks_value_grid" CASCADE;
  DROP TABLE "pages_blocks_value_grid_locales" CASCADE;
  DROP TABLE "pages_blocks_service_split" CASCADE;
  DROP TABLE "pages_blocks_service_split_locales" CASCADE;
  DROP TABLE "pages_blocks_property_list" CASCADE;
  DROP TABLE "pages_blocks_property_list_locales" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_gallery_locales" CASCADE;
  DROP TABLE "pages_blocks_testimonials_block" CASCADE;
  DROP TABLE "pages_blocks_testimonials_block_locales" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq_items_locales" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_faq_locales" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_cta_locales" CASCADE;
  DROP TABLE "pages_blocks_contact_form" CASCADE;
  DROP TABLE "pages_blocks_contact_form_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_entries" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_entries_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_timeline_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_value_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_value_grid_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_value_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_value_grid_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_service_split" CASCADE;
  DROP TABLE "_pages_v_blocks_service_split_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_property_list" CASCADE;
  DROP TABLE "_pages_v_blocks_property_list_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_block" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_block_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_form" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_form_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "team_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "leads_rels" CASCADE;
  DROP TABLE "cities" CASCADE;
  DROP TABLE "cities_locales" CASCADE;
  DROP TABLE "amenities" CASCADE;
  DROP TABLE "amenities_locales" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "site_settings_phones" CASCADE;
  DROP TABLE "site_settings_socials" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "navigation_header_children" CASCADE;
  DROP TABLE "navigation_header_children_locales" CASCADE;
  DROP TABLE "navigation_header" CASCADE;
  DROP TABLE "navigation_header_locales" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns_links_locales" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation_footer_columns_locales" CASCADE;
  DROP TABLE "navigation_legal" CASCADE;
  DROP TABLE "navigation_legal_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_properties_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_amenities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  DROP INDEX "payload_locked_documents_rels_properties_id_idx";
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  DROP INDEX "payload_locked_documents_rels_cities_id_idx";
  DROP INDEX "payload_locked_documents_rels_amenities_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "properties_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "amenities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  DROP TYPE "public"."enum_properties_product_line";
  DROP TYPE "public"."enum_properties_kind";
  DROP TYPE "public"."enum_properties_availability";
  DROP TYPE "public"."enum_properties_status";
  DROP TYPE "public"."enum__properties_v_version_product_line";
  DROP TYPE "public"."enum__properties_v_version_kind";
  DROP TYPE "public"."enum__properties_v_version_availability";
  DROP TYPE "public"."enum__properties_v_version_status";
  DROP TYPE "public"."enum__properties_v_published_locale";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_pages_blocks_rich_text_width";
  DROP TYPE "public"."enum_pages_blocks_service_split_image_position";
  DROP TYPE "public"."enum_pages_blocks_property_list_mode";
  DROP TYPE "public"."enum_pages_blocks_property_list_product_line";
  DROP TYPE "public"."enum_pages_blocks_property_list_availability";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_width";
  DROP TYPE "public"."enum__pages_v_blocks_service_split_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_property_list_mode";
  DROP TYPE "public"."enum__pages_v_blocks_property_list_product_line";
  DROP TYPE "public"."enum__pages_v_blocks_property_list_availability";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_leads_type";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_cities_region";
  DROP TYPE "public"."enum_amenities_category";
  DROP TYPE "public"."enum_site_settings_socials_platform";`)
}
