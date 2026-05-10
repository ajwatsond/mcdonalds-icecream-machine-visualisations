/* ============================================================
   help.js — Help modal: auto-show on first visit, reopen via ?
   Works across multiple pages with per-page localStorage keys
   ============================================================ */

const HELP_SEEN_KEY = 'icecream_help_seen_' + window.location.pathname.split('/').pop();

document.addEventListener('DOMContentLoaded', () => {
  // Auto-show on first visit to this page
  if (!localStorage.getItem(HELP_SEEN_KEY)) {
    openHelp();
  }

  // Close on backdrop click
  document.getElementById('help-backdrop').addEventListener('click', closeHelp);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHelp();
  });
});

function openHelp() {
  const modal    = document.getElementById('help-modal');
  const backdrop = document.getElementById('help-backdrop');
  modal.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  modal.removeAttribute('aria-hidden');
  document.getElementById('help-close').focus();
}

function closeHelp() {
  const modal    = document.getElementById('help-modal');
  const backdrop = document.getElementById('help-backdrop');
  modal.classList.add('hidden');
  backdrop.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  localStorage.setItem(HELP_SEEN_KEY, '1');
  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) helpBtn.focus();
}