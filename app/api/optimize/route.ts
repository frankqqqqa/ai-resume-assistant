import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Suggestion } from '@/lib/supabase';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'stepfun/step-3.5-flash:free';

export async function POST(req: NextRequest) {
    try {
        const { resumeText, jdText } = await req.json();

        if (!resumeText || !jdText) {
            return NextResponse.json(
                { error: '请提供简历经历和目标岗位 JD' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenRouter API Key 未配置' },
                { status: 500 }
            );
        }

        // 获取当前登录用户
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        const systemPrompt = `你是一位专业的简历优化顾问，专注于帮助数据分析领域的求职者。
你的任务是分析用户的简历经历，并与目标岗位 JD 进行对比，给出具体的优化建议。

请严格按照以下 JSON 格式返回结果，不要包含任何多余的文字或 markdown 代码块标记：
{
  "suggestions": [
    {
      "id": 1,
      "original": "原始简历句子（完整引用）",
      "optimized": "优化后的句子（更具量化、专业、与 JD 匹配）",
      "keywords": ["关键技能1", "关键技能2", "关键词3"],
      "highlight": "优化后句子中的核心量化亮点片段（用于高亮显示，不超过10字）"
    }
  ]
}

优化原则：
1. 使用 STAR 法则（情境-任务-行动-结果）重写经历
2. 量化成果（加入具体数字、百分比、规模等）
3. 使用 JD 中出现的关键技术词汇
4. 使用动词开头，突出个人主导性
5. 每个建议针对简历中的一个独立经历点
6. 最多返回 5 条建议，聚焦最重要的优化点`;

        const userPrompt = `【我的简历经历】
${resumeText}

【目标岗位 JD】
${jdText}

请分析上述内容，返回优化建议（JSON 格式）。`;

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
                'X-Title': 'AI Resume Assistant',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('OpenRouter API error:', response.status, errorBody);
            return NextResponse.json(
                { error: `AI 服务请求失败: ${response.status}` },
                { status: 502 }
            );
        }

        const aiData = await response.json();
        const rawContent = aiData.choices?.[0]?.message?.content ?? '';

        let suggestions: Suggestion[] = [];
        try {
            const cleaned = rawContent
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/gi, '')
                .trim();
            const parsed = JSON.parse(cleaned);
            suggestions = parsed.suggestions ?? [];
        } catch {
            console.error('Failed to parse AI response:', rawContent);
            return NextResponse.json(
                { error: 'AI 返回格式解析失败，请重试' },
                { status: 500 }
            );
        }

        // 保存到 Supabase（带 user_id）
        const { data: record, error: dbError } = await supabase
            .from('optimization_records')
            .insert({
                resume_text: resumeText,
                jd_text: jdText,
                suggestions,
                user_id: user?.id ?? null,
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('Supabase insert error:', dbError);
            return NextResponse.json({ suggestions, recordId: null });
        }

        return NextResponse.json({ suggestions, recordId: record.id });
    } catch (err) {
        console.error('Unexpected error in /api/optimize:', err);
        return NextResponse.json(
            { error: '服务器内部错误，请稍后重试' },
            { status: 500 }
        );
    }
}
