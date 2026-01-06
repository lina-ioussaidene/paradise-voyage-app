const SUPABASE_URL = 'https://paxnianycpeizfcmsibv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nJZ1bF4fxF3zqLIrRIZjuA_r1GgbAR0';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tableBody = document.getElementById('requestsTable');
const counterEl = document.getElementById('counter');
const adminMessage = document.getElementById('adminMessage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

let page = 1;
const limit = 10;
let totalCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'admin-login.html';
    return;
  }
  loadRequests(page);
});

async function loadRequests(p = 1) {
  const from = (p - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabaseClient
    .from('requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    adminMessage.textContent = "❌ Erreur de chargement.";
    adminMessage.className = 'form-message error';
    return;
  }

  totalCount = count || 0;
  counterEl.textContent = `Total demandes : ${totalCount}`;
  pageInfo.textContent = `Page ${page}`;

  tableBody.innerHTML = '';
  data.forEach(req => {
    const statusClass = req.status === 'terminee' ? 'status-badge success' : 'status-badge pending';
    const created = new Date(req.created_at).toLocaleString();

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${req.last_name}</td>
      <td>${req.first_name}</td>
      <td>${req.email}</td>
      <td>${req.phone || '-'}</td>
      <td>${req.service}</td>
      <td>${req.message}</td>
      <td>${created}</td>
      <td><span class="${statusClass}">${req.status}</span></td>
      <td>
        <button class="btn small danger" data-id="${req.id}" data-action="delete">${req.action || 'Supprimer'}</button>
        <button class="btn small" data-id="${req.id}" data-action="toggleStatus">${req.status === 'terminee' ? 'Marquer en attente' : 'Marquer terminée'}</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

tableBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'delete') {
    const ok = confirm('Supprimer cette demande ?');
    if (!ok) return;
    await supabaseClient.from('requests').delete().eq('id', id);
    loadRequests(page);
  }

  if (action === 'toggleStatus') {
    const { data } = await supabaseClient.from('requests').select('status').eq('id', id).single();
    const nextStatus = data.status === 'terminee' ? 'en attente' : 'terminee';
    await supabaseClient.from('requests').update({ status: nextStatus }).eq('id', id);
    loadRequests(page);
  }
});

prevBtn.addEventListener('click', () => {
  if (page > 1) {
    page -= 1;
    loadRequests(page);
  }
});
nextBtn.addEventListener('click', () => {
  const maxPage = Math.max(1, Math.ceil(totalCount / limit));
  if (page < maxPage) {
    page += 1;
    loadRequests(page);
  }
});
// Bouton déconnexion
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      adminMessage.textContent = "❌ Erreur lors de la déconnexion.";
      adminMessage.className = 'form-message error';
    } else {
      // Redirection vers la page de login
      window.location.href = 'admin-login.html';
    }
  });
}
