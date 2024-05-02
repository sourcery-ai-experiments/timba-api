-- CreateTable
CREATE TABLE `PASSWORD_RESET_TOKENS` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(344) NOT NULL,
    `player_id` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PASSWORD_RESET_TOKENS` ADD CONSTRAINT `PASSWORD_RESET_TOKENS_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `PLAYERS`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;