
# 三端数据库统一架构方案（完整业务流程版）

## 一、当前状态总结

### 门店端（本项目）已有功能
| 模块 | 功能 | 数据表状态 |
|------|------|-----------|
| 工作台 | 接单、制作、配送流转 | 未持久化 |
| 数据 | 利润、出杯、评价展示 | 未持久化 |
| 库存 | 原材料/包材管理、补货 | 已有表 |
| 个人中心 | 门店资料、入驻申请 | 部分持久化 |

### 客户端功能需求
- 商品浏览与下单
- 订单追踪
- 优惠券/会员系统
- 用户评价

### 公司后台功能需求
- 门店管理（审核入驻、配置、权限）
- 商品/菜单管理（SKU、定价、上下架）
- 订单/财务（全局监控、分润结算、报表）
- 供应链/补货（审核申请、物流调度、库存预警）
- 客户评价管理、投诉预警

---

## 二、统一数据库架构设计

### 2.1 核心数据表规划

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          统一数据库架构                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  【身份认证层】                                                               │
│  ├── auth.users (Supabase 内置)                                             │
│  ├── user_roles (admin / store_staff / customer)                           │
│  └── profiles (用户详情 + 门店关联)                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  【门店管理】                                                                 │
│  ├── stores (门店基础信息 + 审核状态)                                        │
│  ├── store_settings (营业时间、自动接单等配置)                               │
│  └── store_documents (证照上传记录)                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  【商品管理】                                                                 │
│  ├── products (全局商品库)                                                   │
│  ├── product_options (规格: 冰/热、大小杯)                                   │
│  └── store_products (门店上架商品 + 本地定价)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  【订单系统】                                                                 │
│  ├── orders (订单主表)                                                       │
│  ├── order_items (订单商品明细)                                              │
│  └── order_status_logs (状态变更日志)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  【营销系统】                                                                 │
│  ├── coupons (优惠券模板)                                                    │
│  ├── user_coupons (用户持有券)                                               │
│  └── membership_levels (会员等级定义)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  【评价系统】                                                                 │
│  ├── reviews (用户评价)                                                      │
│  └── review_replies (商家回复)                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  【库存供应链】                                                               │
│  ├── raw_materials (原材料 - 已有)                                           │
│  ├── packaging_materials (包材 - 已有)                                       │
│  ├── restock_shipments (补货单 - 已有)                                       │
│  ├── restock_items (补货明细 - 已有)                                         │
│  └── inventory_logs (库存变动日志)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  【财务结算】                                                                 │
│  ├── settlements (结算周期)                                                  │
│  └── settlement_details (结算明细)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心业务流程数据流

```text
【完整订单生命周期】

客户端                    门店端                    公司后台
   │                        │                        │
   │  1. 浏览商品            │                        │
   │  ← products ←──────────┼────────────────────────┤ 商品管理
   │                        │                        │
   │  2. 提交订单            │                        │
   │  → orders ─────────────┼→ 实时推送新订单         │
   │                        │                        │
   │                        │  3. 接单/制作           │
   │                        │  → order_status_logs   │
   │                        │                        │
   │                        │  4. 完成制作            │
   │                        │  → 扣减库存             │
   │                        │  raw_materials -=      │
   │                        │                        │
   │  5. 追踪配送            │                        │
   │  ← orders.status ←─────┤                        │
   │                        │                        │
   │  6. 完成评价            │                        │
   │  → reviews ────────────┼──────────────────────→│ 评价监控
   │                        │                        │
   │                        │                        │  7. 周期结算
   │                        │                        │  settlements
   │                        │                        │  ↓
   │                        │  ← 分润入账 ←───────────┤
```

---

## 三、详细表结构设计

### 3.1 身份认证系统

