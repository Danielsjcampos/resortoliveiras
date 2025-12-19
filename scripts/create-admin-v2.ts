
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aozfvyvttplcuernnktx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemZ2eXZ0dHBsY3Vlcm5ua3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjAzODQsImV4cCI6MjA4MTYzNjM4NH0.SBgzUHrh15wvhgQQRpfQSraNFRHlcblticjHB0p5-I4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminV2() {
  console.log("--- CREATING ADMIN V2 ---");
  const email = 'admin-dev@oliveiras.com';
  const password = 'password123';

  // 1. SignUp
  const { data: auth, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.log("SIGNUP ERROR:", authError.message);
    return;
  }

  if (!auth.user) {
    console.log("SIGNUP FAILED: No user returned");
    return;
  }

  console.log("SIGNUP SUCCESS. User ID:", auth.user.id);

  // 2. Insert Profile
  // Precisamos criar o perfil imediatamente.
  // Como estamos rodando node script, não temos o contexto de sessão "logado" automaticamente no client global se não usarmos persist session...
  // Mas o signUp retorna session se email confirmation estiver desligado ou for auto-confirm.
  // Se não retornar session, não conseguimos inserir na public.users se a RLS exigir autenticação.

  // Vamos checar se temos sessão.
  if (auth.session) {
    console.log("GOT SESSION. Inserting profile...");
    
    const profile = {
        id: auth.user.id,
        name: 'Admin Dev',
        email: email,
        role_id: 'role-admin', // IMPORTANTE: role-admin dá acesso total
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminDev'
    };

    const { error: profileError } = await supabase.from('users').insert(profile);
    
    if (profileError) {
        console.log("PROFILE INSERT ERROR:", profileError.message);
    } else {
        console.log("PROFILE INSERT SUCCESS!");
        console.log("✅ NEW ADMIN CREATED: admin-dev@oliveiras.com / password123");
    }

  } else {
     console.log("NO SESSION RETURNED. Email confirmation might be required.");
     // Tentar fazer signIn para pegar sessão (se não exigir confirmação)
     const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
     if (loginData.session) {
         console.log("LOGGED IN. Inserting profile...");
          const profile = {
            id: loginData.user.id,
            name: 'Admin Dev',
            email: email,
            role_id: 'role-admin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminDev'
        };
        const { error: profileError } = await supabase.from('users').insert(profile);
        if (profileError) console.log("PROFILE INSERT ERROR:", profileError.message);
        else console.log("PROFILE INSERT SUCCESS! ✅ USE: admin-dev@oliveiras.com");
     } else {
         console.log("Login failed or requires confirmation:", loginError?.message);
     }
  }

  process.exit(0);
}

createAdminV2();
