// ============================================================
// AUREON - SISTEMA DE AUTENTICAÇÃO E BANCO DE DADOS REAL
// ============================================================
const SUPABASE_URL = 'https://lekomrszaspewopcokwg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5fi0MrkuA9nUyvC23fxpJQ_E2Nlkrbc';

// Inicializa o cliente Supabase
const aureonDB = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. CRIAR CONTA COM E-MAIL REAL
async function cadastrarUsuario(nome, email, senha) {
  const { data, error } = await aureonDB.auth.signUp({
    email: email,
    password: senha,
    options: {
      data: { nome: nome }
    }
  });

  if (error) {
    alert('Erro ao criar conta: ' + error.message);
    return null;
  }

  alert('Conta criada! Verifique seu e-mail (inclusive spam) ou faça login agora.');
  return data;
}

// 2. ENTRAR NA CONTA (LOGIN)
async function entrarUsuario(email, senha) {
  const { data, error } = await aureonDB.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    alert('E-mail ou senha inválidos: ' + error.message);
    return null;
  }

  window.location.href = 'perfil.html';
  return data;
}

// 3. RECUPERAR SENHA
async function recuperarSenha(email) {
  if (!email) {
    alert('Digite seu e-mail no campo acima primeiro!');
    return;
  }
  const { error } = await aureonDB.auth.resetPasswordForEmail(email);
  if (error) {
    alert('Erro ao enviar e-mail: ' + error.message);
  } else {
    alert('Enviamos um link de redefinição de senha para ' + email);
  }
}

// 4. BUSCAR DADOS DO USUÁRIO LOGADO
async function carregarUsuarioAtual() {
  const { data: { user } } = await aureonDB.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await aureonDB
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single();

  return perfil;
}

// 5. ATUALIZAR HABILIDADES OU INTERESSES NO BANCO
async function salvarPerfil(dadosAtualizados) {
  const { data: { user } } = await aureonDB.auth.getUser();
  if (!user) return;

  const { error } = await aureonDB
    .from('perfis')
    .update(dadosAtualizados)
    .eq('id', user.id);

  if (error) {
    alert('Erro ao salvar alterações: ' + error.message);
  } else {
    alert('Perfil atualizado com sucesso!');
  }
}

// 6. SAIR DA CONTA
async function sairUsuario() {
  await aureonDB.auth.signOut();
  window.location.href = 'entrar.html';
}