```sql
-- 角色枚举
CREATE TYPE public.app_role AS ENUM ('admin', 'store_staff', 'customer');

-- 用户角色表（独立存储防止提权攻击）
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 用户档案表
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  store_id uuid REFERENCES stores(id),  -- 店员关联门店
  membership_level_id uuid,              -- 客户会员等级
  points integer DEFAULT 0,              -- 客户积分
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3.2 门店管理

```sql
-- 扩展现有 stores 表
ALTER TABLE stores ADD COLUMN IF NOT EXISTS
  status text DEFAULT 'pending',        -- pending/approved/suspended
  contact_phone text,
  address text,
  coordinates text,                      -- 高德经纬度
  barista_name text,
  intro text,
  message text,
  rating numeric(2,1) DEFAULT 5.0,
  total_orders integer DEFAULT 0,
  approved_at timestamptz;

-- 门店证照
CREATE TABLE public.store_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  doc_type text NOT NULL,               -- license/food_permit/health_cert/photos
  file_url text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- 门店配置
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE UNIQUE,
  is_online boolean DEFAULT true,
  auto_accept boolean DEFAULT false,
  opening_time time DEFAULT '08:00',
  closing_time time DEFAULT '22:00',
  updated_at timestamptz DEFAULT now()
);
```

### 3.3 商品系统

```sql
-- 全局商品库（后台管理）
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  category text NOT NULL,               -- coffee/tea/snack
  base_price numeric(10,2) NOT NULL,
  image_url text,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 商品规格选项
CREATE TABLE public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  option_type text NOT NULL,            -- temperature/size/sweetness
  option_value text NOT NULL,           -- hot/iced, regular/large
  price_adjustment numeric(10,2) DEFAULT 0,
  is_default boolean DEFAULT false
);

-- 门店商品（可覆盖价格）
CREATE TABLE public.store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  local_price numeric(10,2),            -- NULL则用base_price
  is_available boolean DEFAULT true,
  stock_count integer,                  -- NULL表示不限
  UNIQUE (store_id, product_id)
);
```

### 3.4 订单系统

```sql
-- 订单状态枚举
CREATE TYPE public.order_status AS ENUM (
  'pending',      -- 待接单
  'accepted',     -- 已接单
  'making',       -- 制作中
  'ready',        -- 待取餐
  'delivering',   -- 配送中
  'delivered',    -- 已完成
  'cancelled'     -- 已取消
);

-- 订单主表
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text UNIQUE NOT NULL,        -- K001 格式
  store_id uuid REFERENCES stores(id) NOT NULL,
  customer_id uuid REFERENCES auth.users(id),
  status order_status DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL,
  coupon_discount numeric(10,2) DEFAULT 0,
  final_amount numeric(10,2) NOT NULL,
  merchant_share numeric(10,2),         -- 商户分润金额
  platform_share numeric(10,2),         -- 平台分润金额
  delivery_address text,
  delivery_phone text,
  remark text,
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz
);

-- 订单商品明细
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  options jsonb,                        -- {"temperature": "iced", "size": "large"}
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL
);

-- 订单状态日志（用于追踪）
CREATE TABLE public.order_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  operator_id uuid REFERENCES auth.users(id),
  note text,
  created_at timestamptz DEFAULT now()
);
```

### 3.5 营销系统

```sql
-- 优惠券模板
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coupon_type text NOT NULL,            -- fixed/percent
  discount_value numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) DEFAULT 0,
  valid_days integer DEFAULT 7,
  total_quota integer,                  -- 总发放量
  claimed_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 用户持有券
CREATE TABLE public.user_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_id uuid REFERENCES coupons(id),
  status text DEFAULT 'available',      -- available/used/expired
  used_order_id uuid REFERENCES orders(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 会员等级
CREATE TABLE public.membership_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_points integer NOT NULL,
  discount_rate numeric(3,2) DEFAULT 1.0,  -- 0.95 = 95折
  benefits jsonb
);
```

### 3.6 评价系统

```sql
-- 用户评价
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) UNIQUE,
  store_id uuid REFERENCES stores(id),
  customer_id uuid REFERENCES auth.users(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images jsonb,                         -- 评价图片URL数组
  is_complaint boolean DEFAULT false,   -- 标记为投诉
  status text DEFAULT 'visible',        -- visible/hidden/flagged
  created_at timestamptz DEFAULT now()
);

