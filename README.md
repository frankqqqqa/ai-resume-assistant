# AI 简历助手 ✨

> 基于 **OpenRouter AI + Supabase** 的全栈简历优化工具，帮助数据分析求职者将普通经历改写成量化、有影响力的专业表述。

🟢 **在线地址**: https://ai-resume-assistant-topaz.vercel.app

## 功能特性

- 🔐 **用户认证** — 注册/登录，历史记录按账号隔离
- 🤖 **AI 深度优化** — StepFun 大模型，将简历原句改写为 STAR 法则、量化数据的专业表述
- 📋 **关键词匹配** — 自动提取与 JD 匹配的关键词并高亮显示
- 📌 **一键复制** — 直接复制优化后的内容
- 🕐 **历史记录** — 自动保存每次优化，随时回顾（仅自己可见）
- 📱 **响应式设计** — 支持桌面和移动端

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) |
| UI 样式 | Tailwind CSS v4 |
| AI 模型 | OpenRouter — StepFun Step 3.5 Flash (free) |
| 数据库 & 认证 | Supabase (PostgreSQL + Auth) |
| 部署 | Vercel |

## 本地开发

### 前置条件
- Node.js >= 18
- Supabase 项目（免费 tier 即可）
- OpenRouter API Key（免费注册）

### 1. 克隆项目

```bash
git clone https://github.com/frankqqqqa/ai-resume-assistant.git
cd ai-resume-assistant
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入密钥：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_anon_key
OPENROUTER_API_KEY=sk-or-v1-your_key
APP_URL=http://localhost:3000
```

### 3. 初始化数据库

在 Supabase Dashboard → SQL Editor 执行 `supabase_schema.sql`：

```sql
CREATE TABLE IF NOT EXISTS optimization_records (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_text TEXT        NOT NULL,
  jd_text     TEXT        NOT NULL,
  suggestions JSONB       NOT NULL DEFAULT '[]',
  user_id     UUID,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE optimization_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON optimization_records
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "users_insert_own" ON optimization_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

在 Supabase Dashboard → Authentication → Providers → Email，建议关闭「Confirm email」以简化注册流程。

### 4. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

首次访问会自动跳转到登录页，注册账号后即可使用。

## 项目结构

```
├── app/
│   ├── api/
│   │   ├── optimize/route.ts   # POST: 调用 AI 优化简历
│   │   └── history/route.ts    # GET: 获取当前用户历史记录
│   ├── login/
│   │   └── page.tsx            # 登录/注册页
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # 主界面（Client Component）
├── lib/
│   ├── supabase.ts             # 类型定义
│   ├── supabase-browser.ts     # 浏览器端 Supabase 客户端
│   └── supabase-server.ts      # 服务端 Supabase 客户端（读取 cookie session）
├── middleware.ts                # 未登录自动跳转 /login
├── supabase_schema.sql         # 完整建表 + RLS SQL
└── .env.example                # 环境变量模板
```

## 部署到 Vercel

1. Fork 本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com/new) 导入仓库
3. 配置以下4个环境变量：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |
| `OPENROUTER_API_KEY` | 你的 OpenRouter API Key |
| `APP_URL` | 你的 Vercel 部署 URL |

4. 点击 Deploy
5. 部署完成后，在 Supabase → Authentication → URL Configuration 将 Site URL 更新为你的 Vercel URL

## License

MIT
