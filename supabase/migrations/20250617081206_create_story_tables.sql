-- 创建故事进度表
CREATE TABLE IF NOT EXISTS story_progress (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    progress JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建成就表
CREATE TABLE IF NOT EXISTS achievements (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    unlocked JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建故事选择统计表
CREATE TABLE IF NOT EXISTS choice_statistics (
    id SERIAL PRIMARY KEY,
    story_id TEXT NOT NULL,
    chapter_id INTEGER NOT NULL,
    choice_id INTEGER NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, chapter_id, choice_id)
);

-- 创建用户反馈表
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    story_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建RLS策略
ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE choice_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- 故事进度表策略
CREATE POLICY "用户可以查看自己的故事进度" ON story_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的故事进度" ON story_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的故事进度" ON story_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 成就表策略
CREATE POLICY "用户可以查看自己的成就" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的成就" ON achievements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的成就" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 故事选择统计表策略
CREATE POLICY "所有人可以查看选择统计" ON choice_statistics
    FOR SELECT USING (true);

CREATE POLICY "已认证用户可以插入选择统计" ON choice_statistics
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "已认证用户可以更新选择统计" ON choice_statistics
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 用户反馈表策略
CREATE POLICY "用户可以查看自己的反馈" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的反馈" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);;
