-- 创建门店表
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'KAKAGO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建原材料库存表
CREATE TABLE public.raw_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  current_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_amount DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  usage_per_cup DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建包材库存表
CREATE TABLE public.packaging_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_amount INTEGER NOT NULL DEFAULT 0,
  max_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建补货记录表
CREATE TABLE public.restock_shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  estimated_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- 创建补货清单明细表
CREATE TABLE public.restock_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.restock_shipments(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('raw', 'packaging'))
);

-- 启用 RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restock_items ENABLE ROW LEVEL SECURITY;

-- 公开读取策略（商户端应用）
CREATE POLICY "Allow public read stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public read raw_materials" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "Allow public read packaging_materials" ON public.packaging_materials FOR SELECT USING (true);
CREATE POLICY "Allow public read restock_shipments" ON public.restock_shipments FOR SELECT USING (true);
CREATE POLICY "Allow public read restock_items" ON public.restock_items FOR SELECT USING (true);

-- 公开写入策略（后续可改为需要认证）
CREATE POLICY "Allow public insert restock_shipments" ON public.restock_shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update restock_shipments" ON public.restock_shipments FOR UPDATE USING (true);
CREATE POLICY "Allow public update raw_materials" ON public.raw_materials FOR UPDATE USING (true);
CREATE POLICY "Allow public update packaging_materials" ON public.packaging_materials FOR UPDATE USING (true);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_raw_materials_updated_at
BEFORE UPDATE ON public.raw_materials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packaging_materials_updated_at
BEFORE UPDATE ON public.packaging_materials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();