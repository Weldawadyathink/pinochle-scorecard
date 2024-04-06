CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`last_access` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_name_unique` ON `game` (`name`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `game` (`name`);