ALTER TABLE `documents` ADD `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `documents` ADD `stripeCheckoutSessionId` varchar(255);--> statement-breakpoint
ALTER TABLE `documents` ADD `paidAt` timestamp;