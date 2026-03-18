import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { PlanStatus, PlanType } from '@/types/flywheel';

export interface Reward {
  id: string;
  name: string;
  description?: string;
  energy_cost: number;
  current_energy: number;
  is_redeemed: boolean;
  redeemed_at?: string;
  plan_type?: PlanType;
  status?: PlanStatus;
  target_date?: string;
  motivation_note?: string;
  abandon_reason?: string;
  reflection_note?: string;
  priority?: number;
  created_at: string;
  updated_at: string;
}

export type RewardMutation = Omit<Reward, 'id' | 'current_energy' | 'is_redeemed' | 'created_at' | 'updated_at'>;

const hasMissingColumnError = (error: unknown) => {
  const message = typeof error === 'object' && error !== null && 'message' in error
    ? String(error.message)
    : '';

  return /column|schema cache/i.test(message);
};

export const useRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 获取奖励列表
  const fetchRewards = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "获取奖励失败",
        description: "无法加载奖励列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  // 创建奖励
  const createReward = async (rewardData: RewardMutation) => {
    if (!user) return;

    try {
      const payload = { 
        ...rewardData, 
        user_id: user.id,
        current_energy: 0,
        is_redeemed: false,
        plan_type: rewardData.plan_type ?? 'one_time',
        status: rewardData.status ?? 'active',
        priority: rewardData.priority ?? 0,
      };

      let { data, error } = await supabase
        .from('rewards')
        .insert([payload])
        .select()
        .single();

      if (error && hasMissingColumnError(error)) {
        ({ data, error } = await supabase
          .from('rewards')
          .insert([{
            name: rewardData.name,
            description: rewardData.description,
            energy_cost: rewardData.energy_cost,
            user_id: user.id,
            current_energy: 0,
            is_redeemed: false,
          }])
          .select()
          .single());
      }

      if (error) throw error;
      
      setRewards(prev => [data, ...prev]);
      toast({
        title: "奖励创建成功",
        description: `"${rewardData.name}" 已添加到您的奖励列表中`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating reward:', error);
      toast({
        title: "创建奖励失败",
        description: "无法创建新奖励",
        variant: "destructive",
      });
    }
  };

  // 更新奖励
  const updateReward = async (id: string, updates: Partial<Reward>) => {
    if (!user) return;

    try {
      let { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error && hasMissingColumnError(error)) {
        const {
          plan_type,
          status,
          target_date,
          motivation_note,
          abandon_reason,
          reflection_note,
          priority,
          ...legacyUpdates
        } = updates;
        ({ data, error } = await supabase
          .from('rewards')
          .update(legacyUpdates)
          .eq('id', id)
          .select()
          .single());
      }

      if (error) throw error;
      
      setRewards(prev => prev.map(reward => reward.id === id ? data : reward));
      toast({
        title: "奖励更新成功",
        description: "奖励信息已更新",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating reward:', error);
      toast({
        title: "更新奖励失败",
        description: "无法更新奖励信息",
        variant: "destructive",
      });
    }
  };

  // 删除奖励
  const deleteReward = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRewards(prev => prev.filter(reward => reward.id !== id));
      toast({
        title: "奖励已删除",
        description: "奖励及其相关绑定已被删除",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast({
        title: "删除奖励失败",
        description: "无法删除奖励",
        variant: "destructive",
      });
    }
  };

  // 兑换奖励
  const redeemReward = async (id: string) => {
    if (!user) return;

    // 乐观更新：立即更新UI状态
    const rewardToRedeem = rewards.find(r => r.id === id);
    if (!rewardToRedeem) return;

    // 立即更新本地状态
    setRewards(prev => prev.map(reward => 
      reward.id === id 
        ? { ...reward, is_redeemed: true, redeemed_at: new Date().toISOString() }
        : reward
    ));

    // 立即显示成功提示
    toast({
      title: "奖励兑换成功",
      description: `恭喜您兑换了"${rewardToRedeem.name}"！`,
    });

    try {
      const { data, error } = await supabase
        .from('rewards')
        .update({ 
          is_redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // 确保数据一致性
      setRewards(prev => prev.map(reward => reward.id === id ? data : reward));
      
      return data;
    } catch (error) {
      console.error('Error redeeming reward:', error);
      
      // 回滚乐观更新
      setRewards(prev => prev.map(reward => 
        reward.id === id 
          ? { ...reward, is_redeemed: false, redeemed_at: undefined }
          : reward
      ));
      
      toast({
        title: "兑换奖励失败",
        description: "无法兑换奖励，请稍后再试",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchRewards();
    } else {
      setRewards([]);
      setLoading(false);
    }
  }, [fetchRewards, user]);

  // 乐观更新：立即增加奖励能量
  const optimisticAddEnergyToReward = (rewardId: string, energyAmount: number) => {
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId 
        ? { ...reward, current_energy: reward.current_energy + energyAmount }
        : reward
    ));
  };

  // 回滚更新：回滚增加的奖励能量
  const rollbackAddEnergyToReward = (rewardId: string, energyAmount: number) => {
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId 
        ? { ...reward, current_energy: Math.max(0, reward.current_energy - energyAmount) }
        : reward
    ));
  };

  // 乐观更新：立即扣除奖励能量（取消打卡）
  const optimisticSubtractEnergyFromReward = (rewardId: string, energyAmount: number) => {
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId 
        ? { ...reward, current_energy: Math.max(0, reward.current_energy - energyAmount) }
        : reward
    ));
  };

  // 回滚更新：恢复扣除的奖励能量
  const rollbackSubtractEnergyFromReward = (rewardId: string, energyAmount: number) => {
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId 
        ? { ...reward, current_energy: reward.current_energy + energyAmount }
        : reward
    ));
  };

  return {
    rewards,
    loading,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    optimisticAddEnergyToReward,
    rollbackAddEnergyToReward,
    optimisticSubtractEnergyFromReward,
    rollbackSubtractEnergyFromReward,
    refetch: fetchRewards
  };
};
