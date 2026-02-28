import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('optimization_records')
            .select('id, resume_text, jd_text, suggestions, created_at')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Supabase query error:', error);
            return NextResponse.json({ error: '查询历史记录失败' }, { status: 500 });
        }

        return NextResponse.json({ records: data ?? [] });
    } catch (err) {
        console.error('Unexpected error in GET /api/history:', err);
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
    }
}
