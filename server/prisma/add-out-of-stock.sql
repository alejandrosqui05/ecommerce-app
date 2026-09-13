-- Estado "agotado": el producto sigue visible en la tienda (a diferencia de
-- isActive, que lo oculta por completo), pero se marca sin stock y no se
-- puede agregar al carrito.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isOutOfStock" BOOLEAN NOT NULL DEFAULT false;
