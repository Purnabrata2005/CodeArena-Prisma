-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authProvider" TEXT;

-- CreateTable
CREATE TABLE "DiscussionTable" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "massage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscussionTable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscussionTable" ADD CONSTRAINT "DiscussionTable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionTable" ADD CONSTRAINT "DiscussionTable_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
