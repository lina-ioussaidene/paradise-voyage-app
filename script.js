// ============================================
// PARADISE VOYAGE - SCRIPT PRINCIPAL
// ============================================

const SUPABASE_URL = 'https://paxnianycpeizfcmsibv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nJZ1bF4fxF3zqLIrRIZjuA_r1GgbAR0';
const TABLE_NAME = 'requests';
const DEFAULT_STATUS = 'en attente'; // valeurs possibles: 'en attente' ou 'terminee'

// Initialisation Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Paradise Voyage - Script chargé');

  // Bouton scroll vers formulaire
  const scrollBtn = document.getElementById('scrollToForm');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const formSection = document.querySelector('.form-container');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          const firstNameField = document.getElementById('firstName');
          if (firstNameField) firstNameField.focus();
        }, 600);
      }
    });
  }

  // Formulaire de contact
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleFormSubmit();
    });
  }
});

// ============================================
// Soumission du formulaire
// ============================================

async function handleFormSubmit() {
  console.log('📤 Envoi du formulaire...');

  const formData = {
    last_name: document.getElementById('lastName')?.value.trim() || '',
    first_name: document.getElementById('firstName')?.value.trim() || '',
    email: document.getElementById('email')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || null,
    service: document.getElementById('service')?.value || '',
    message: document.getElementById('message')?.value.trim() || ''
  };

  // Validation
  if (!formData.last_name || !formData.first_name || !formData.email || !formData.service || !formData.message) {
    return showError('Veuillez remplir tous les champs obligatoires (*).');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return showError('Veuillez saisir une adresse email valide.');
  }

  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
  }

  try {
    const supabaseData = {
      last_name: formData.last_name,
      first_name: formData.first_name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      message: formData.message,
      status: DEFAULT_STATUS,
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseClient.from(TABLE_NAME).insert([supabaseData]);

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      showError('Erreur lors de l\'envoi: ' + error.message);
    } else {
      console.log('✅ Données insérées !');
      showSuccess(`Merci ${formData.first_name} ! Votre demande a été envoyée.`);
      document.getElementById('contactForm').reset();
    }
  } catch (err) {
    console.error('❌ Exception:', err);
    showError('Erreur réseau. Vérifiez votre connexion.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer la demande';
    }
  }
}

// ============================================
// Messages utilisateur
// ============================================

function showSuccess(message) {
  const formMessage = document.getElementById('formMessage');
  if (formMessage) {
    formMessage.innerHTML = `
      <div class="message-content success">
        <i class="fas fa-check-circle"></i>
        <div>
          <strong>Succès !</strong>
          <p>${message}</p>
        </div>
      </div>
    `;
    formMessage.style.display = 'block';
    setTimeout(() => formMessage.style.display = 'none', 5000);
  }
}

function showError(message) {
  const formMessage = document.getElementById('formMessage');
  if (formMessage) {
    formMessage.innerHTML = `
      <div class="message-content error">
        <i class="fas fa-exclamation-circle"></i>
        <div>
          <strong>Erreur</strong>
          <p>${message}</p>
        </div>
      </div>
    `;
    formMessage.style.display = 'block';
  }
}
