-- Alter Tour: add min/max persons columns with defaults
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "minPersonsPerBooking" INTEGER NOT NULL DEFAULT 1,
    "maxPersonsPerBooking" INTEGER NOT NULL DEFAULT 6,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tour" ("id","title","description","durationMin","priceCents","capacity","imageUrl","imageAlt","createdAt","updatedAt")
  SELECT "id","title","description","durationMin","priceCents","capacity","imageUrl","imageAlt","createdAt","updatedAt" FROM "Tour";
DROP TABLE "Tour";
ALTER TABLE "new_Tour" RENAME TO "Tour";

-- Alter Booking: add nullable code and unique index
ALTER TABLE "Booking" ADD COLUMN "code" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_code_key" ON "Booking"("code");
PRAGMA foreign_keys=ON;
