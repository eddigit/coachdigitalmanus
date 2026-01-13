CREATE TABLE `credentialAccessLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`credentialId` int NOT NULL,
	`accessedBy` int NOT NULL,
	`accessType` enum('view','edit','delete') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`accessedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credentialAccessLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`category` enum('hosting','api','smtp','domain','cms','database','other') NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`encryptedData` text NOT NULL,
	`url` text,
	`expiresAt` timestamp,
	`notes` text,
	`sharedBy` int,
	`sharedAt` timestamp,
	`lastAccessedBy` int,
	`lastAccessedAt` timestamp,
	`accessCount` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectCredentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectRequirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`title` varchar(255) NOT NULL,
	`description` text,
	`objectives` text,
	`scope` text,
	`constraints` text,
	`deliverables` text,
	`timeline` text,
	`budget` decimal(10,2),
	`status` enum('draft','review','approved','archived') NOT NULL DEFAULT 'draft',
	`approvedAt` timestamp,
	`approvedBy` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectRequirements_id` PRIMARY KEY(`id`)
);
