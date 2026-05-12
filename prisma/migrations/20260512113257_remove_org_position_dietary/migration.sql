/*
  Warnings:

  - You are about to drop the column `dietaryRequirement` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `organization` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Registration` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Registration" ("createdAt", "email", "fullName", "id", "passwordHash", "phone", "referenceCode", "updatedAt") SELECT "createdAt", "email", "fullName", "id", "passwordHash", "phone", "referenceCode", "updatedAt" FROM "Registration";
DROP TABLE "Registration";
ALTER TABLE "new_Registration" RENAME TO "Registration";
CREATE UNIQUE INDEX "Registration_referenceCode_key" ON "Registration"("referenceCode");
CREATE INDEX "Registration_email_idx" ON "Registration"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
