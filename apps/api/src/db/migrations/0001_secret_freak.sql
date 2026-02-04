CREATE TYPE "public"."account_user_role_enum" AS ENUM('Owner', 'Editor', 'Viewer');--> statement-breakpoint
CREATE TYPE "public"."budget_period_enum" AS ENUM('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom');--> statement-breakpoint
CREATE TYPE "public"."budget_role_enum" AS ENUM('Owner', 'Collaborator', 'Viewer');--> statement-breakpoint
CREATE TYPE "public"."category_type_enum" AS ENUM('Income', 'Expense', 'Transfer', 'Investment', 'Other');--> statement-breakpoint
CREATE TYPE "public"."icon_type_enum" AS ENUM('SVG', 'PNG', 'JPEG', 'ICON_FONT', 'URL');--> statement-breakpoint
CREATE TYPE "public"."recurrence_cadence_enum" AS ENUM('Never', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom');--> statement-breakpoint
CREATE TYPE "public"."transaction_type_enum" AS ENUM('Income', 'Expense', 'Transfer', 'Investment', 'Other');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	CONSTRAINT "account_types_type_name_unique" UNIQUE("type_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"customized_name" varchar(255),
	"bank_id" uuid NOT NULL,
	"icon_url" varchar(500),
	"account_type_id" uuid NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "account_user_role_enum" DEFAULT 'Viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" jsonb NOT NULL,
	"report_message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"country_code" varchar,
	"open_finance_integrated" boolean DEFAULT false,
	"bank_url" varchar(255),
	"description" varchar(255),
	"country_flag" varchar(10),
	"account_type" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	CONSTRAINT "banks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "banks_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"integration_status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"api_token" varchar(500),
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dynamic_banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"banner" jsonb NOT NULL,
	"visible" boolean DEFAULT true,
	"language" varchar(5),
	"app_version" varchar(20),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "budget_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"budget_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "budgets_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_recurrent" boolean DEFAULT true NOT NULL,
	"custom_name" text,
	"budget_amount" numeric,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"type" "category_type_enum" NOT NULL,
	"name" text,
	"icon_url" varchar(500),
	"icon_emoji" varchar,
	"color_id" integer,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"hex_value" varchar(7) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"source" text NOT NULL,
	"page" integer,
	"chunk_index" integer NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "category_type_enum" NOT NULL,
	"parent_id" uuid,
	"name" text,
	"icon_url" text,
	"color_id" integer,
	"is_visible" boolean DEFAULT true,
	"order_priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "icons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "icon_type_enum" DEFAULT 'SVG' NOT NULL,
	"url" varchar(500) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	CONSTRAINT "icons_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(255),
	"avatar_url" text,
	"email" varchar(255),
	"currency" varchar(3) DEFAULT 'USD',
	"country" varchar(2),
	"timezone" varchar(50),
	"language" varchar(5) DEFAULT 'en',
	"phone" varchar(50),
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"device_properties" jsonb,
	"user_consent" jsonb,
	"has_user_clicked_rate_modal" boolean DEFAULT false,
	"last_shown_rating_milestone" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"from_account_id" uuid,
	"to_account_id" uuid,
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"transaction_type" "transaction_type_enum" NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"description" varchar(500),
	"icon_url" varchar(500),
	"category_id" uuid,
	"is_recurring" boolean DEFAULT false,
	"recurrence_cadence" "recurrence_cadence_enum",
	"recurrence_end_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_account_type_id_account_types_id_fk" FOREIGN KEY ("account_type_id") REFERENCES "public"."account_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts_users" ADD CONSTRAINT "accounts_users_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "banks_users" ADD CONSTRAINT "banks_users_bank_id_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."banks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "banks_users" ADD CONSTRAINT "banks_users_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budget_id_budgets_users_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_category_id_categories_users_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories_users" ADD CONSTRAINT "categories_users_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories_users" ADD CONSTRAINT "categories_users_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_users_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_chunks_embedding_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "document_chunks_source_idx" ON "document_chunks" USING btree ("source");