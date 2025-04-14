/*
  Warnings:

  - You are about to drop the column `name` on the `permissions` table. All the data in the column will be lost.
  - Added the required column `action` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "permissions_name_key";

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "name",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;
