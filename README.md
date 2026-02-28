# AI 简历助手 ✨

> 基于 **OpenRouter AI + Supabase** 的全栈简历优化工具，帮助数据分析求职者将普通简历经历改写成量化、有影响力的专业表述。

🟢 **在线地址**: https://ai-resume-assistant-topaz.vercel.app

## 功能特性

- 🤖 **AI 深度优化** — 使用 StepFun 大模型，将简历原句改写为 STAR 法则、量化数据的专业表述
- 📋 **关键词匹配** — 自动提取与目标 JD 匹配的关键词并高亮展示
- 📌 **一键复制** — 直接复制优化后的内容
- 🕐 **历史记录** — 自动保存每次优化结果，随时回顾
- 📱 **响应式设计** — 支持桌面和移动端

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) |
| UI 样式 | Tailwind CSS v4 |
| AI 模型 | OpenRouter — StepFun Step 3.5 Flash (free) |
| 数据库 | Supabase (PostgreSQL) |
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

复制 `.env.example` 为 `.env.local` 并填入你的密钥：

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_anon_key
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key
```

### 3. 初始化数据库

在 [Supabase Dashboard SQL Editor](https://supabase.com/dashboard) 执行 `supabase_schema.sql`：

```sql
CREATE TABLE IF NOT EXISTS optimization_records (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_text TEXT        NOT NULL,
  jd_text     TEXT        NOT NULL,
  suggestions JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 4. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:3000
```

## 项目结构

```
├── app/
│   ├── api/
│   │   ├── optimize/route.ts   # POST: 调用 AI 优化简历
│   │   └── history/route.ts    # GET: 获取历史记录
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # 主界面（Client Component）
├── lib/
│   └── supabase.ts             # Supabase 客户端 + 类型定义
├── supabase_schema.sql         # 数据库建表 SQL
└── .env.example                # 环境变量模板
```

## 部署到 Vercel

1. Fork 或 clone 本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com/new) 导入仓库
3. 配置环境变量（同 `.env.local` 的三个变量）
4. 点击 Deploy

## License

MIT
