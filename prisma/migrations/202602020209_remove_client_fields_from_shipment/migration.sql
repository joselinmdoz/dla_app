-- Remove client duplicate fields from Shipment table
ALTER TABLE "Shipment" DROP COLUMN IF EXISTS "clientName";
ALTER TABLE "Shipment" DROP COLUMN IF EXISTS "clientPhone";
ALTER TABLE "Shipment" DROP COLUMN IF EXISTS "clientEmail";

-- Make clientId not nullable (already handled by schema, but ensuring constraint)
ALTER TABLE "Shipment" ALTER COLUMN "clientId" SET NOT NULL;
