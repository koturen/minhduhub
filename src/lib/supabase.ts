import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && key);
// Khóa anon/publishable là khóa CÔNG KHAI; an toàn nhờ Row Level Security. Không bao giờ dùng service_role ở đây.
export const supabase = isSupabaseConfigured ? createClient(url as string, key as string) : null;
