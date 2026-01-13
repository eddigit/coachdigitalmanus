CREATE TABLE `clientRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`requestType` enum('coaching','website','app','ia_integration','optimization','other') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`budget` decimal(10,2),
	`deadline` date,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('pending','in_review','accepted','in_progress','completed','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientSecrets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('api_key','login_password','hosting','domain','other') NOT NULL,
	`description` text,
	`encryptedData` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientSecrets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientUsers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastLogin` timestamp,
	`invitationToken` varchar(64),
	`invitationSentAt` timestamp,
	`passwordResetToken` varchar(64),
	`passwordResetExpires` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientUsers_email_unique` UNIQUE(`email`)
);
