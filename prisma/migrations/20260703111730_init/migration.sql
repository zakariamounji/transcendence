-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'OFFLINE', 'IN_BATTLE');

-- CreateEnum
CREATE TYPE "BattleMode" AS ENUM ('SOLO', 'DUO', 'GROUP');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('WAITING', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BattleVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'CPP', 'JAVA', 'PYTHON', 'JAVASCRIPT', 'TYPESCRIPT', 'GO', 'RUST');

-- CreateTable
CREATE TABLE "User" (
    "uid" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT 'Anonymous',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "totalChallengesPlayed" INTEGER NOT NULL DEFAULT 0,
    "totalChallengesCreated" INTEGER NOT NULL DEFAULT 0,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "cid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "languages" "Language"[],
    "expReward" INTEGER NOT NULL DEFAULT 100,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "Battle" (
    "bid" TEXT NOT NULL,
    "mode" "BattleMode" NOT NULL,
    "status" "BattleStatus" NOT NULL DEFAULT 'WAITING',
    "visibility" "BattleVisibility" NOT NULL DEFAULT 'PUBLIC',
    "maxPlayers" INTEGER NOT NULL,
    "roomCode" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 1160,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "creatorId" TEXT NOT NULL,
    "winnerId" TEXT,
    "challengeId" TEXT NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("bid")
);

-- CreateTable
CREATE TABLE "_BattlePlayers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BattlePlayers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_cid_key" ON "Challenge"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_slug_key" ON "Challenge"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_bid_key" ON "Battle"("bid");

-- CreateIndex
CREATE INDEX "_BattlePlayers_B_index" ON "_BattlePlayers"("B");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BattlePlayers" ADD CONSTRAINT "_BattlePlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "Battle"("bid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BattlePlayers" ADD CONSTRAINT "_BattlePlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
