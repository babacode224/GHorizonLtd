ALTER TABLE `listings` MODIFY COLUMN `purpose` enum('sale','rent','lease','let');--> statement-breakpoint
ALTER TABLE `listings` ADD `estateName` varchar(180);--> statement-breakpoint
ALTER TABLE `listings` ADD `propertyCondition` enum('newly_built','renovated','fairly_used','off_plan');--> statement-breakpoint
ALTER TABLE `listings` ADD `furnishing` enum('unfurnished','semi_furnished','furnished');--> statement-breakpoint
ALTER TABLE `listings` ADD `toilets` int;--> statement-breakpoint
ALTER TABLE `listings` ADD `parkingSpaces` int;--> statement-breakpoint
ALTER TABLE `listings` ADD `floorNumber` int;--> statement-breakpoint
ALTER TABLE `listings` ADD `totalFloors` int;--> statement-breakpoint
ALTER TABLE `listings` ADD `yearBuilt` int;--> statement-breakpoint
ALTER TABLE `listings` ADD `minimumLeaseMonths` int;--> statement-breakpoint
ALTER TABLE `listings` ADD `availableFrom` timestamp;--> statement-breakpoint
ALTER TABLE `listings` ADD `serviceCharge` decimal(18,2);--> statement-breakpoint
ALTER TABLE `listings` ADD `securityDeposit` decimal(18,2);--> statement-breakpoint
ALTER TABLE `listings` ADD `agencyFee` decimal(18,2);--> statement-breakpoint
ALTER TABLE `listings` ADD `legalFee` decimal(18,2);--> statement-breakpoint
ALTER TABLE `listings` ADD `cautionFee` decimal(18,2);