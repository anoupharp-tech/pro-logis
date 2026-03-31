// ============================================================
// App — Main Controller, Init, Modal, Sidebar, Notifications
// ============================================================
const App = (() => {
  let sidebarCollapsed = false;
  let notifPanelOpen = false;
  let userMenuOpen = false;

  function init() {
    I18n.init();
    DB.seed();

    // Restore session or show auth
    if (Auth.restoreSession()) {
      launchApp();
    } else {
      document.getElementById('authScreen').classList.remove('hidden');
      Auth.showPanel('track');
      const hint = DB.Shipments.getAll()[0]?.trackingNumber;
      const hintEl = document.getElementById('trackHint');
      if (hint && hintEl) hintEl.textContent = 'ຕົວຢ່າງ: ' + hint;
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      const um = document.getElementById('userDropdown');
      const hdrUser = document.querySelector('.hdr-user');
      if (um && !um.classList.contains('hidden') && !hdrUser?.contains(e.target)) {
        um.classList.add('hidden');
        userMenuOpen = false;
      }
    });
  }

  function launchApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    setupApp();
    Pages.navigate('dashboard');
  }

  function setupApp() {
    const user = Auth.getUser();
    if (!user) return;

    // Sidebar user info
    const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('sbAvatar').textContent = initials;
    document.getElementById('sbUserName').textContent = user.name;
    const roleBadge = document.getElementById('sbUserRole');
    roleBadge.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    roleBadge.className = `sb-role-badge role-${user.role}`;

    // Header user info
    document.getElementById('hdrAvatar').textContent = initials;
    document.getElementById('hdrUserName').textContent = user.name.split(' ')[0];

    // Navigation
    document.getElementById('sbNav').innerHTML = Auth.buildNavigation();

    // Notification badge
    const unread = DB.Notifications.countUnread();
    const dot = document.getElementById('notifDot');
    if (dot) dot.style.display = unread > 0 ? 'block' : 'none';

    // Load notifications panel
    renderNotifPanel();
  }

  function renderNotifPanel() {
    const notifs = DB.Notifications.getAll().slice(0, 8);
    const list = document.getElementById('notifList');
    if (!list) return;
    list.innerHTML = notifs.length === 0
      ? '<div class="empty-state" style="padding:40px"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>'
      : notifs.map(n => `
        <div class="np-item">
          <div class="np-icon ${n.type}"><i class="fas ${n.icon || 'fa-bell'}"></i></div>
          <div class="np-content">
            <p>${n.title} ${!n.read ? '<span style="width:6px;height:6px;background:var(--danger);border-radius:50%;display:inline-block;vertical-align:middle"></span>' : ''}</p>
            <span>${n.body}</span><br><span>${n.time}</span>
          </div>
        </div>`).join('');
  }

  function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('appMain');
    if (window.innerWidth <= 768) {
      sb.classList.toggle('mobile-open');
    } else {
      sidebarCollapsed = !sidebarCollapsed;
      sb.classList.toggle('collapsed', sidebarCollapsed);
      main.classList.toggle('sidebar-collapsed', sidebarCollapsed);
    }
  }

  function closeSidebar() {
    const sb = document.getElementById('sidebar');
    const main = document.getElementById('appMain');
    if (window.innerWidth <= 768) {
      sb.classList.remove('mobile-open');
    } else {
      sidebarCollapsed = true;
      sb.classList.add('collapsed');
      main.classList.add('sidebar-collapsed');
    }
  }

  function toggleNotifPanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    notifPanelOpen = !notifPanelOpen;
    panel.classList.toggle('hidden', !notifPanelOpen);
    if (notifPanelOpen) renderNotifPanel();
  }

  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
    document.getElementById('userDropdown')?.classList.toggle('hidden', !userMenuOpen);
  }

  function setLang(lang) {
    I18n.setLang(lang);
    // Update nav labels
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = I18n.t(el.getAttribute('data-i18n'));
    });
    // Rebuild nav
    const nav = document.getElementById('sbNav');
    if (nav) nav.innerHTML = Auth.buildNavigation();
    // Re-render current page so dynamic content also translates
    const cp = Pages.getCurrentPage?.();
    if (cp && Auth.isLoggedIn()) {
      Pages.navigate(cp);
    }
    // Reactivate current page nav item
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-page') === cp) el.classList.add('active');
    });
  }

  // ============================================================
  // MODAL
  // ============================================================
  function openModal(title, body, buttons = [], size = '') {
    const overlay = document.getElementById('modalOverlay');
    const box = document.getElementById('modalBox');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');

    if (!overlay || !box) return;

    titleEl.innerHTML = title;
    bodyEl.innerHTML = body;
    box.className = `modal-box ${size}`;

    if (buttons.length > 0) {
      footer.classList.remove('hidden');
      footer.innerHTML = buttons.map(btn =>
        `<button class="btn ${btn.cls}" onclick="${btn.action}">${btn.label}</button>`
      ).join('');
    } else {
      footer.classList.add('hidden');
    }

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Initialize any tab panels in the modal
    setTimeout(() => {
      const firstTab = bodyEl.querySelector('.tab-btn');
      const firstPanel = bodyEl.querySelector('.tab-panel');
      if (firstTab) firstTab.classList.add('active');
      if (firstPanel) firstPanel.classList.add('active');
    }, 10);
  }

  function closeModal() {
    document.getElementById('modalOverlay')?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function closeModalOnBg(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  }

  // ============================================================
  // TABS
  // ============================================================
  function switchTab(btn, panelId) {
    const container = btn.closest('.card-body, .modal-body, .page-content, .tab-container, main');
    if (!container) return;
    container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
  }

  return { init, launchApp, setupApp, toggleSidebar, closeSidebar, toggleNotifPanel, toggleUserMenu, setLang, openModal, closeModal, closeModalOnBg, switchTab, renderNotifPanel };
})();

// ============================================================
// Boot
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
