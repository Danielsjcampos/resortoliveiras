
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aozfvyvttplcuernnktx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemZ2eXZ0dHBsY3Vlcm5ua3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjAzODQsImV4cCI6MjA4MTYzNjM4NH0.SBgzUHrh15wvhgQQRpfQSraNFRHlcblticjHB0p5-I4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
