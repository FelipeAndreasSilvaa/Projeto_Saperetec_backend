-- CreateEnum
CREATE TYPE "Role" AS ENUM ('technician', 'supervisor', 'admin');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('open', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "flx_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flx_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flx_work_orders" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'open',
    "priority" "Priority" NOT NULL DEFAULT 'low',
    "resolutionNotes" TEXT,
    "teamId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "assigneeId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flx_work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flx_checklist_items" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "workOrderId" UUID NOT NULL,

    CONSTRAINT "flx_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flx_work_order_events" (
    "id" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "fromStatus" "WorkOrderStatus",
    "toStatus" "WorkOrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flx_work_order_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flx_users_email_key" ON "flx_users"("email");

-- CreateIndex
CREATE INDEX "flx_work_orders_teamId_idx" ON "flx_work_orders"("teamId");

-- CreateIndex
CREATE INDEX "flx_work_orders_assigneeId_idx" ON "flx_work_orders"("assigneeId");

-- CreateIndex
CREATE INDEX "flx_work_orders_status_idx" ON "flx_work_orders"("status");

-- CreateIndex
CREATE INDEX "flx_work_orders_priority_idx" ON "flx_work_orders"("priority");

-- CreateIndex
CREATE INDEX "flx_work_orders_createdAt_idx" ON "flx_work_orders"("createdAt");

-- CreateIndex
CREATE INDEX "flx_work_order_events_workOrderId_idx" ON "flx_work_order_events"("workOrderId");

-- CreateIndex
CREATE INDEX "flx_work_order_events_actorId_idx" ON "flx_work_order_events"("actorId");

-- AddForeignKey
ALTER TABLE "flx_work_orders" ADD CONSTRAINT "flx_work_orders_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "flx_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flx_checklist_items" ADD CONSTRAINT "flx_checklist_items_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "flx_work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flx_work_order_events" ADD CONSTRAINT "flx_work_order_events_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "flx_work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flx_work_order_events" ADD CONSTRAINT "flx_work_order_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "flx_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
