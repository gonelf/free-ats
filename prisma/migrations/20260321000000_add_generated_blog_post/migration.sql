-- CreateTable
CREATE TABLE "GeneratedBlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "readingTime" TEXT NOT NULL,
    "planDay" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedBlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedBlogPost_slug_key" ON "GeneratedBlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedBlogPost_planDay_key" ON "GeneratedBlogPost"("planDay");

-- CreateIndex
CREATE INDEX "GeneratedBlogPost_planDay_idx" ON "GeneratedBlogPost"("planDay");

-- CreateIndex
CREATE INDEX "GeneratedBlogPost_publishedAt_idx" ON "GeneratedBlogPost"("publishedAt");
