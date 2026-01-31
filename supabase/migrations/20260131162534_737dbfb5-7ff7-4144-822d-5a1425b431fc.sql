
-- 允许用户在注册时插入自己的 profile 和 role
CREATE POLICY "Users can insert own role on signup" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
