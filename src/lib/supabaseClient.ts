
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create client if URL is valid (not placeholder)
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http');
// Check for placeholder values or empty strings
const isPlaceholder = supabaseUrl === 'YOUR_SUPABASE_URL';

export const supabase = (isValidUrl && !isPlaceholder && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;
