CREATE TABLE "PropertyTypeImage" (
  "id" TEXT NOT NULL,
  "propertyType" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "caption" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PropertyTypeImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PropertyTypeImage_propertyType_sortOrder_idx"
  ON "PropertyTypeImage"("propertyType", "sortOrder");
