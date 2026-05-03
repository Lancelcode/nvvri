-- CreateTable
CREATE TABLE "Nursery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ofsted" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "hours" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviews" INTEGER NOT NULL,
    "spaces" INTEGER NOT NULL,
    "tags" TEXT[],
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nursery_pkey" PRIMARY KEY ("id")
);
