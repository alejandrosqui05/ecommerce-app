-- Precio original (antes del descuento). Si es NULL o <= price, el producto
-- no está en descuento. Si es mayor que price, se considera en oferta.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(10,2);
