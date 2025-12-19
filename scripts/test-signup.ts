
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aozfvyvttplcuernnktx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemZ2eXZ0dHBsY3Vlcm5ua3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjAzODQsImV4cCI6MjA4MTYzNjM4NH0.SBgzUHrh15wvhgQQRpfQSraNFRHlcblticjHB0p5-I4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  console.log("--- START SIGNUP TEST ---");
  const email = `test-${Date.now()}@example.com`;
  
  try {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'password123'
    });
    
    if (error) {
        console.log("SIGNUP ERROR:", error.message);
    } else {
        console.log("SIGNUP SUCCESS:", data.user?.email);
    }
  } catch (e: any) { console.log("SIGNUP EXCEPTION:", e.message); }
  
  console.log("--- END TEST ---");
  process.exit(0);
}

testSignup();
