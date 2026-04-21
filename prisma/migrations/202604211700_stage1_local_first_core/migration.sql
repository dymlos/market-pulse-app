-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "marketplace" TEXT NOT NULL DEFAULT 'mercado-libre',
    "currencyCode" TEXT NOT NULL DEFAULT 'ARS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "externalId" TEXT,
    "sku" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "marketplace" TEXT NOT NULL DEFAULT 'mercado-libre',
    "permalink" TEXT,
    "categoryName" TEXT,
    "brand" TEXT,
    "currentPrice" REAL,
    "availableStock" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListingMetricSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "snapshotDate" DATETIME NOT NULL,
    "visits" INTEGER,
    "salesUnits" INTEGER,
    "conversionRate" REAL,
    "revenue" REAL,
    "availableStock" INTEGER,
    "price" REAL,
    "adSpend" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListingMetricSnapshot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChangeEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "comment" TEXT,
    "actorName" TEXT,
    "hypothesis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChangeEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrackedSearch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "marketplace" TEXT NOT NULL DEFAULT 'mercado-libre',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrackedSearch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sellerHandle" TEXT,
    "marketplaceSellerId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Competitor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackedSearchId" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "resultsCount" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchSnapshot_trackedSearchId_fkey" FOREIGN KEY ("trackedSearchId") REFERENCES "TrackedSearch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchResultItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchSnapshotId" TEXT NOT NULL,
    "competitorId" TEXT,
    "ownListingId" TEXT,
    "position" INTEGER NOT NULL,
    "externalListingId" TEXT,
    "observedTitle" TEXT NOT NULL,
    "observedPrice" REAL,
    "observedSellerName" TEXT,
    "visibleFlags" TEXT,
    "isOwnListing" BOOLEAN NOT NULL DEFAULT false,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "hasFreeShipping" BOOLEAN,
    "hasFull" BOOLEAN,
    "isCatalogListing" BOOLEAN,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchResultItem_searchSnapshotId_fkey" FOREIGN KEY ("searchSnapshotId") REFERENCES "SearchSnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SearchResultItem_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SearchResultItem_ownListingId_fkey" FOREIGN KEY ("ownListingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CsvImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalRows" INTEGER,
    "validRows" INTEGER,
    "invalidRows" INTEGER,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CsvImport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "listingId" TEXT,
    "trackedSearchId" TEXT,
    "type" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'LOW',
    "summary" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Insight_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Insight_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Insight_trackedSearchId_fkey" FOREIGN KEY ("trackedSearchId") REFERENCES "TrackedSearch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OpportunitySignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "listingId" TEXT,
    "trackedSearchId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "explanation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OpportunitySignal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OpportunitySignal_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OpportunitySignal_trackedSearchId_fkey" FOREIGN KEY ("trackedSearchId") REFERENCES "TrackedSearch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Listing_projectId_status_idx" ON "Listing"("projectId", "status");

-- CreateIndex
CREATE INDEX "Listing_projectId_title_idx" ON "Listing"("projectId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_projectId_externalId_key" ON "Listing"("projectId", "externalId");

-- CreateIndex
CREATE INDEX "ListingMetricSnapshot_snapshotDate_idx" ON "ListingMetricSnapshot"("snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "ListingMetricSnapshot_listingId_snapshotDate_key" ON "ListingMetricSnapshot"("listingId", "snapshotDate");

-- CreateIndex
CREATE INDEX "ChangeEvent_listingId_occurredAt_idx" ON "ChangeEvent"("listingId", "occurredAt");

-- CreateIndex
CREATE INDEX "ChangeEvent_type_occurredAt_idx" ON "ChangeEvent"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "TrackedSearch_projectId_isActive_idx" ON "TrackedSearch"("projectId", "isActive");

-- CreateIndex
CREATE INDEX "TrackedSearch_projectId_query_idx" ON "TrackedSearch"("projectId", "query");

-- CreateIndex
CREATE INDEX "Competitor_projectId_name_idx" ON "Competitor"("projectId", "name");

-- CreateIndex
CREATE INDEX "SearchSnapshot_capturedAt_idx" ON "SearchSnapshot"("capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SearchSnapshot_trackedSearchId_capturedAt_key" ON "SearchSnapshot"("trackedSearchId", "capturedAt");

-- CreateIndex
CREATE INDEX "SearchResultItem_competitorId_idx" ON "SearchResultItem"("competitorId");

-- CreateIndex
CREATE INDEX "SearchResultItem_ownListingId_idx" ON "SearchResultItem"("ownListingId");

-- CreateIndex
CREATE INDEX "SearchResultItem_isOwnListing_idx" ON "SearchResultItem"("isOwnListing");

-- CreateIndex
CREATE UNIQUE INDEX "SearchResultItem_searchSnapshotId_position_key" ON "SearchResultItem"("searchSnapshotId", "position");

-- CreateIndex
CREATE INDEX "CsvImport_projectId_importedAt_idx" ON "CsvImport"("projectId", "importedAt");

-- CreateIndex
CREATE INDEX "CsvImport_status_idx" ON "CsvImport"("status");

-- CreateIndex
CREATE INDEX "Insight_projectId_recordedAt_idx" ON "Insight"("projectId", "recordedAt");

-- CreateIndex
CREATE INDEX "Insight_listingId_idx" ON "Insight"("listingId");

-- CreateIndex
CREATE INDEX "Insight_trackedSearchId_idx" ON "Insight"("trackedSearchId");

-- CreateIndex
CREATE INDEX "OpportunitySignal_projectId_status_idx" ON "OpportunitySignal"("projectId", "status");

-- CreateIndex
CREATE INDEX "OpportunitySignal_listingId_idx" ON "OpportunitySignal"("listingId");

-- CreateIndex
CREATE INDEX "OpportunitySignal_trackedSearchId_idx" ON "OpportunitySignal"("trackedSearchId");
