CREATE TABLE `contact_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`intent` enum('buy','sell','consult') NOT NULL,
	`fullName` varchar(120) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL,
	`propertyInterest` varchar(80),
	`details` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspection_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestedDate` timestamp NOT NULL,
	`timeSlot` varchar(16) NOT NULL,
	`attendanceMode` enum('in_person','virtual') NOT NULL,
	`fullName` varchar(120) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspection_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`actorUserId` int,
	`action` enum('submitted','approved','rejected','deleted','admin_published') NOT NULL,
	`oldStatus` enum('pending','approved','rejected'),
	`newStatus` enum('pending','approved','rejected'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`contentType` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listing_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`altText` varchar(280),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listing_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`kind` enum('property','vehicle') NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`purpose` enum('sale','rent'),
	`featured` boolean NOT NULL DEFAULT false,
	`createdByAdmin` boolean NOT NULL DEFAULT false,
	`ownerName` varchar(120) NOT NULL,
	`ownerPhone` varchar(32) NOT NULL,
	`ownerEmail` varchar(320),
	`sourceTitle` varchar(220) NOT NULL,
	`description` text,
	`price` decimal(18,2) NOT NULL,
	`location` varchar(220) NOT NULL,
	`city` varchar(120),
	`youtubeVideoId` varchar(32),
	`propertyType` enum('land','house','apartment','commercial'),
	`propertyTitleType` enum('certificate_of_occupancy','gazette','survey_plan','deed_of_assignment','governors_consent'),
	`landmarks` text,
	`sizeSqm` decimal(14,2),
	`bedrooms` int,
	`bathrooms` int,
	`rentPeriod` enum('month','year'),
	`features` text,
	`make` varchar(80),
	`model` varchar(100),
	`vehicleYear` int,
	`trim` varchar(120),
	`color` varchar(80),
	`vin` varchar(17),
	`vehicleCondition` enum('brand_new','foreign_used','locally_used'),
	`mileageKm` bigint,
	`conditionScore` int,
	`clearingPaperUrl` varchar(1024),
	`clearingPaperKey` varchar(512),
	`adminTitle` varchar(220),
	`adminDescription` text,
	`adminPrice` decimal(18,2),
	`adminNotes` text,
	`rejectionReason` text,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`),
	CONSTRAINT `listings_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `contact_requests_created_idx` ON `contact_requests` (`createdAt`);--> statement-breakpoint
CREATE INDEX `inspection_requests_date_idx` ON `inspection_requests` (`requestedDate`);--> statement-breakpoint
CREATE INDEX `listing_audit_log_listing_idx` ON `listing_audit_log` (`listingId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `listing_documents_listing_idx` ON `listing_documents` (`listingId`);--> statement-breakpoint
CREATE INDEX `listing_images_listing_idx` ON `listing_images` (`listingId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `listings_public_feed_idx` ON `listings` (`kind`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `listings_admin_queue_idx` ON `listings` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `listings_location_idx` ON `listings` (`city`,`location`);--> statement-breakpoint
CREATE INDEX `listings_price_idx` ON `listings` (`price`);