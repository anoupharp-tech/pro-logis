// ============================================================
// Auth Module — Authentication, Session, Role-based Access
// ============================================================
const Auth = (() => {
  let currentUser = null;

  const ROLE_NAV = {
    admin:    ['dashboard','shipments','tracking','warehouse','drivers','customers','agents','finance','analytics','exceptions','payments','labels','gps','notifications','settings'],
    manager:  ['dashboard','shipments','tracking','warehouse','drivers','customers','agents','finance','analytics','exceptions','payments','labels','gps','notifications'],
    agent:    ['dashboard','shipments','tracking','warehouse','customers','exceptions','payments','labels','notifications'],
    driver:   ['dashboard','tracking','exceptions','notifications'],
    customer: ['dashboard','tracking','shipments','payments','notifications'],
  };

  function showPanel(name) {
    ['loginCard','registerCard','trackCard'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
    const map = { login:'loginCard', register:'registerCard', track:'trackCard' };
    document.getElementById(map[name])?.classList.remove('hidden');
  }

  function showLogin() { showPanel('login'); }
  function showRegister() { showPanel('register'); }

  function login(e) {
    e?.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { Utils.toast('Please enter email and password', 'warning'); return; }
    const user = DB.Users.getByEmail(email);
    if (!user || user.password !== password) { Utils.toast('Invalid email or password', 'error'); return; }
    if (!user.active) { Utils.toast('Account is inactive', 'error'); return; }
    setSession(user);
    Utils.toast(`Welcome back, ${user.name}!`, 'success');
    App.launchApp();
  }

  function register(e) {
    e?.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const address = document.getElementById('regAddress').value.trim();
    const city = document.getElementById('regCity').value.trim();
    const country = document.getElementById('regCountry').value;
    if (!name || !email || !password) { Utils.toast('Please fill required fields', 'warning'); return; }
    if (password !== confirm) { Utils.toast('Passwords do not match', 'error'); return; }
    if (DB.Users.getByEmail(email)) { Utils.toast('Email already registered', 'error'); return; }
    const user = DB.Users.create({ name, email, password, phone, address, city, country, avatar: name.charAt(0).toUpperCase() });
    setSession(user);
    Utils.toast(`Welcome, ${name}! Account created.`, 'success');
    App.launchApp();
  }

  function quickLogin(role) {
    const map = { admin:'admin@prologists.la', manager:'manager@prologists.la', agent:'agent@prologists.la', driver:'driver@prologists.la', customer:'customer@prologists.la' };
    const user = DB.Users.getByEmail(map[role]);
    if (!user) { Utils.toast('Demo user not found', 'error'); return; }
    setSession(user);
    Utils.toast(`Logged in as ${user.name} (${role})`, 'success');
    App.launchApp();
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem('erp_session');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    showPanel('login');
    Utils.toast('Logged out successfully', 'info');
  }

  function setSession(user) {
    currentUser = user;
    localStorage.setItem('erp_session', JSON.stringify({ id: user.id, email: user.email }));
  }

  function restoreSession() {
    const saved = localStorage.getItem('erp_session');
    if (!saved) return false;
    try {
      const { email } = JSON.parse(saved);
      const user = DB.Users.getByEmail(email);
      if (user && user.active) { currentUser = user; return true; }
    } catch {}
    return false;
  }

  function getUser() { return currentUser; }
  function getRole() { return currentUser?.role || 'customer'; }
  function hasPermission(page) { return (ROLE_NAV[getRole()] || []).includes(page); }
  function isLoggedIn() { return !!currentUser; }

  function buildNavigation() {
    const perms = ROLE_NAV[getRole()] || [];
    const navDefs = [
      { group:'navMain', items:[{ key:'dashboard', icon:'fa-tachometer-alt', label:'dashboard' }]},
      { group:'navOperations', items:[
        { key:'shipments', icon:'fa-boxes', label:'shipments' },
        { key:'tracking', icon:'fa-search-location', label:'tracking' },
        { key:'warehouse', icon:'fa-warehouse', label:'warehouse' },
        { key:'drivers', icon:'fa-truck', label:'drivers' },
      ]},
      { group:'navManagement', items:[
        { key:'customers', icon:'fa-users', label:'customers' },
        { key:'agents', icon:'fa-store', label:'agents' },
        { key:'exceptions', icon:'fa-exclamation-circle', label:'exceptions', badge: DB.Exceptions.countOpen() },
        { key:'gps', icon:'fa-map-marked-alt', label:'gpsTracking' },
      ]},
      { group:'navFinance', items:[
        { key:'finance', icon:'fa-chart-line', label:'finance' },
        { key:'payments', icon:'fa-credit-card', label:'payments' },
        { key:'analytics', icon:'fa-chart-bar', label:'analytics' },
      ]},
      { group:'navSystem', items:[
        { key:'labels', icon:'fa-tags', label:'labels' },
        { key:'notifications', icon:'fa-bell', label:'notifications', badge: DB.Notifications.countUnread() },
        { key:'settings', icon:'fa-cog', label:'settings' },
      ]},
    ];

    let html = '';
    navDefs.forEach(group => {
      const visible = group.items.filter(it => perms.includes(it.key));
      if (!visible.length) return;
      html += `<div class="nav-group"><div class="nav-group-label" data-i18n="${group.group}">${I18n.t(group.group)}</div>`;
      visible.forEach(it => {
        const badge = it.badge ? `<span class="nav-badge">${it.badge}</span>` : '';
        html += `<div class="nav-item" onclick="Pages.navigate('${it.key}');App.closeSidebar()" data-page="${it.key}" data-tooltip="${I18n.t(it.label)}">
          <i class="fas ${it.icon}"></i><span data-i18n="${it.label}">${I18n.t(it.label)}</span>${badge}
        </div>`;
      });
      html += '</div>';
    });
    return html;
  }

  return { showPanel, showLogin, showRegister, login, register, quickLogin, logout, getUser, getRole, hasPermission, isLoggedIn, restoreSession, buildNavigation };
})();
