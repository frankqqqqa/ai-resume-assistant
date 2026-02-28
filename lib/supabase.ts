import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Suggestion = {
  id: number;
  original: string;
  optimized: string;
  keywords: string[];
  highlight: string;
};

export type OptimizationRecord = {
  id: string;
  resume_text: string;
  jd_text: string;
  suggestions: Suggestion[];
  created_at: string;
};
