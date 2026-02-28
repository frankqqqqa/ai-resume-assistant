/**
 * 数据库初始化脚本 - 在 Supabase Dashboard > SQL Editor 中执行
 * 或运行: node scripts/init-db.js
 */

// 方法1: 使用 Supabase Dashboard SQL Editor 执行以下 SQL:
const SQL = `
CREATE TABLE IF NOT EXISTS optimization_records (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_text TEXT        NOT NULL,
  jd_text     TEXT        NOT NULL,
  suggestions JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_optimization_records_created_at
  ON optimization_records (created_at DESC);
`;

// 方法2: 通过 Supabase Management API 自动建表
async function initDatabase() {
    const projectRef = 'itnckqcicxakmaaravdg';
    // Note: Management API requires your personal access token from https://supabase.com/dashboard/account/tokens
    // 如果你有 Management API token，在此处填入
    const managementToken = process.env.SUPABASE_MANAGEMENT_TOKEN;

    if (!managementToken) {
        console.log('='.repeat(60));
        console.log('请在 Supabase Dashboard SQL Editor 中执行以下 SQL:');
        console.log('='.repeat(60));
        console.log(SQL);
        console.log('='.repeat(60));
        console.log('URL: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
        return;
    }

    const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${managementToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: SQL }),
        }
    );

    if (response.ok) {
        console.log('✅ 数据库表创建成功！');
    } else {
        const err = await response.text();
        console.error('❌ 建表失败:', err);
    }
}

initDatabase();
