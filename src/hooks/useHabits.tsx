import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { HabitFrequency } from '@/types/flywheel';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  energy_value: number;
  color?: string;
  binding_reward_id?: string | null;
  frequency?: HabitFrequency;
  target_count?: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type HabitMutation = Omit<Habit, 'id' | 'created_at' | 'updated_at'>;

const hasMissingColumnError = (error: unknown) => {
  const message = typeof error === 'object' && error !== null && 'message' in error
    ? String(error.message)
    : '';

  return /column|schema cache/i.test(message);
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // 获取习惯列表
  const fetchHabits = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast({
        title: "获取习惯失败",
        description: "无法加载习惯列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  // 创建习惯
  const createHabit = async (habitData: HabitMutation) => {
    if (!user) return;

    try {
      const payload = {
        ...habitData,
        frequency: habitData.frequency ?? 'daily',
        target_count: habitData.target_count ?? 1,
        user_id: user.id,
      };

      let { data, error } = await supabase
        .from('habits')
        .insert([payload])
        .select()
        .single();

      if (error && hasMissingColumnError(error)) {
        ({ data, error } = await supabase
          .from('habits')
          .insert([{
            name: habitData.name,
            description: habitData.description,
            energy_value: habitData.energy_value,
            color: habitData.color,
            binding_reward_id: habitData.binding_reward_id,
            is_archived: habitData.is_archived,
            user_id: user.id,
          }])
          .select()
          .single());
      }

      if (error) throw error;
      
      setHabits(prev => [data, ...prev]);
      toast({
        title: "习惯创建成功",
        description: `"${habitData.name}" 已添加到您的习惯列表中`,
      });
      
      return data;
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: "创建习惯失败",
        description: "无法创建新习惯",
        variant: "destructive",
      });
    }
  };

  // 更新习惯
  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user) return;

    try {
      let { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error && hasMissingColumnError(error)) {
        const { frequency, target_count, ...legacyUpdates } = updates;
        ({ data, error } = await supabase
          .from('habits')
          .update(legacyUpdates)
          .eq('id', id)
          .select()
          .single());
      }

      if (error) throw error;
      
      setHabits(prev => prev.map(habit => habit.id === id ? data : habit));
      toast({
        title: "习惯更新成功",
        description: "习惯信息已更新",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating habit:', error);
      toast({
        title: "更新习惯失败",
        description: "无法更新习惯信息",
        variant: "destructive",
      });
    }
  };

  // 删除习惯
  const deleteHabit = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHabits(prev => prev.filter(habit => habit.id !== id));
      toast({
        title: "习惯已删除",
        description: "习惯及其相关记录已被删除",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: "删除习惯失败",
        description: "无法删除习惯",
        variant: "destructive",
      });
    }
  };

  // 习惯打卡功能
  const checkInHabit = async (habitId: string) => {
    if (!user) return;

    try {
      // 找到对应的习惯
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        toast({
          title: "习惯不存在",
          description: "找不到指定的习惯",
          variant: "destructive",
        });
        return;
      }

      // 检查今天是否已经打卡
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const { data: existingCompletion, error: checkError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .gte('completed_at', startOfDay.toISOString())
        .lt('completed_at', endOfDay.toISOString())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCompletion) {
        toast({
          title: "今日已打卡",
          description: `您今天已经完成了"${habit.name}"的打卡`,
          variant: "default",
        });
        return;
      }

      // 记录打卡
      let { error: completionError } = await supabase
        .from('habit_completions')
        .insert([{
          user_id: user.id,
          habit_id: habitId,
          plan_id_snapshot: habit.binding_reward_id ?? null,
          frequency_bucket: habit.frequency ?? 'daily',
          energy_gained: habit.energy_value,
          completed_at: new Date().toISOString()
        }]);

      if (completionError && hasMissingColumnError(completionError)) {
        ({ error: completionError } = await supabase
          .from('habit_completions')
          .insert([{
            user_id: user.id,
            habit_id: habitId,
            energy_gained: habit.energy_value,
            completed_at: new Date().toISOString()
          }]));
      }

      if (completionError) throw completionError;

      // 更新用户总能量 - 使用更简单但有效的方法
      let energyUpdateSuccess = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!energyUpdateSuccess && attempts < maxAttempts) {
        attempts++;
        
        const { data: currentEnergy, error: energyError } = await supabase
          .from('user_energy')
          .select('total_energy')
          .eq('user_id', user.id)
          .single();

        if (energyError && energyError.code !== 'PGRST116') {
          // 如果不存在记录，创建新记录
          const { error: insertError } = await supabase
            .from('user_energy')
            .insert({
              user_id: user.id,
              total_energy: habit.energy_value,
              updated_at: new Date().toISOString()
            });
          
          if (!insertError) {
            energyUpdateSuccess = true;
          } else {
            console.error('Error inserting user energy:', insertError);
          }
        } else {
          const newTotalEnergy = (currentEnergy?.total_energy || 0) + habit.energy_value;
          const { error: updateEnergyError } = await supabase
            .from('user_energy')
            .update({
              total_energy: newTotalEnergy,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (!updateEnergyError) {
            energyUpdateSuccess = true;
          } else {
            console.error(`Error updating user energy (attempt ${attempts}):`, updateEnergyError);
            // 短暂延迟后重试
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
      }

      // 如果有绑定奖励，使用重试机制更新奖励能量
      if (habit.binding_reward_id) {
        let rewardUpdateSuccess = false;
        let rewardAttempts = 0;
        
        while (!rewardUpdateSuccess && rewardAttempts < maxAttempts) {
          rewardAttempts++;
          
          const { data: currentReward, error: getRewardError } = await supabase
            .from('rewards')
            .select('current_energy')
            .eq('id', habit.binding_reward_id)
            .eq('user_id', user.id)
            .single();

          if (getRewardError) {
            console.error('Error getting reward energy:', getRewardError);
            break; // 如果获取奖励失败，退出重试循环
          }

          const newCurrentEnergy = (currentReward.current_energy || 0) + habit.energy_value;
          const { error: rewardError } = await supabase
            .from('rewards')
            .update({
              current_energy: newCurrentEnergy
            })
            .eq('id', habit.binding_reward_id)
            .eq('user_id', user.id)
            .eq('current_energy', currentReward.current_energy); // 乐观锁：只有当前能量值没变时才更新

          if (!rewardError) {
            rewardUpdateSuccess = true;
          } else {
            console.error(`Error updating reward energy (attempt ${rewardAttempts}):`, rewardError);
            // 短暂延迟后重试
            if (rewardAttempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        
        if (!rewardUpdateSuccess) {
          console.error('Failed to update reward energy after multiple attempts');
        }
      }

      toast({
        title: "打卡成功！",
        description: `完成"${habit.name}"，获得 ${habit.energy_value} 点能量`,
      });

      return true; // 成功返回 true

    } catch (error) {
      console.error('Error checking in habit:', error);
      
      // 如果是已经打卡的错误，特别处理
      if (error?.message?.includes('already completed today')) {
        toast({
          title: "今日已打卡",
          description: `您今天已经完成了这个习惯的打卡`,
          variant: "default",
        });
        return;
      }
      
      toast({
        title: "打卡失败",
        description: "无法完成打卡，请稍后再试",
        variant: "destructive",
      });
      
      throw error; // 抛出错误以便调用方处理
    }
  };

  // 取消打卡功能
  const unCheckInHabit = async (habitId: string) => {
    if (!user) return;

    try {
      // 找到对应的习惯
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        toast({
          title: "习惯不存在",
          description: "找不到指定的习惯",
          variant: "destructive",
        });
        return;
      }

      // 查找今日的打卡记录
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const { data: existingCompletion, error: checkError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .gte('completed_at', startOfDay.toISOString())
        .lt('completed_at', endOfDay.toISOString())
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          toast({
            title: "今日未打卡",
            description: `您今天还没有完成"${habit.name}"的打卡`,
            variant: "default",
          });
          return;
        }
        throw checkError;
      }

      if (!existingCompletion) {
        toast({
          title: "今日未打卡",
          description: `您今天还没有完成"${habit.name}"的打卡`,
          variant: "default",
        });
        return;
      }

      // 删除打卡记录
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existingCompletion.id);

      if (deleteError) throw deleteError;

      // 扣除用户总能量
      let energyUpdateSuccess = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!energyUpdateSuccess && attempts < maxAttempts) {
        attempts++;
        
        const { data: currentEnergy, error: energyError } = await supabase
          .from('user_energy')
          .select('total_energy')
          .eq('user_id', user.id)
          .single();

        if (energyError) {
          console.error('Error getting user energy:', energyError);
          break;
        }

        const newTotalEnergy = Math.max(0, (currentEnergy?.total_energy || 0) - habit.energy_value);
        const { error: updateEnergyError } = await supabase
          .from('user_energy')
          .update({
            total_energy: newTotalEnergy,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (!updateEnergyError) {
          energyUpdateSuccess = true;
        } else {
          console.error(`Error updating user energy (attempt ${attempts}):`, updateEnergyError);
          // 短暂延迟后重试
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      // 如果有绑定奖励，扣除奖励能量
      if (habit.binding_reward_id) {
        let rewardUpdateSuccess = false;
        let rewardAttempts = 0;
        
        while (!rewardUpdateSuccess && rewardAttempts < maxAttempts) {
          rewardAttempts++;
          
          const { data: currentReward, error: getRewardError } = await supabase
            .from('rewards')
            .select('current_energy')
            .eq('id', habit.binding_reward_id)
            .eq('user_id', user.id)
            .single();

          if (getRewardError) {
            console.error('Error getting reward energy:', getRewardError);
            break; // 如果获取奖励失败，退出重试循环
          }

          const newCurrentEnergy = Math.max(0, (currentReward.current_energy || 0) - habit.energy_value);
          const { error: rewardError } = await supabase
            .from('rewards')
            .update({
              current_energy: newCurrentEnergy
            })
            .eq('id', habit.binding_reward_id)
            .eq('user_id', user.id)
            .eq('current_energy', currentReward.current_energy); // 乐观锁：只有当前能量值没变时才更新

          if (!rewardError) {
            rewardUpdateSuccess = true;
          } else {
            console.error(`Error updating reward energy (attempt ${rewardAttempts}):`, rewardError);
            // 短暂延迟后重试
            if (rewardAttempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        
        if (!rewardUpdateSuccess) {
          console.error('Failed to update reward energy after multiple attempts');
        }
      }

      toast({
        title: "取消打卡成功",
        description: `已取消"${habit.name}"的打卡，扣除 ${habit.energy_value} 点能量`,
        variant: "default",
      });

      return true; // 成功返回 true

    } catch (error) {
      console.error('Error unchecking habit:', error);
      
      toast({
        title: "取消打卡失败",
        description: "无法取消打卡，请稍后再试",
        variant: "destructive",
      });
      
      throw error; // 抛出错误以便调用方处理
    }
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
    } else {
      setHabits([]);
      setLoading(false);
    }
  }, [fetchHabits, user]);

  return {
    habits,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    checkInHabit,
    unCheckInHabit,
    refetch: fetchHabits
  };
};
