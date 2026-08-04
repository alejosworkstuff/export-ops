-- CreateIndex
CREATE UNIQUE INDEX "AlertEvent_userId_kind_threshold_key" ON "AlertEvent"("userId", "kind", "threshold");
