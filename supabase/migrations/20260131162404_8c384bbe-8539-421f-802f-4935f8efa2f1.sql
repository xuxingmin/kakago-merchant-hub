
-- ============================================
-- 第一部分：身份认证系统
-- ============================================

-- 1. 角色枚举
CREATE TYPE public.app_role AS ENUM ('admin', 'store_staff', 'customer');

-- 2. 用户角色表（独立存储防止提权攻击）
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. 会员等级表（需要先创建，profiles 引用它）
CREATE TABLE public.membership_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_points integer NOT NULL DEFAULT 0,
  discount_rate numeric(3,2) DEFAULT 1.0,
  benefits jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.membership_levels ENABLE ROW LEVEL SECURITY;

-- 4. 用户档案表
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  store_id uuid REFERENCES stores(id),
  membership_level_id uuid REFERENCES membership_levels(id),
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. 安全函数：检查用户角色
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. 安全函数：获取用户所属门店
CREATE OR REPLACE FUNCTION public.get_user_store_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id FROM public.profiles WHERE id = _user_id
$$;

-- ============================================
-- 第二部分：扩展门店表 + 门店配置
-- ============================================

-- 7. 扩展现有 stores 表
ALTER TABLE public.stores 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS coordinates text,
  ADD COLUMN IF NOT EXISTS barista_name text,
  ADD COLUMN IF NOT EXISTS intro text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS rating numeric(2,1) DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- 8. 门店证照表
CREATE TABLE public.store_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  doc_type text NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);
ALTER TABLE public.store_documents ENABLE ROW LEVEL SECURITY;

-- 9. 门店配置表
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_online boolean DEFAULT true,
  auto_accept boolean DEFAULT false,
  opening_time time DEFAULT '08:00',
  closing_time time DEFAULT '22:00',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第三部分：商品系统
-- ============================================

-- 10. 全局商品库
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  category text NOT NULL,
  base_price numeric(10,2) NOT NULL,
  image_url text,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 11. 商品规格选项
CREATE TABLE public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  option_type text NOT NULL,
  option_value text NOT NULL,
  price_adjustment numeric(10,2) DEFAULT 0,
  is_default boolean DEFAULT false
);
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

-- 12. 门店商品（可覆盖价格）
CREATE TABLE public.store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  local_price numeric(10,2),
  is_available boolean DEFAULT true,
  stock_count integer,
  UNIQUE (store_id, product_id)
);
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第四部分：订单系统
-- ============================================

-- 13. 订单状态枚举
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'accepted',
  'making',
  'ready',
  'delivering',
  'delivered',
  'cancelled'
);

-- 14. 订单主表
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text UNIQUE NOT NULL,
  store_id uuid REFERENCES stores(id) NOT NULL,
  customer_id uuid REFERENCES auth.users(id),
  status order_status DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL,
  coupon_discount numeric(10,2) DEFAULT 0,
  final_amount numeric(10,2) NOT NULL,
  merchant_share numeric(10,2),
  platform_share numeric(10,2),
  delivery_address text,
  delivery_phone text,
  remark text,
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 15. 订单商品明细
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  options jsonb,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 16. 订单状态日志
CREATE TABLE public.order_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  from_status order_status,
  to_status order_status NOT NULL,
  operator_id uuid REFERENCES auth.users(id),
  note text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.order_status_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第五部分：营销系统
-- ============================================

-- 17. 优惠券模板
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coupon_type text NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) DEFAULT 0,
  valid_days integer DEFAULT 7,
  total_quota integer,
  claimed_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 18. 用户持有券
CREATE TABLE public.user_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coupon_id uuid REFERENCES coupons(id) NOT NULL,
  status text DEFAULT 'available',
  used_order_id uuid REFERENCES orders(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第六部分：评价系统
-- ============================================

-- 19. 用户评价
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) UNIQUE,
  store_id uuid REFERENCES stores(id) NOT NULL,
  customer_id uuid REFERENCES auth.users(id) NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images jsonb,
  is_complaint boolean DEFAULT false,
  status text DEFAULT 'visible',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 20. 商家回复
CREATE TABLE public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) NOT NULL,
  reply_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第七部分：库存日志
-- ============================================

-- 21. 库存变动日志
CREATE TABLE public.inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) NOT NULL,
  material_type text NOT NULL,
  material_id uuid NOT NULL,
  change_type text NOT NULL,
  change_amount numeric NOT NULL,
  before_amount numeric,
  after_amount numeric,
  reference_id uuid,
  operator_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第八部分：财务结算
-- ============================================

-- 22. 结算周期
CREATE TABLE public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_revenue numeric(12,2),
  total_orders integer,
  merchant_share numeric(12,2),
  platform_share numeric(12,2),
  restock_cost numeric(12,2) DEFAULT 0,
  final_payout numeric(12,2),
  status text DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第九部分：RLS 策略
-- ============================================

-- user_roles 策略
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles 策略
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- membership_levels 策略（公开读取）
CREATE POLICY "Anyone can view membership levels" ON public.membership_levels
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage membership levels" ON public.membership_levels
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- store_documents 策略
CREATE POLICY "Store staff can view own store docs" ON public.store_documents
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can manage own store docs" ON public.store_documents
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- store_settings 策略
CREATE POLICY "Store staff can view own store settings" ON public.store_settings
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can update own store settings" ON public.store_settings
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can insert own store settings" ON public.store_settings
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- products 策略（公开读取）
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- product_options 策略
CREATE POLICY "Anyone can view product options" ON public.product_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage product options" ON public.product_options
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- store_products 策略
CREATE POLICY "Anyone can view available store products" ON public.store_products
  FOR SELECT USING (true);

CREATE POLICY "Store staff can manage own store products" ON public.store_products
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- orders 策略
CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT TO authenticated USING (customer_id = auth.uid());

CREATE POLICY "Store staff can view store orders" ON public.orders
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Customers can create orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Store staff can update store orders" ON public.orders
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- order_items 策略
CREATE POLICY "Users can view order items for accessible orders" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR orders.store_id = public.get_user_store_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Customers can insert order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

-- order_status_logs 策略
CREATE POLICY "Users can view logs for accessible orders" ON public.order_status_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_status_logs.order_id
      AND (orders.customer_id = auth.uid() OR orders.store_id = public.get_user_store_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Staff can insert order logs" ON public.order_status_logs
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_logs.order_id AND orders.store_id = public.get_user_store_id(auth.uid()))
  );

-- coupons 策略
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_coupons 策略
CREATE POLICY "Users can view own coupons" ON public.user_coupons
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can claim coupons" ON public.user_coupons
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can use own coupons" ON public.user_coupons
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- reviews 策略
CREATE POLICY "Anyone can view visible reviews" ON public.reviews
  FOR SELECT USING (status = 'visible' OR customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can create reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- review_replies 策略
CREATE POLICY "Anyone can view review replies" ON public.review_replies
  FOR SELECT USING (true);

CREATE POLICY "Store staff can reply to store reviews" ON public.review_replies
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- inventory_logs 策略
CREATE POLICY "Store staff can view own store logs" ON public.inventory_logs
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Store staff can insert own store logs" ON public.inventory_logs
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

-- settlements 策略
CREATE POLICY "Store staff can view own store settlements" ON public.settlements
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    store_id = public.get_user_store_id(auth.uid())
  );

CREATE POLICY "Admins can manage settlements" ON public.settlements
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 第十部分：触发器
-- ============================================

-- profiles 更新时间戳触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- store_settings 更新时间戳触发器
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 启用 realtime 订阅
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_logs;