-- 商家回复
CREATE TABLE public.review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id),
  reply_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 3.7 库存日志

```sql
-- 库存变动日志
CREATE TABLE public.inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id),
  material_type text NOT NULL,          -- raw/packaging
  material_id uuid NOT NULL,
  change_type text NOT NULL,            -- order_consume/restock/manual_adjust
  change_amount numeric NOT NULL,
  before_amount numeric,
  after_amount numeric,
  reference_id uuid,                    -- 关联订单ID或补货单ID
  operator_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

### 3.8 财务结算

```sql
-- 结算周期
CREATE TABLE public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_revenue numeric(12,2),
  total_orders integer,
  merchant_share numeric(12,2),
  platform_share numeric(12,2),
  restock_cost numeric(12,2) DEFAULT 0, -- 补货费用扣除
  final_payout numeric(12,2),
  status text DEFAULT 'pending',        -- pending/confirmed/paid
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

---

## 四、RLS 权限设计

### 4.1 安全函数

```sql
-- 检查用户角色
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 获取用户所属门店
CREATE OR REPLACE FUNCTION public.get_user_store_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT store_id FROM profiles WHERE id = _user_id
$$;
```

### 4.2 核心 RLS 策略示例

```sql
-- 订单表：客户看自己的，店员看门店的，管理员看全部
CREATE POLICY "orders_access" ON orders FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR customer_id = auth.uid()
  OR store_id = public.get_user_store_id(auth.uid())
);

-- 库存表：只有本店店员和管理员可见
CREATE POLICY "materials_access" ON raw_materials FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR store_id = public.get_user_store_id(auth.uid())
);

-- 商品表：所有人可读
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);

-- 评价表：客户写自己的，商家只能读/回复本店的
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());
```

---

## 五、三端数据权限矩阵

| 数据表 | 客户端 | 门店端 | 公司后台 |
|--------|--------|--------|----------|
| products | 读 | 读 | 读写 |
| orders | 读写(自己) | 读写(本店) | 读写(全部) |
| reviews | 读写(自己) | 读+回复(本店) | 读写(全部) |
| raw_materials | - | 读写(本店) | 读写(全部) |
| coupons | 读 | - | 读写 |
| user_coupons | 读写(自己) | - | 读(全部) |
| stores | 读(上架) | 读写(本店) | 读写(全部) |
| settlements | - | 读(本店) | 读写(全部) |

---

## 六、实施步骤

### 第一阶段：公司后台建立主数据库
1. 在公司后台项目创建完整表结构
2. 设置身份认证系统（user_roles, profiles）
3. 配置安全函数和 RLS 策略
4. 导入/合并现有数据

### 第二阶段：连接门店端和客户端
1. 获取公司后台的 Supabase 凭据
2. 更新门店端 `.env` 配置
3. 更新客户端 `.env` 配置
4. 测试三端数据同步

### 第三阶段：实现统一登录
1. 三端共用登录/注册页面
2. 登录后根据 user_roles 判断跳转
3. 前端根据角色显示对应功能

### 第四阶段：业务功能对接
1. 订单实时推送（Supabase Realtime）
2. 库存自动扣减（数据库触发器）
3. 结算周期自动生成

---

## 七、技术实现要点

| 要点 | 实现方式 |
|------|----------|
| 实时订单推送 | Supabase Realtime 订阅 orders 表 |
| 库存自动扣减 | 触发器：订单完成时扣减 raw_materials |
| 统一登录 | 三端共用 auth.users + user_roles 判断 |
| 防止数据越权 | RLS + Security Definer 函数 |
| 离线容错 | 前端乐观更新 + 冲突检测 |
