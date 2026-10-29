CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`fullname` text DEFAULT '' NOT NULL,
	`perm_products` integer DEFAULT 0 NOT NULL,
	`perm_categories` integer DEFAULT 0 NOT NULL,
	`perm_transactions` integer DEFAULT 0 NOT NULL,
	`perm_users` integer DEFAULT 0 NOT NULL,
	`perm_settings` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`stock` integer DEFAULT 1 NOT NULL,
	`img` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`app` text DEFAULT 'Standalone Point of Sale' NOT NULL,
	`store` text DEFAULT '' NOT NULL,
	`address_one` text DEFAULT '' NOT NULL,
	`address_two` text DEFAULT '' NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`tax` text DEFAULT '' NOT NULL,
	`symbol` text DEFAULT '$' NOT NULL,
	`percentage` real DEFAULT 0 NOT NULL,
	`charge_tax` integer DEFAULT 0 NOT NULL,
	`footer` text DEFAULT '' NOT NULL,
	`img` text DEFAULT '' NOT NULL,
	`till` integer DEFAULT 1 NOT NULL,
	`server_ip` text DEFAULT '' NOT NULL,
	`pexels_api_key` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media_library` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`source` text DEFAULT 'upload' NOT NULL,
	`pexels_id` integer,
	`photographer` text DEFAULT '' NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_library_filename_unique` ON `media_library` (`filename`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref_number` text DEFAULT '' NOT NULL,
	`customer` text DEFAULT '0' NOT NULL,
	`customer_name` text DEFAULT '' NOT NULL,
	`status` integer DEFAULT 1 NOT NULL,
	`user_id` integer DEFAULT 0 NOT NULL,
	`user_name` text DEFAULT '' NOT NULL,
	`till` integer DEFAULT 1 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`tax` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`paid` real DEFAULT 0 NOT NULL,
	`change` real DEFAULT 0 NOT NULL,
	`payment_type` integer DEFAULT 1 NOT NULL,
	`items_json` text DEFAULT '[]' NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_date` ON `transactions` (`date`);--> statement-breakpoint
CREATE INDEX `idx_transactions_status` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_transactions_user` ON `transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_transactions_till` ON `transactions` (`till`);

--> statement-breakpoint
-- Seed default admin user (password: admin, bcrypt cost 10)
INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `perm_products`, `perm_categories`, `perm_transactions`, `perm_users`, `perm_settings`)
VALUES (1, 'admin', '$2a$10$y4Ja.fuyRw6tRLYWdEvfNO7wSyzRT9kQ2IjcZNGk.gMygdAGYbZhy', 'Administrator', 1, 1, 1, 1, 1);

--> statement-breakpoint
-- Seed default settings
INSERT INTO `settings` (`id`, `app`, `store`, `symbol`, `percentage`, `charge_tax`, `till`)
VALUES (1, 'Standalone Point of Sale', 'My Store', '$', 0, 0, 1);

--> statement-breakpoint
-- Seed walk-in customer
INSERT INTO `customers` (`name`, `phone`, `email`, `address`)
VALUES ('Walk-in Customer', '', '', '');