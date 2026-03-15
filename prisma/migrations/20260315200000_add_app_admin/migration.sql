-- CreateTable
CREATE TABLE "AppAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppAdmin_email_key" ON "AppAdmin"("email");

-- Seed initial admin
INSERT INTO "AppAdmin" ("id", "email", "createdAt") VALUES ('admin_gonelf', 'gonelf@gmail.com', NOW());
