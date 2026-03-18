-- Create ShipmentProduct table for many-to-many relationship
CREATE TABLE "ShipmentProduct" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentProduct_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "ShipmentProduct_shipmentId_idx" ON "ShipmentProduct"("shipmentId");
CREATE INDEX "ShipmentProduct_productId_idx" ON "ShipmentProduct"("productId");

-- Add foreign key constraints
ALTER TABLE "ShipmentProduct"
ADD CONSTRAINT "ShipmentProduct_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShipmentProduct"
ADD CONSTRAINT "ShipmentProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
