-- CreateTable
CREATE TABLE "face_ids" (
    "id" SERIAL NOT NULL,
    "faceId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL DEFAULT 'coffetek-faces',
    "externalImageId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "face_ids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "face_ids_faceId_key" ON "face_ids"("faceId");

-- CreateIndex
CREATE UNIQUE INDEX "face_ids_userId_key" ON "face_ids"("userId");

-- AddForeignKey
ALTER TABLE "face_ids" ADD CONSTRAINT "face_ids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
