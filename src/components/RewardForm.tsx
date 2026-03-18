
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { useTranslation } from 'react-i18next';

interface RewardFormData {
  name: string;
  description?: string;
  energyCost: number;
}

interface RewardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RewardFormData) => void;
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    energyCost: number;
  };
  isEditing?: boolean;
}

const RewardForm: React.FC<RewardFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const { t } = useTranslation();
  const form = useForm<RewardFormData>({
    defaultValues: {
      name: '',
      description: '',
      energyCost: 100,
    }
  });

  // 重置表单当初始数据改变时
  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || '',
        description: initialData.description || '',
        energyCost: initialData.energyCost || 100,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        energyCost: 100,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (data: RewardFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="dialog-shell dialog-shell--legacy sm:max-w-[425px]">
        <DialogHeader className="border-b border-border/70 pb-4">
          <DialogTitle>
            {isEditing ? t('rewards.edit') : t('rewards.create')}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: t('rewards.nameRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rewards.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('rewards.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rewards.description')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('rewards.descriptionPlaceholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="energyCost"
              rules={{ 
                required: t('rewards.energyRequired'),
                min: { value: 1, message: t('rewards.energyMin') },
                max: { value: 1000, message: t('rewards.energyMax') }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rewards.energyCost')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" className="btn-subtle" onClick={handleClose}>
                {t('rewards.cancel')}
              </Button>
              <Button type="submit">
                {isEditing ? t('rewards.save') : t('rewards.create_action')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RewardForm;
