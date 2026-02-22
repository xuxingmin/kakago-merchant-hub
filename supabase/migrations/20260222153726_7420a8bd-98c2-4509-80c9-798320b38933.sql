
-- BOM table: defines material consumption per product
CREATE TABLE public.product_bom (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL CHECK (material_type IN ('raw', 'packaging')),
  material_name TEXT NOT NULL,
  quantity_per_cup NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_bom ENABLE ROW LEVEL SECURITY;

-- Admins can manage BOM
CREATE POLICY "Admins can manage BOM"
  ON public.product_bom FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view BOM (needed for inventory calculations)
CREATE POLICY "Anyone can view BOM"
  ON public.product_bom FOR SELECT
  USING (true);

-- Create index
CREATE INDEX idx_product_bom_product ON public.product_bom(product_id);

-- Function: deduct inventory when order status changes to 'delivered'
CREATE OR REPLACE FUNCTION public.deduct_inventory_on_order_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  item RECORD;
  bom RECORD;
  v_store_id UUID;
BEGIN
  -- Only trigger on status change to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    v_store_id := NEW.store_id;
    
    -- Loop through each order item
    FOR item IN 
      SELECT oi.product_id, oi.product_name, oi.quantity 
      FROM order_items oi 
      WHERE oi.order_id = NEW.id
    LOOP
      -- Loop through BOM entries for each product
      FOR bom IN
        SELECT pb.material_type, pb.material_name, pb.quantity_per_cup
        FROM product_bom pb
        WHERE pb.product_id = item.product_id
      LOOP
        IF bom.material_type = 'raw' THEN
          -- Deduct raw materials
          UPDATE raw_materials
          SET current_amount = GREATEST(0, current_amount - (bom.quantity_per_cup * item.quantity))
          WHERE store_id = v_store_id AND name = bom.material_name;
        ELSIF bom.material_type = 'packaging' THEN
          -- Deduct packaging materials
          UPDATE packaging_materials
          SET current_amount = GREATEST(0, current_amount - (bom.quantity_per_cup * item.quantity))
          WHERE store_id = v_store_id AND name = bom.material_name;
        END IF;
        
        -- Log the inventory change
        INSERT INTO inventory_logs (store_id, material_id, material_type, change_type, change_amount, reference_id)
        SELECT 
          v_store_id,
          CASE WHEN bom.material_type = 'raw' 
            THEN (SELECT id FROM raw_materials WHERE store_id = v_store_id AND name = bom.material_name LIMIT 1)
            ELSE (SELECT id FROM packaging_materials WHERE store_id = v_store_id AND name = bom.material_name LIMIT 1)
          END,
          bom.material_type,
          'order_deduct',
          -(bom.quantity_per_cup * item.quantity),
          NEW.id;
      END LOOP;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to orders table
CREATE TRIGGER trg_deduct_inventory_on_order_complete
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_inventory_on_order_complete();
