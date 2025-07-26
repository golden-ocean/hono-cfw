CREATE TABLE `sys_dictionary_item` (
	`dictionary_id` text DEFAULT 'rootid000000000000000000' NOT NULL,
	`label` text(32) DEFAULT '' NOT NULL,
	`value` text(64) DEFAULT '' NOT NULL,
	`color` text(32) DEFAULT '',
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE INDEX `sys_dictionary_item_status_idx` ON `sys_dictionary_item` (`status`);--> statement-breakpoint
CREATE INDEX `sys_dictionary_item_dictionary_id_idx` ON `sys_dictionary_item` (`dictionary_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_dict_item_dictionary_id_label_unique` ON `sys_dictionary_item` (`dictionary_id`,`label`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_dict_item_dictionary_id_value_unique` ON `sys_dictionary_item` (`dictionary_id`,`value`);--> statement-breakpoint
CREATE TABLE `sys_dictionary` (
	`name` text(32) NOT NULL,
	`code` text(64) NOT NULL,
	`build_in` integer DEFAULT false NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sys_dictionary_name_unique` ON `sys_dictionary` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_dictionary_code_unique` ON `sys_dictionary` (`code`);--> statement-breakpoint
CREATE INDEX `sys_dictionary_status_idx` ON `sys_dictionary` (`status`);--> statement-breakpoint
CREATE TABLE `sys_operation_log` (
	`method` text DEFAULT '',
	`path` text DEFAULT '',
	`content` text DEFAULT '' NOT NULL,
	`ip_address` text(64) DEFAULT '',
	`user_agent` text(256) DEFAULT '',
	`duration` integer DEFAULT 0,
	`error_message` text DEFAULT '',
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text
);
--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `sys_operation_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `sys_operation_log` (`created_by`);--> statement-breakpoint
CREATE TABLE `sys_organization` (
	`parent_id` text DEFAULT 'rootid000000000000000000' NOT NULL,
	`name` text(32) NOT NULL,
	`code` text(64) NOT NULL,
	`contact` text(32) DEFAULT '' NOT NULL,
	`phone` text(32) DEFAULT '' NOT NULL,
	`email` text(128) DEFAULT '' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sys_organization_name_unique` ON `sys_organization` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_organization_code_unique` ON `sys_organization` (`code`);--> statement-breakpoint
CREATE INDEX `sys_organization_parent_idx` ON `sys_organization` (`parent_id`);--> statement-breakpoint
CREATE INDEX `sys_organization_status_idx` ON `sys_organization` (`status`);--> statement-breakpoint
CREATE TABLE `sys_permission` (
	`parent_id` text DEFAULT 'rootid000000000000000000' NOT NULL,
	`name` text(32) NOT NULL,
	`code` text DEFAULT '' NOT NULL,
	`icon` text DEFAULT '' NOT NULL,
	`path` text DEFAULT '' NOT NULL,
	`component` text DEFAULT '' NOT NULL,
	`type` text DEFAULT 'Menu' NOT NULL,
	`method` text DEFAULT 'GET' NOT NULL,
	`visible` text DEFAULT 'Enable' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sys_permission_name_unique` ON `sys_permission` (`name`);--> statement-breakpoint
CREATE INDEX `sys_permission_parent_id_idx` ON `sys_permission` (`parent_id`);--> statement-breakpoint
CREATE INDEX `sys_permission_type_idx` ON `sys_permission` (`type`);--> statement-breakpoint
CREATE INDEX `sys_permission_status_idx` ON `sys_permission` (`status`);--> statement-breakpoint
CREATE TABLE `sys_position_role` (
	`position_id` text NOT NULL,
	`role_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	PRIMARY KEY(`position_id`, `role_id`)
);
--> statement-breakpoint
CREATE INDEX `sys_position_role_position_idx` ON `sys_position_role` (`position_id`);--> statement-breakpoint
CREATE INDEX `sys_position_role_role_idx` ON `sys_position_role` (`role_id`);--> statement-breakpoint
CREATE TABLE `sys_position` (
	`name` text(32) NOT NULL,
	`code` text(64) NOT NULL,
	`organization_id` text DEFAULT 'rootid000000000000000000' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sys_position_name_unique` ON `sys_position` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_position_code_unique` ON `sys_position` (`code`);--> statement-breakpoint
CREATE INDEX `sys_position_status_idx` ON `sys_position` (`status`);--> statement-breakpoint
CREATE INDEX `sys_position_organization_id_idx` ON `sys_position` (`organization_id`);--> statement-breakpoint
CREATE TABLE `sys_role_permission` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	PRIMARY KEY(`role_id`, `permission_id`)
);
--> statement-breakpoint
CREATE INDEX `sys_role_permission_role_idx` ON `sys_role_permission` (`role_id`);--> statement-breakpoint
CREATE INDEX `sys_role_permission_permission_idx` ON `sys_role_permission` (`permission_id`);--> statement-breakpoint
CREATE TABLE `sys_role` (
	`name` text(32) NOT NULL,
	`code` text(64) NOT NULL,
	`type` text DEFAULT 'Business' NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sys_role_name_unique` ON `sys_role` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_role_code_unique` ON `sys_role` (`code`);--> statement-breakpoint
CREATE INDEX `sys_role_status_idx` ON `sys_role` (`status`);--> statement-breakpoint
CREATE TABLE `sys_staff_position` (
	`staff_id` text NOT NULL,
	`position_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_by` text,
	PRIMARY KEY(`staff_id`, `position_id`)
);
--> statement-breakpoint
CREATE INDEX `sys_staff_position_staff_idx` ON `sys_staff_position` (`staff_id`);--> statement-breakpoint
CREATE INDEX `sys_staff_position_position_idx` ON `sys_staff_position` (`position_id`);--> statement-breakpoint
CREATE TABLE `sys_staff` (
	`username` text(64) NOT NULL,
	`password` text(64) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`salt` text(64) DEFAULT '' NOT NULL,
	`staff_no` text(32) DEFAULT '' NOT NULL,
	`name` text(32) DEFAULT '' NOT NULL,
	`email` text(128) NOT NULL,
	`mobile` text(32) NOT NULL,
	`avatar` text(256),
	`gender` text DEFAULT 'Unknown' NOT NULL,
	`organization_id` text DEFAULT 'rootid000000000000000000',
	`position_id` text,
	`work_status` text,
	`data_scope` text,
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'Enable' NOT NULL,
	`sort` integer DEFAULT 1000 NOT NULL,
	`remark` text DEFAULT '' NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sys_staff_username_unique` ON `sys_staff` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_staff_email_unique` ON `sys_staff` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `sys_staff_mobile_unique` ON `sys_staff` (`mobile`);--> statement-breakpoint
CREATE INDEX `sys_staff_username_idx` ON `sys_staff` (`username`);--> statement-breakpoint
CREATE INDEX `sys_staff_email_idx` ON `sys_staff` (`email`);--> statement-breakpoint
CREATE INDEX `sys_staff_mobile_idx` ON `sys_staff` (`mobile`);--> statement-breakpoint
CREATE INDEX `sys_staff_status_idx` ON `sys_staff` (`status`);--> statement-breakpoint
CREATE INDEX `sys_staff_organization_id_idx` ON `sys_staff` (`organization_id`);