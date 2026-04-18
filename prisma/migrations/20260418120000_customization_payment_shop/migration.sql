-- Customization: dummy payment + admin-assigned print shop
ALTER TABLE `customizations`
  ADD COLUMN `paymentStatus` VARCHAR(32) NOT NULL DEFAULT 'pending' AFTER `notes`,
  ADD COLUMN `paymentReference` VARCHAR(255) NULL AFTER `paymentStatus`,
  ADD COLUMN `assignedShop` VARCHAR(255) NULL AFTER `paymentReference`;
