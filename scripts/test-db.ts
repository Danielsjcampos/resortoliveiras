
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aozfvyvttplcuernnktx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemZ2eXZ0dHBsY3Vlcm5ua3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjAzODQsImV4cCI6MjA4MTYzNjM4NH0.SBgzUHrh15wvhgQQRpfQSraNFRHlcblticjHB0p5-I4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log("--- START TEST ---");
  
  // 1. SETTINGS
  try {
    const { data: settings, error } = await supabase.from('settings').select('id');
    if (error) console.log("SETTINGS ERROR:", error.message);
    else console.log("SETTINGS SUCCESS:", settings.length, "rows");
  } catch (e: any) { console.log("SETTINGS EXCEPTION:", e.message); }

  // 2. AUTH
  try {
    const { data: auth, error } = await supabase.auth.signInWithPassword({
        email: 'admin@oliveiras.com',
        password: 'password123'
    });
    if (error) {
        console.log("AUTH ERROR:", error.message);
    } else {
        console.log("AUTH SUCCESS. User:", auth.user.email);
        
        // 3. PROFILE
        const { data: profile, error: profError } = await supabase.from('users').select('*').eq('id', auth.user.id).single();
         if (profError) console.log("PROFILE ERROR:", profError.message);
         else console.log("PROFILE SUCCESS:", profile.name);
    }
  } catch (e: any) { console.log("AUTH EXCEPTION:", e.message); }

  console.log("--- END TEST ---");
  process.exit(0);
}

testConnection();
