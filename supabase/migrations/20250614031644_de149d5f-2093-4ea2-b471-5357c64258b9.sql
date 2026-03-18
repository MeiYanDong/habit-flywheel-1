
-- 创建习惯表
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  energy_value INTEGER NOT NULL DEFAULT 1,
  color TEXT DEFAULT '#8B5CF6',
  binding_reward_id UUID,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建奖励表
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  energy_cost INTEGER NOT NULL DEFAULT 10,
  current_energy INTEGER NOT NULL DEFAULT 0,
  is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 创建习惯完成记录表
CREATE TABLE public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  energy_gained INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);

-- 创建用户总能量表
CREATE TABLE public.user_energy (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  total_energy INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 添加外键约束到habits表
ALTER TABLE public.habits 
ADD CONSTRAINT fk_habits_binding_reward 
FOREIGN KEY (binding_reward_id) REFERENCES public.rewards(id) ON DELETE SET NULL;

-- 启用行级安全 (RLS)
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_energy ENABLE ROW LEVEL SECURITY;

-- 创建habits表的RLS策略
CREATE POLICY "Users can view their own habits" 
  ON public.habits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" 
  ON public.habits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" 
  ON public.habits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" 
  ON public.habits 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建rewards表的RLS策略
CREATE POLICY "Users can view their own rewards" 
  ON public.rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rewards" 
  ON public.rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards" 
  ON public.rewards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rewards" 
  ON public.rewards 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建habit_completions表的RLS策略
CREATE POLICY "Users can view their own habit completions" 
  ON public.habit_completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit completions" 
  ON public.habit_completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit completions" 
  ON public.habit_completions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit completions" 
  ON public.habit_completions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建user_energy表的RLS策略
CREATE POLICY "Users can view their own energy" 
  ON public.user_energy 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy" 
  ON public.user_energy 
  FOR ALL 
  USING (auth.uid() = user_id);

-- 创建自动更新updated_at字段的函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加updated_at触发器
CREATE TRIGGER update_habits_updated_at 
  BEFORE UPDATE ON public.habits 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at 
  BEFORE UPDATE ON public.rewards 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_energy_updated_at 
  BEFORE UPDATE ON public.user_energy 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 创建自动初始化用户能量的函数和触发器
CREATE OR REPLACE FUNCTION public.handle_new_user_energy()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_energy (user_id, total_energy)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 当新用户注册时自动创建能量记录
CREATE TRIGGER on_auth_user_created_energy
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_energy();
;
