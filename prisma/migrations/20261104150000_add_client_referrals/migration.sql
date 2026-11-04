-- Keep existing installations aligned with the Client model without changing data.
ALTER TABLE "Client"
ADD COLUMN IF NOT EXISTS "referralCode" TEXT;

ALTER TABLE "Client"
ADD COLUMN IF NOT EXISTS "referredById" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Client_referralCode_key"
ON "Client"("referralCode");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Client_referredById_fkey'
  ) THEN
    ALTER TABLE "Client"
    ADD CONSTRAINT "Client_referredById_fkey"
    FOREIGN KEY ("referredById") REFERENCES "Client"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
