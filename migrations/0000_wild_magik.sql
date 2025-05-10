CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"competition_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"category" text NOT NULL,
	"ticket_price" numeric(10, 2) NOT NULL,
	"total_tickets" integer NOT NULL,
	"sold_tickets" integer DEFAULT 0 NOT NULL,
	"end_date" timestamp NOT NULL,
	"featured" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"competition_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"ticket_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"stripe_payment_intent_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
