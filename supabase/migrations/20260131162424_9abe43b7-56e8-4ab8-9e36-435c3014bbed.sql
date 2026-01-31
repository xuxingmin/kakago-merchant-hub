
-- 修复旧的 RLS 策略

-- 删除旧的过于宽松的策略
DROP POLICY IF EXISTS "Allow public read packaging_materials" ON public.packaging_materials;
DROP POLICY IF EXISTS "Allow public update packaging_materials" ON public.packaging_materials;
DROP POLICY IF EXISTS "Allow public read raw_materials" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public update raw_materials" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public read restock_items" ON public.restock_items;
DROP POLICY IF EXISTS "Allow public read restock_shipments" ON public.restock_shipments;
DROP POLICY IF EXISTS "Allow public insert restock_shipments" ON public.restock_shipments;
DROP POLICY IF EXISTS "Allow public update restock_shipments" ON public.restock_shipments;
DROP POLICY IF EXISTS "Allow public read stores" ON public.stores;

-- 创建新的基于角色的策略

-- packaging_materials 策略
CREATE POLICY "Store staff can view store packaging" ON public.packaging_materials
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can update store packaging" ON public.packaging_materials
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- raw_materials 策略
CREATE POLICY "Store staff can view store raw materials" ON public.raw_materials
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can update store raw materials" ON public.raw_materials
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- restock_items 策略
CREATE POLICY "Store staff can view store restock items" ON public.restock_items
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    EXISTS (
      SELECT 1 FROM restock_shipments 
      WHERE restock_shipments.id = restock_items.shipment_id 
      AND restock_shipments.store_id = public.get_user_store_id(auth.uid())
    )
  );

-- restock_shipments 策略
CREATE POLICY "Store staff can view store shipments" ON public.restock_shipments
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can create store shipments" ON public.restock_shipments
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can update store shipments" ON public.restock_shipments
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- stores 策略
CREATE POLICY "Public can view approved stores" ON public.stores
  FOR SELECT USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Store staff can update own store" ON public.stores
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    id = public.get_user_store_id(auth.uid())
  );

-- 修复 update_updated_at_column 函数的 search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
