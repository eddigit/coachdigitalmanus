CREATE TABLE `projectNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`tags` varchar(500),
	`isPinned` boolean DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectVariables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`description` text,
	`isSecret` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projectVariables_id` PRIMARY KEY(`id`)
);
