DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'habit_frequency'
  ) THEN
    CREATE TYPE public.habit_frequency AS ENUM ('daily', 'weekly', 'monthly');
  END IF;
END $$;

ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS frequency public.habit_frequency NOT NULL DEFAULT 'daily',
  ADD COLUMN IF NOT EXISTS target_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.habits
  DROP COLUMN IF EXISTS color;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'habits_energy_value_positive'
  ) THEN
    ALTER TABLE public.habits
      ADD CONSTRAINT habits_energy_value_positive CHECK (energy_value > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'habits_target_count_positive'
  ) THEN
    ALTER TABLE public.habits
      ADD CONSTRAINT habits_target_count_positive CHECK (target_count > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rewards_energy_cost_positive'
  ) THEN
    ALTER TABLE public.rewards
      ADD CONSTRAINT rewards_energy_cost_positive CHECK (energy_cost > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'habit_completions_energy_nonnegative'
  ) THEN
    ALTER TABLE public.habit_completions
      ADD CONSTRAINT habit_completions_energy_nonnegative CHECK (energy_gained >= 0);
  END IF;
END $$;

ALTER TABLE public.habit_completions
  ADD COLUMN IF NOT EXISTS reward_id UUID REFERENCES public.rewards(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_on DATE;

UPDATE public.habit_completions hc
SET completed_on = (hc.completed_at AT TIME ZONE 'UTC')::date
WHERE hc.completed_on IS NULL;

UPDATE public.habit_completions hc
SET energy_gained = h.energy_value
FROM public.habits h
WHERE hc.habit_id = h.id
  AND hc.user_id = h.user_id
  AND hc.energy_gained <= 0;

UPDATE public.habit_completions hc
SET reward_id = h.binding_reward_id
FROM public.habits h
WHERE hc.habit_id = h.id
  AND hc.user_id = h.user_id
  AND hc.reward_id IS NULL;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, habit_id, completed_on
      ORDER BY completed_at ASC, id ASC
    ) AS row_num
  FROM public.habit_completions
)
DELETE FROM public.habit_completions hc
USING ranked r
WHERE hc.id = r.id
  AND r.row_num > 1;

ALTER TABLE public.habit_completions
  ALTER COLUMN completed_on SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_habits_user_archived
  ON public.habits(user_id, is_archived);

CREATE INDEX IF NOT EXISTS idx_rewards_user_redeemed
  ON public.rewards(user_id, is_redeemed);

CREATE INDEX IF NOT EXISTS idx_habit_completions_user_completed_at
  ON public.habit_completions(user_id, completed_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_completions_daily_unique
  ON public.habit_completions(user_id, habit_id, completed_on);

CREATE OR REPLACE FUNCTION public.populate_habit_completion_snapshot()
RETURNS TRIGGER AS $$
DECLARE
  habit_record public.habits%ROWTYPE;
BEGIN
  SELECT *
  INTO habit_record
  FROM public.habits
  WHERE id = NEW.habit_id
    AND user_id = NEW.user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Habit % not found for user %', NEW.habit_id, NEW.user_id;
  END IF;

  NEW.energy_gained := habit_record.energy_value;
  NEW.reward_id := habit_record.binding_reward_id;

  IF NEW.completed_on IS NULL THEN
    NEW.completed_on := (NEW.completed_at AT TIME ZONE 'UTC')::date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.rebuild_derived_energy_totals(target_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_energy (user_id, total_energy)
  SELECT source.user_id, 0
  FROM (
    SELECT id AS user_id FROM auth.users
    UNION
    SELECT user_id FROM public.habits
    UNION
    SELECT user_id FROM public.rewards
    UNION
    SELECT user_id FROM public.habit_completions
  ) AS source
  WHERE target_user_id IS NULL OR source.user_id = target_user_id
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_energy ue
  SET
    total_energy = COALESCE(stats.total_energy, 0),
    updated_at = now()
  FROM (
    SELECT user_id, COALESCE(SUM(energy_gained), 0) AS total_energy
    FROM public.habit_completions
    WHERE target_user_id IS NULL OR user_id = target_user_id
    GROUP BY user_id
  ) AS stats
  WHERE ue.user_id = stats.user_id
    AND (target_user_id IS NULL OR ue.user_id = target_user_id);

  UPDATE public.user_energy ue
  SET
    total_energy = 0,
    updated_at = now()
  WHERE (target_user_id IS NULL OR ue.user_id = target_user_id)
    AND NOT EXISTS (
      SELECT 1
      FROM public.habit_completions hc
      WHERE hc.user_id = ue.user_id
    );

  UPDATE public.rewards r
  SET
    current_energy = COALESCE(stats.current_energy, 0),
    updated_at = now()
  FROM (
    SELECT reward_id, user_id, COALESCE(SUM(energy_gained), 0) AS current_energy
    FROM public.habit_completions
    WHERE reward_id IS NOT NULL
      AND (target_user_id IS NULL OR user_id = target_user_id)
    GROUP BY reward_id, user_id
  ) AS stats
  WHERE r.id = stats.reward_id
    AND r.user_id = stats.user_id
    AND (target_user_id IS NULL OR r.user_id = target_user_id);

  UPDATE public.rewards r
  SET
    current_energy = 0,
    updated_at = now()
  WHERE (target_user_id IS NULL OR r.user_id = target_user_id)
    AND NOT EXISTS (
      SELECT 1
      FROM public.habit_completions hc
      WHERE hc.reward_id = r.id
        AND hc.user_id = r.user_id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.apply_completion_energy_delta()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_energy (user_id, total_energy)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_energy
    SET
      total_energy = total_energy + NEW.energy_gained,
      updated_at = now()
    WHERE user_id = NEW.user_id;

    IF NEW.reward_id IS NOT NULL THEN
      UPDATE public.rewards
      SET
        current_energy = current_energy + NEW.energy_gained,
        updated_at = now()
      WHERE id = NEW.reward_id
        AND user_id = NEW.user_id;
    END IF;

    RETURN NEW;
  END IF;

  UPDATE public.user_energy
  SET
    total_energy = GREATEST(0, total_energy - OLD.energy_gained),
    updated_at = now()
  WHERE user_id = OLD.user_id;

  IF OLD.reward_id IS NOT NULL THEN
    UPDATE public.rewards
    SET
      current_energy = GREATEST(0, current_energy - OLD.energy_gained),
      updated_at = now()
    WHERE id = OLD.reward_id
      AND user_id = OLD.user_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS populate_habit_completion_snapshot_trigger ON public.habit_completions;
CREATE TRIGGER populate_habit_completion_snapshot_trigger
  BEFORE INSERT ON public.habit_completions
  FOR EACH ROW
  EXECUTE PROCEDURE public.populate_habit_completion_snapshot();

DROP TRIGGER IF EXISTS apply_completion_energy_delta_trigger ON public.habit_completions;
CREATE TRIGGER apply_completion_energy_delta_trigger
  AFTER INSERT OR DELETE ON public.habit_completions
  FOR EACH ROW
  EXECUTE PROCEDURE public.apply_completion_energy_delta();

SELECT public.rebuild_derived_energy_totals();
;
