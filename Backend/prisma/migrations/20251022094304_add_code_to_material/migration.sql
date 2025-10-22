/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `materials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `materials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "materials"("code");
