const SUPABASE_URL = 'https://paxnianycpeizfcmsibv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nJZ1bF4fxF3zqLIrRIZjuA_r1GgbAR0';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      msg.textContent = '❌ Erreur de connexion: ' + error.message;
      msg.className = 'form-message error';
      return;
    }
    window.location.href = 'admin.html';
  });
});
