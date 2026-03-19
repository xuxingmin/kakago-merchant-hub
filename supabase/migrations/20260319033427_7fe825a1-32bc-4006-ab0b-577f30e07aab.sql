
-- Invoice requests table
CREATE TABLE public.invoice_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  customer_id UUID NOT NULL,
  order_no TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  title_type TEXT NOT NULL DEFAULT 'personal',
  company_name TEXT,
  tax_number TEXT,
  customer_email TEXT,
  invoice_url TEXT,
  reject_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_title_type CHECK (title_type IN ('personal', 'enterprise')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'rejected'))
);

ALTER TABLE public.invoice_requests ENABLE ROW LEVEL SECURITY;

-- Store staff can view their store's invoice requests
CREATE POLICY "Store staff can view store invoices"
ON public.invoice_requests FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR store_id = get_user_store_id(auth.uid())
);

-- Store staff can update their store's invoice requests
CREATE POLICY "Store staff can update store invoices"
ON public.invoice_requests FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR store_id = get_user_store_id(auth.uid())
);

-- Customers can create invoice requests
CREATE POLICY "Customers can create invoice requests"
ON public.invoice_requests FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid());

-- Customers can view own invoice requests
CREATE POLICY "Customers can view own invoices"
ON public.invoice_requests FOR SELECT TO authenticated
USING (customer_id = auth.uid());
