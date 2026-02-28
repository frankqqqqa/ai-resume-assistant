-- Supabase SQL: 在 Supabase Dashboard > SQL Editor 中执行此脚本
-- 创建简历优化历史记录表

CREATE TABLE IF NOT EXISTS optimization_records (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_text TEXT        NOT NULL,
  jd_text     TEXT        NOT NULL,
  suggestions JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 按时间倒序查询的索引（可选，提升性能）
CREATE INDEX IF NOT EXISTS idx_optimization_records_created_at
  ON optimization_records (created_at DESC);

-- 开启Row Level Security（建议在生产中使用）
-- ALTER TABLE optimization_records ENABLE ROW LEVEL SECURITY;
-- 如需所有人可读写（开发阶段），可创建以下策略：
-- CREATE POLICY "allow_all" ON optimization_records FOR ALL USING (true);
