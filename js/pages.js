// ============================================================
// Pages Module — Dashboard, Shipments, Tracking, Public Track
// ============================================================
const Pages = (() => {
  let currentPage = 'dashboard';
  let shipPage = 1;

  function navigate(page) {
    if (!Auth.hasPermission(page)) { Utils.toast('Access denied', 'error'); return; }
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-page') === page);
    });
    const titles = {
      dashboard: I18n.t('dashboard'), shipments: I18n.t('shipments'),
      tracking: I18n.t('tracking'), warehouse: I18n.t('warehouse'),
      drivers: I18n.t('drivers'), customers: I18n.t('customers'),
      agents: I18n.t('agents'), finance: I18n.t('finance'),
      analytics: I18n.t('analytics'), exceptions: I18n.t('exceptions'),
      payments: I18n.t('payments'), labels: I18n.t('labels'),
      gps: I18n.t('gpsTracking'), notifications: I18n.t('notifications'),
      settings: I18n.t('settings'),
    };
    document.getElementById('breadcrumbText').textContent = titles[page] || page;
    const content = document.getElementById('pageContent');
    content.innerHTML = '<div style="text-align:center;padding:60px"><i class="fas fa-spinner fa-spin" style="font-size:32px;color:var(--primary-light)"></i></div>';
    setTimeout(() => {
      switch(page) {
        case 'dashboard': renderDashboard(); break;
        case 'shipments': renderShipments(); break;
        case 'tracking': renderTracking(); break;
        case 'warehouse': Pages2.renderWarehouse(); break;
        case 'drivers': Pages2.renderDrivers(); break;
        case 'customers': Pages2.renderCustomers(); break;
        case 'agents': Pages2.renderAgents(); break;
        case 'finance': Pages2.renderFinance(); break;
        case 'analytics': Pages3.renderAnalytics(); break;
        case 'exceptions': Pages3.renderExceptions(); break;
        case 'payments': Pages3.renderPayments(); break;
        case 'labels': Pages3.renderLabels(); break;
        case 'gps': Pages3.renderGPS(); break;
        case 'notifications': Pages3.renderNotifications(); break;
        case 'settings': Pages3.renderSettings(); break;
        default: renderDashboard();
      }
    }, 80);
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  function renderDashboard() {
    const role = Auth.getRole();
    const user = Auth.getUser();
    const allShipments = DB.Shipments.getAll();
    const delivered = allShipments.filter(s => s.status === 'delivered').length;
    const pending = allShipments.filter(s => s.status === 'pending' || s.status === 'processing').length;
    const inTransit = allShipments.filter(s => s.status === 'out-for-delivery' || s.status === 'in-warehouse').length;
    const revenue = DB.Finance.getTotalIncome();
    const drivers = DB.Drivers.getAll().filter(d => d.status === 'online').length;
    const today = new Date().toISOString().split('T')[0];
    const todayDelivered = allShipments.filter(s => s.status === 'delivered' && s.updatedAt?.startsWith(today)).length;

    const recent = [...allShipments].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8);

    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div>
        <h1><i class="fas fa-tachometer-alt"></i> ${I18n.t('dashboard')}</h1>
        <p>Welcome back, <strong>${user.name}</strong> · ${Utils.fmtDate(new Date().toISOString())}</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <a href="calculator.html" target="_blank" class="btn btn-secondary btn-sm" style="text-decoration:none">
          <i class="fas fa-calculator"></i> ຄິດໄລ່ລາຄາ
        </a>
        <button class="btn btn-primary" onclick="Pages.openCreateShipment()">
          <i class="fas fa-plus"></i> ${I18n.t('createShipment')}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="cursor:pointer" onclick="Pages.navigate('shipments')">
        <div class="stat-icon blue"><i class="fas fa-boxes"></i></div>
        <div class="stat-info">
          <div class="stat-label">${I18n.t('totalShipments')}</div>
          <div class="stat-value">${Utils.fmtNum(allShipments.length)}</div>
          <div class="stat-change up"><i class="fas fa-arrow-up"></i> 12% this month</div>
        </div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="Pages.navigate('shipments');setTimeout(()=>{document.getElementById('shipStatus').value='delivered';Pages.filterShipments('delivered')},200)">
        <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
          <div class="stat-label">${I18n.t('deliveredToday')}</div>
          <div class="stat-value">${Utils.fmtNum(todayDelivered || delivered)}</div>
          <div class="stat-change up"><i class="fas fa-arrow-up"></i> ${DB.Analytics.deliveryRate()}% rate</div>
        </div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="Pages.navigate('shipments');setTimeout(()=>{document.getElementById('shipStatus').value='pending';Pages.filterShipments('pending')},200)">
        <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
        <div class="stat-info">
          <div class="stat-label">${I18n.t('pendingDeliveries')}</div>
          <div class="stat-value">${Utils.fmtNum(pending)}</div>
          <div class="stat-change down"><i class="fas fa-arrow-down"></i> needs attention</div>
        </div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="Pages.navigate('shipments');setTimeout(()=>{document.getElementById('shipStatus').value='out-for-delivery';Pages.filterShipments('out-for-delivery')},200)">
        <div class="stat-icon cyan"><i class="fas fa-shipping-fast"></i></div>
        <div class="stat-info">
          <div class="stat-label">${I18n.t('inTransit')}</div>
          <div class="stat-value">${Utils.fmtNum(inTransit)}</div>
          <div class="stat-change up"><i class="fas fa-arrow-up"></i> active routes</div>
        </div>
      </div>
      ${role !== 'customer' && role !== 'driver' ? `
      <div class="stat-card" style="cursor:pointer" onclick="Pages.navigate('finance')">
        <div class="stat-icon purple"><i class="fas fa-chart-line"></i></div>
        <div class="stat-info">
          <div class="stat-label">${I18n.t('totalRevenue')}</div>
          <div class="stat-value" style="font-size:18px">${Utils.fmt(revenue)}</div>
          <div class="stat-change up"><i class="fas fa-arrow-up"></i> 8% vs last month</div>
        </div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="Pages.navigate('drivers')">
        <div class="stat-icon blue"><i class="fas fa-truck"></i></div>
        <div class="stat-info">
          <div class="stat-label">${I18n.t('activeDrivers')}</div>
          <div class="stat-value">${drivers} / ${DB.Drivers.getAll().length}</div>
          <div class="stat-change up"><i class="fas fa-circle" style="color:var(--success);font-size:8px"></i> online now</div>
        </div>
      </div>` : ''}
    </div>

    <div class="grid2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-chart-area"></i> ${I18n.t('shipmentOverview')}</span>
          <select class="filter-select" id="chartPeriod" onchange="Pages.updateDashChart()" style="font-size:12px;padding:4px 8px">
            <option value="7">7 days</option>
            <option value="30" selected>30 days</option>
            <option value="60">60 days</option>
          </select>
        </div>
        <div class="card-body"><div class="chart-container"><canvas id="dashShipChart"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-chart-pie"></i> ${I18n.t('shipmentStats')}</span></div>
        <div class="card-body"><div class="chart-container"><canvas id="dashStatusChart"></canvas></div></div>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-list"></i> ${I18n.t('recentShipments')}</span>
          <button class="btn btn-secondary btn-sm" onclick="Pages.navigate('shipments')">View all</button>
        </div>
        <div class="card-body" style="padding:0">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>${I18n.t('trackingNumber')}</th><th>${I18n.t('receiver')}</th><th>${I18n.t('status')}</th><th>${I18n.t('date')}</th></tr></thead>
              <tbody>
                ${recent.map(s => `<tr>
                  <td><code style="font-size:11px;color:var(--primary)">${s.trackingNumber}</code></td>
                  <td>${s.receiverName}</td>
                  <td>${Utils.statusBadge(s.status)}</td>
                  <td style="color:var(--text-muted);font-size:12px">${Utils.fmtDate(s.createdAt)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-bolt"></i> ${I18n.t('quickActions')}</span></div>
        <div class="card-body">
          <div class="quick-actions">
            <div class="qa-item" onclick="Pages.openCreateShipment()">
              <i class="fas fa-plus-circle"></i><span>${I18n.t('createShipment')}</span>
            </div>
            <div class="qa-item" onclick="Pages.navigate('tracking')">
              <i class="fas fa-search-location"></i><span>${I18n.t('trackPackage')}</span>
            </div>
            <div class="qa-item" onclick="Pages.navigate('warehouse')">
              <i class="fas fa-barcode"></i><span>${I18n.t('scanParcel')}</span>
            </div>
            <div class="qa-item" onclick="Pages.navigate('labels')">
              <i class="fas fa-tags"></i><span>${I18n.t('generateLabel')}</span>
            </div>
            <div class="qa-item" onclick="Pages.navigate('analytics')">
              <i class="fas fa-chart-bar"></i><span>${I18n.t('viewReports')}</span>
            </div>
            <div class="qa-item" onclick="Pages.navigate('customers')">
              <i class="fas fa-user-plus"></i><span>${I18n.t('addCustomer')}</span>
            </div>
            <div class="qa-item" onclick="Pages.navigate('exceptions')">
              <i class="fas fa-exclamation-circle"></i><span>${I18n.t('exceptions')}</span>
            </div>
            <div class="qa-item" onclick="Pages.navigate('gps')">
              <i class="fas fa-map-marked-alt"></i><span>${I18n.t('gpsTracking')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    setTimeout(() => { renderDashCharts(30); }, 100);
  }

  function updateDashChart() {
    const days = parseInt(document.getElementById('chartPeriod')?.value || 30);
    renderDashCharts(days);
  }

  function renderDashCharts(days) {
    // Shipments over time
    Utils.destroyChart('dashShipChart');
    const shipData = DB.Analytics.shipmentsByDay(days);
    const labels = Object.keys(shipData).map(d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; });
    new Chart(document.getElementById('dashShipChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Shipments', data: Object.values(shipData),
          borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)',
          fill: true, tension: 0.4, pointRadius: 3,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    // Status pie
    Utils.destroyChart('dashStatusChart');
    const statusData = DB.Analytics.statusBreakdown();
    const statusColors = { pending:'#f59e0b', processing:'#6366f1', 'in-warehouse':'#8b5cf6', 'out-for-delivery':'#f97316', delivered:'#10b981', exception:'#ef4444', cancelled:'#94a3b8' };
    new Chart(document.getElementById('dashStatusChart'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusData).map(s => s.replace(/-/g,' ')),
        datasets: [{ data: Object.values(statusData), backgroundColor: Object.keys(statusData).map(s => statusColors[s]||'#94a3b8'), borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 }, padding: 12 } } } }
    });
  }

  // ============================================================
  // SHIPMENTS
  // ============================================================
  function renderShipments(page = 1, q = '', statusFilter = 'all') {
    shipPage = page;
    const all = DB.Shipments.search(q, statusFilter !== 'all' ? statusFilter : null);
    const { items, total, totalPages } = Utils.paginate(all, page);
    const role = Auth.getRole();

    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-boxes"></i> ${I18n.t('shipments')}</h1><p>${Utils.fmtNum(total)} total shipments</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="Pages.exportShipments()"><i class="fas fa-download"></i> ${I18n.t('export')}</button>
        <button class="btn btn-primary" onclick="Pages.openCreateShipment()"><i class="fas fa-plus"></i> ${I18n.t('newShipment')}</button>
      </div>
    </div>
    <div class="page-toolbar">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" id="shipSearch" placeholder="${I18n.t('searchShipments')}" value="${q}" oninput="Pages.searchShipments(this.value)">
      </div>
      <select class="filter-select" id="shipStatus" onchange="Pages.filterShipments(this.value)">
        <option value="all" ${statusFilter==='all'?'selected':''}>${I18n.t('allStatuses')}</option>
        <option value="pending" ${statusFilter==='pending'?'selected':''}>Pending</option>
        <option value="processing" ${statusFilter==='processing'?'selected':''}>Processing</option>
        <option value="in-warehouse" ${statusFilter==='in-warehouse'?'selected':''}>In Warehouse</option>
        <option value="out-for-delivery" ${statusFilter==='out-for-delivery'?'selected':''}>Out for Delivery</option>
        <option value="delivered" ${statusFilter==='delivered'?'selected':''}>Delivered</option>
        <option value="exception" ${statusFilter==='exception'?'selected':''}>Exception</option>
        <option value="cancelled" ${statusFilter==='cancelled'?'selected':''}>Cancelled</option>
      </select>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th><input type="checkbox" onchange="Pages.selectAllShipments(this)"></th>
            <th>${I18n.t('trackingNumber')}</th>
            <th>${I18n.t('sender')}</th>
            <th>${I18n.t('receiver')}</th>
            <th>${I18n.t('origin')} → ${I18n.t('destination')}</th>
            <th>${I18n.t('weight')}</th>
            <th>${I18n.t('cbm')}</th>
            <th>${I18n.t('price')}</th>
            <th>${I18n.t('status')}</th>
            <th>${I18n.t('createdAt')}</th>
            <th>${I18n.t('actions')}</th>
          </tr></thead>
          <tbody>
            ${items.length === 0 ? `<tr><td colspan="11"><div class="empty-state"><i class="fas fa-box-open"></i><p>${I18n.t('noData')}</p></div></td></tr>` :
              items.map(s => `<tr>
                <td><input type="checkbox" class="ship-cb" value="${s.id}"></td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <code style="font-size:11px;color:var(--primary);font-weight:700;cursor:pointer;text-decoration:underline dotted" onclick="Pages.viewShipment(${s.id})" title="View detail">${s.trackingNumber}</code>
                    <button class="btn btn-sm" style="padding:2px 6px;font-size:10px" onclick="Utils.copyToClipboard('${s.trackingNumber}')" title="Copy"><i class="fas fa-copy"></i></button>
                  </div>
                  ${s.cod > 0 ? '<span class="badge badge-warning" style="font-size:9px;margin-top:2px">COD</span>' : ''}
                </td>
                <td><div>${s.senderName} ${s.isVIP?'<span style="font-size:10px;color:#b45309;background:#fef3c7;border-radius:4px;padding:1px 5px;vertical-align:middle">⭐VIP</span>':''}</div><small style="color:var(--text-muted)">${s.senderPhone}</small></td>
                <td><div>${s.receiverName}</div><small style="color:var(--text-muted)">${s.receiverPhone}</small></td>
                <td style="font-size:12px"><i class="fas fa-circle" style="color:var(--success);font-size:6px"></i> ${s.senderCity} → ${s.receiverCity}</td>
                <td>${s.weight} kg</td>
                <td style="font-size:12px;color:var(--text-muted)">${((s.length*s.width*s.height)/1e6).toFixed(4)}</td>
                <td style="font-weight:600;color:var(--primary)">${Utils.fmt(s.price)}</td>
                <td>${Utils.statusBadge(s.status)}</td>
                <td style="font-size:12px;color:var(--text-muted)">${Utils.fmtDate(s.createdAt)}</td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-sm btn-secondary" onclick="Pages.viewShipment(${s.id})" title="View"><i class="fas fa-eye"></i></button>
                    ${role !== 'customer' && role !== 'driver' ? `<button class="btn btn-sm btn-secondary" onclick="Pages.editShipment(${s.id})" title="Edit"><i class="fas fa-edit"></i></button>` : ''}
                    <button class="btn btn-sm btn-secondary" onclick="Utils.generateShippingLabel(DB.Shipments.getById(${s.id}),'40x60')" title="Label"><i class="fas fa-tags"></i></button>
                    ${role === 'admin' || role === 'manager' ? `<button class="btn btn-sm btn-danger" onclick="Pages.deleteShipment(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="card-footer" style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:12px;color:var(--text-muted)">Showing ${items.length} of ${total}</span>
        ${Utils.paginationHTML(page, totalPages, 'Pages.renderShipments')}
      </div>
    </div>
    <div id="batchActions" class="hidden" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--secondary);color:#fff;padding:14px 24px;border-radius:var(--radius);display:flex;gap:12px;align-items:center;box-shadow:var(--shadow-lg);z-index:200">
      <span id="batchCount">0 selected</span>
      <button class="btn btn-sm" style="background:rgba(255,255,255,.15);color:#fff" onclick="Pages.batchLabel()"><i class="fas fa-tags"></i> Labels</button>
      <button class="btn btn-sm btn-danger" onclick="Pages.batchDelete()"><i class="fas fa-trash"></i> Delete</button>
      <button class="btn btn-sm" style="background:rgba(255,255,255,.1);color:#fff" onclick="Pages.clearSelection()"><i class="fas fa-times"></i></button>
    </div>`;

    // Selection tracking
    document.querySelectorAll('.ship-cb').forEach(cb => cb.addEventListener('change', updateBatchBar));
  }

  function updateBatchBar() {
    const checked = document.querySelectorAll('.ship-cb:checked');
    const bar = document.getElementById('batchActions');
    if (!bar) return;
    if (checked.length > 0) { bar.classList.remove('hidden'); document.getElementById('batchCount').textContent = `${checked.length} selected`; }
    else bar.classList.add('hidden');
  }

  function selectAllShipments(cb) {
    document.querySelectorAll('.ship-cb').forEach(el => el.checked = cb.checked);
    updateBatchBar();
  }

  function getSelectedIds() { return [...document.querySelectorAll('.ship-cb:checked')].map(el => parseInt(el.value)); }

  function clearSelection() { document.querySelectorAll('.ship-cb').forEach(el => el.checked = false); updateBatchBar(); }

  function batchLabel() {
    const ids = getSelectedIds();
    if (!ids.length) return;
    App.openModal('Batch Labels', `
      <p>Generate labels for ${ids.length} shipments?</p>
      <div class="form-group" style="margin-top:16px">
        <label>Label Size</label>
        <select id="batchSize" class="form-control" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
          <option value="40x60">40×60 mm</option><option value="30x40">30×40 mm</option><option value="A6">A6</option>
        </select>
      </div>
    `, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-download"></i> Download All', cls: 'btn-primary', action: `Pages._doBatchLabel([${ids}])` }
    ]);
  }

  function _doBatchLabel(ids) {
    App.closeModal();
    const size = document.getElementById('batchSize')?.value || '40x60';
    Utils.generateBatchLabels(ids, size);
  }

  function batchDelete() {
    const ids = getSelectedIds();
    if (!ids.length) return;
    App.openModal('Confirm Delete', `<p>Delete ${ids.length} shipments? This cannot be undone.</p>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: 'Delete', cls: 'btn-danger', action: `Pages._doBatchDelete([${ids}])` }
    ]);
  }

  function _doBatchDelete(ids) {
    ids.forEach(id => DB.Shipments.delete(id));
    App.closeModal();
    Utils.toast(`${ids.length} shipments deleted`, 'success');
    renderShipments();
  }

  const searchShipments = Utils.debounce((q) => {
    const status = document.getElementById('shipStatus')?.value || 'all';
    renderShipments(1, q, status);
    setTimeout(() => {
      const el = document.getElementById('shipSearch');
      if (el) { el.focus(); el.selectionStart = el.selectionEnd = q.length; }
    }, 0);
  }, 300);

  function filterShipments(status) {
    const q = document.getElementById('shipSearch')?.value || '';
    renderShipments(1, q, status);
  }

  function viewShipment(id) {
    const s = DB.Shipments.getById(id);
    if (!s) return;
    const history = DB.Tracking.getByShipment(id);
    const agent = DB.Agents.getById(s.agentId);
    const driver = DB.Drivers.getById(s.driverId);
    App.openModal(`${I18n.t('viewDetail')} — ${s.trackingNumber}`, `
      <div class="tabs">
        <button class="tab-btn active" onclick="App.switchTab(this,'tabInfo')">Info</button>
        <button class="tab-btn" onclick="App.switchTab(this,'tabTracking')">Timeline</button>
        <button class="tab-btn" onclick="App.switchTab(this,'tabBarcode')">Barcode / QR</button>
      </div>
      <div id="tabInfo" class="tab-panel active">
        <div class="form-grid2" style="margin-bottom:16px">
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">TRACKING #</label><p style="font-weight:700;color:var(--primary);font-size:16px">${s.trackingNumber}</p></div>
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">STATUS</label><p>${Utils.statusBadge(s.status)}</p></div>
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">SENDER</label><p>${s.senderName}<br><small>${s.senderPhone}</small><br><small>${s.senderAddress}, ${s.senderCity}</small></p></div>
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">RECEIVER</label><p>${s.receiverName}<br><small>${s.receiverPhone}</small><br><small>${s.receiverAddress}, ${s.receiverCity}</small></p></div>
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">WEIGHT / SIZE</label><p>${s.weight} kg · ${s.length}×${s.width}×${s.height} cm · CBM: ${((s.length*s.width*s.height)/1e6).toFixed(4)} m³</p></div>
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">PRICE / COD</label><p>${Utils.fmt(s.price)} ${s.cod > 0 ? `<span class="badge badge-warning">COD: ${Utils.fmt(s.cod)}</span>` : ''}</p></div>
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">SERVICE</label><p>${s.service}</p></div>
          <div><label style="font-size:11px;color:var(--text-muted);font-weight:700">AGENT</label><p>${agent ? agent.name : '—'}</p></div>
          ${driver ? `<div><label style="font-size:11px;color:var(--text-muted);font-weight:700">DRIVER</label><p>${driver.name} · ${driver.vehiclePlate}</p></div>` : ''}
          ${s.notes ? `<div><label style="font-size:11px;color:var(--text-muted);font-weight:700">NOTES</label><p>${s.notes}</p></div>` : ''}
        </div>
      </div>
      <div id="tabTracking" class="tab-panel">
        <div class="track-timeline" style="margin-top:16px">
          ${history.map((h, i) => `<div class="tl-item">
            <div class="tl-dot ${i === history.length-1 ? 'active' : 'done'}"></div>
            <div class="tl-content">
              <div class="tl-status">${h.status.replace(/-/g,' ').toUpperCase()}</div>
              <div class="tl-desc">${h.description} · ${h.location}</div>
              <div class="tl-time"><i class="fas fa-clock"></i> ${Utils.fmtDateTime(h.timestamp)} · ${h.updatedBy}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div id="tabBarcode" class="tab-panel">
        <div class="barcode-container" style="margin-top:16px">
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Tracking Number Barcode</p>
          <svg id="modalBarcode"></svg>
          <div id="modalQR" style="margin-top:16px"></div>
        </div>
      </div>
    `, [
      { label: '<i class="fas fa-tags"></i> Print Label', cls: 'btn-primary', action: `Utils.generateShippingLabel(DB.Shipments.getById(${s.id}),'40x60');App.closeModal()` },
      { label: 'Close', cls: 'btn-secondary', action: 'App.closeModal()' }
    ], 'modal-lg');
    setTimeout(() => {
      Utils.generateBarcode(s.trackingNumber, 'modalBarcode');
      const qrDiv = document.getElementById('modalQR');
      if (qrDiv) Utils.generateQR(`https://track.prologists.la/${s.trackingNumber}`, 'modalQR', { width: 150 });
    }, 100);
  }

  function editShipment(id) {
    const s = DB.Shipments.getById(id) || {};
    openShipmentForm(s, true);
  }

  function openCreateShipment() { openShipmentForm({}, false); }

  function openShipmentForm(s, isEdit) {
    const agents = DB.Agents.getAll();
    const drivers = DB.Drivers.getAll();
    App.openModal(isEdit ? I18n.t('editShipment') : I18n.t('newShipment'), `
      <div class="tabs">
        <button class="tab-btn active" onclick="App.switchTab(this,'stab1')">Sender / Receiver</button>
        <button class="tab-btn" onclick="App.switchTab(this,'stab2')">Package & Service</button>
        <button class="tab-btn" onclick="App.switchTab(this,'stab3')">Assignment</button>
      </div>
      <div id="stab1" class="tab-panel active">
        <div class="form-group" style="margin-bottom:12px">
          <label>${I18n.t('trackingNumber')} <small style="color:var(--text-muted);font-weight:400">(ປ່ອຍວ່າງໃຫ້ລະບົບສ້າງອັດຕະໂນມັດ)</small></label>
          <div style="display:flex;gap:8px">
            <input id="fs_trackingNumber" value="${s.trackingNumber||''}" placeholder="LA20260323001 / ບາໂຄດຕ່າງປະເທດ..." style="flex:1">
            <button type="button" class="btn btn-secondary btn-sm" onclick="Utils.openBarcodeScanner(v=>{document.getElementById('fs_trackingNumber').value=v})" title="ສະແກນບາໂຄດ"><i class="fas fa-barcode"></i></button>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:12px">
          <label>${I18n.t('foreignCarrier')} <small style="color:var(--text-muted);font-weight:400">(ຖ້າເປັນພັດສະດຸຕ່າງປະເທດ)</small></label>
          <input id="fs_foreignCarrier" value="${s.foreignCarrier||''}" placeholder="DHL / FedEx / EMS China / JD Logistics...">
        </div>
        <div class="form-grid2">
          <div class="form-group"><label>${I18n.t('senderName')}</label><input id="fs_sName" value="${s.senderName||''}" required></div>
          <div class="form-group"><label>${I18n.t('senderPhone')}</label><input id="fs_sPhone" value="${s.senderPhone||''}"></div>
          <div class="form-group"><label>${I18n.t('senderAddress')}</label><input id="fs_sAddr" value="${s.senderAddress||''}"></div>
          <div class="form-group"><label>${I18n.t('origin')}</label><input id="fs_sCity" value="${s.senderCity||''}"></div>
          <div class="form-group"><label>${I18n.t('receiverName')}</label><input id="fs_rName" value="${s.receiverName||''}" required></div>
          <div class="form-group"><label>${I18n.t('receiverPhone')}</label><input id="fs_rPhone" value="${s.receiverPhone||''}"></div>
          <div class="form-group"><label>${I18n.t('receiverAddress')}</label><input id="fs_rAddr" value="${s.receiverAddress||''}"></div>
          <div class="form-group"><label>${I18n.t('destination')}</label><input id="fs_rCity" value="${s.receiverCity||''}"></div>
        </div>
      </div>
      <div id="stab2" class="tab-panel">
        <div class="form-grid3">
          <div class="form-group"><label>${I18n.t('weight')}</label><input type="number" id="fs_weight" value="${s.weight||''}" step="0.1" min="0" oninput="Pages.calcAutoPrice()"></div>
          <div class="form-group"><label>${I18n.t('length')}</label><input type="number" id="fs_length" value="${s.length||''}" oninput="Pages.calcCBM()"></div>
          <div class="form-group"><label>${I18n.t('width')}</label><input type="number" id="fs_width" value="${s.width||''}" oninput="Pages.calcCBM()"></div>
          <div class="form-group"><label>${I18n.t('height')}</label><input type="number" id="fs_height" value="${s.height||''}" oninput="Pages.calcCBM()"></div>
          <div class="form-group"><label>${I18n.t('cbm')}</label><input type="text" id="fs_cbm" readonly style="background:var(--bg-secondary);color:var(--text-muted)" value="${s.length&&s.width&&s.height?((s.length*s.width*s.height)/1e6).toFixed(4)+' m³':'—'}"></div>
          <div class="form-group"><label>${I18n.t('declaredValue')}</label><input type="number" id="fs_dValue" value="${s.declaredValue||''}"></div>
          <div class="form-group" style="grid-column:span 2">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600">
              <input type="checkbox" id="fs_isVIP" onchange="Pages.calcAutoPrice()" ${s.isVIP?'checked':''} style="width:16px;height:16px;accent-color:#d97706">
              <span>⭐ ${I18n.t('vipCustomer')} <small style="color:var(--text-muted);font-weight:400">(ໃຊ້ລາຄາ VIP)</small></span>
            </label>
          </div>
          <div class="form-group"><label>${I18n.t('price')}</label><input type="number" id="fs_price" value="${s.price||''}"></div>
        </div>
        <div class="form-grid2">
          <div class="form-group"><label>${I18n.t('service')}</label>
            <select id="fs_service">
              ${['Standard','Express','Economy','Overnight'].map(sv => `<option ${s.service===sv?'selected':''}>${sv}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>${I18n.t('paymentMethod')}</label>
            <select id="fs_payment">
              <option value="prepaid" ${s.paymentMethod==='prepaid'?'selected':''}>Prepaid</option>
              <option value="cod" ${s.paymentMethod==='cod'?'selected':''}>COD</option>
              <option value="account" ${s.paymentMethod==='account'?'selected':''}>Account</option>
            </select>
          </div>
          <div class="form-group"><label>${I18n.t('cod')} (LAK)</label><input type="number" id="fs_cod" value="${s.cod||0}"></div>
          <div class="form-group"><label>${I18n.t('status')}</label>
            <select id="fs_status">
              ${['pending','processing','in-warehouse','out-for-delivery','delivered','exception','cancelled'].map(st => `<option value="${st}" ${s.status===st?'selected':''}>${st}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label>${I18n.t('notes')}</label><textarea id="fs_notes" rows="2">${s.notes||''}</textarea></div>
      </div>
      <div id="stab3" class="tab-panel">
        <div class="form-grid2">
          <div class="form-group"><label>Agent / Branch</label>
            <select id="fs_agent">
              <option value="">-- None --</option>
              ${agents.map(a => `<option value="${a.id}" ${s.agentId==a.id?'selected':''}>${a.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Driver</label>
            <select id="fs_driver">
              <option value="">-- None --</option>
              ${drivers.map(d => `<option value="${d.id}" ${s.driverId==d.id?'selected':''}>${d.name}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    `, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: `<i class="fas fa-save"></i> ${I18n.t('save')}`, cls: 'btn-primary', action: `Pages.saveShipment(${s.id||0})` }
    ], 'modal-lg');
  }

  function saveShipment(id) {
    const tn = document.getElementById('fs_trackingNumber')?.value.trim();
    const data = {
      foreignCarrier: document.getElementById('fs_foreignCarrier')?.value.trim() || '',
      senderName: document.getElementById('fs_sName')?.value.trim(),
      senderPhone: document.getElementById('fs_sPhone')?.value.trim(),
      senderAddress: document.getElementById('fs_sAddr')?.value.trim(),
      senderCity: document.getElementById('fs_sCity')?.value.trim(),
      receiverName: document.getElementById('fs_rName')?.value.trim(),
      receiverPhone: document.getElementById('fs_rPhone')?.value.trim(),
      receiverAddress: document.getElementById('fs_rAddr')?.value.trim(),
      receiverCity: document.getElementById('fs_rCity')?.value.trim(),
      weight: parseFloat(document.getElementById('fs_weight')?.value) || 0,
      length: parseInt(document.getElementById('fs_length')?.value) || 0,
      width: parseInt(document.getElementById('fs_width')?.value) || 0,
      height: parseInt(document.getElementById('fs_height')?.value) || 0,
      declaredValue: parseInt(document.getElementById('fs_dValue')?.value) || 0,
      price: parseInt(document.getElementById('fs_price')?.value) || 0,
      isVIP: document.getElementById('fs_isVIP')?.checked || false,
      cod: parseInt(document.getElementById('fs_cod')?.value) || 0,
      service: document.getElementById('fs_service')?.value,
      paymentMethod: document.getElementById('fs_payment')?.value,
      status: document.getElementById('fs_status')?.value || 'pending',
      notes: document.getElementById('fs_notes')?.value.trim(),
      agentId: parseInt(document.getElementById('fs_agent')?.value) || null,
      driverId: parseInt(document.getElementById('fs_driver')?.value) || null,
    };
    if (!data.receiverName) { Utils.toast('Receiver name required', 'warning'); return; }
    if (tn) data.trackingNumber = tn;
    if (id) { DB.Shipments.update(id, data); Utils.toast('Shipment updated', 'success'); }
    else { const s = DB.Shipments.create(data); Utils.toast(`Created: ${s.trackingNumber}`, 'success'); }
    App.closeModal();
    renderShipments();
  }

  function deleteShipment(id) {
    const s = DB.Shipments.getById(id);
    if (!s) return;
    App.openModal('Confirm Delete', `<p>Delete <strong>${s.trackingNumber}</strong>? This cannot be undone.</p>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: 'Delete', cls: 'btn-danger', action: `DB.Shipments.delete(${id});App.closeModal();Pages.renderShipments();Utils.toast('Deleted','success')` }
    ], 'modal-sm');
  }

  function exportShipments() {
    const all = DB.Shipments.getAll();
    const headers = ['TrackingNumber','SenderName','SenderCity','ReceiverName','ReceiverCity','Weight','Price','Status','CreatedAt'];
    const rows = all.map(s => [s.trackingNumber,s.senderName,s.senderCity,s.receiverName,s.receiverCity,s.weight,s.price,s.status,s.createdAt]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'shipments.csv';
    a.click();
    Utils.toast('Exported to CSV', 'success');
  }

  // ============================================================
  // TRACKING
  // ============================================================
  function renderTracking() {
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header"><h1><i class="fas fa-search-location"></i> ${I18n.t('tracking')}</h1></div>
    <div class="card" style="max-width:600px;margin:0 auto">
      <div class="card-body">
        <div class="scan-area" style="margin-bottom:20px">
          <h3><i class="fas fa-barcode"></i> ${I18n.t('trackParcel')}</h3>
          <p>${I18n.t('enterTracking')}</p>
          <div class="scan-input-wrap">
            <input type="text" id="trackInput" placeholder="LA20260322001" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()" onkeydown="if(event.key==='Enter') Pages.doTrack()">
            <button onclick="Utils.openBarcodeScanner(v=>{document.getElementById('trackInput').value=v.toUpperCase();Pages.doTrack()})" title="Scan barcode"><i class="fas fa-camera"></i></button>
            <button onclick="Pages.doTrack()"><i class="fas fa-search"></i></button>
          </div>
        </div>
        <div id="trackResult"></div>
      </div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><span class="card-title"><i class="fas fa-history"></i> ${I18n.t('recentShipments')}</span></div>
      <div class="card-body" style="padding:0">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>${I18n.t('trackingNumber')}</th><th>${I18n.t('receiver')}</th><th>${I18n.t('status')}</th><th>${I18n.t('lastUpdate')}</th><th></th></tr></thead>
            <tbody>
              ${[...DB.Shipments.getAll()].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,10).map(s=>`
              <tr>
                <td><code style="color:var(--primary)">${s.trackingNumber}</code></td>
                <td>${s.receiverName}</td>
                <td>${Utils.statusBadge(s.status)}</td>
                <td style="font-size:12px;color:var(--text-muted)">${Utils.fmtRelative(s.updatedAt)}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="document.getElementById('trackInput').value='${s.trackingNumber}';Pages.doTrack()">Track</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function doTrack() {
    const tn = document.getElementById('trackInput')?.value.trim().toUpperCase();
    if (!tn) { Utils.toast('ກະລຸນາໃສ່ເລກຕິດຕາມ', 'warning'); return; }
    const result = document.getElementById('trackResult');
    if (!result) return;
    const s = DB.Shipments.getByTracking(tn);
    if (!s) { result.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>${I18n.t('noTrackingFound')}</p></div>`; result.scrollIntoView({behavior:'smooth',block:'nearest'}); return; }
    const history = DB.Tracking.getByShipment(s.id);
    result.innerHTML = `
      <div style="background:var(--primary-pale);border-radius:var(--radius);padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <p style="font-size:12px;color:var(--text-muted)">${I18n.t('trackingNumber')}</p>
            <p style="font-size:20px;font-weight:800;color:var(--primary)">${s.trackingNumber}</p>
          </div>
          <div>${Utils.statusBadge(s.status)}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;font-size:13px">
          <div><strong>From:</strong> ${s.senderName}, ${s.senderCity}</div>
          <div><strong>To:</strong> ${s.receiverName}, ${s.receiverCity}</div>
          <div><strong>Weight:</strong> ${s.weight} kg</div>
          <div><strong>Service:</strong> ${s.service}</div>
        </div>
      </div>
      <h4 style="margin-bottom:12px;font-size:14px">${I18n.t('trackingTimeline')}</h4>
      <div class="track-timeline">
        ${history.map((h, i) => `<div class="tl-item">
          <div class="tl-dot ${i === history.length-1 ? 'active' : 'done'}"></div>
          <div class="tl-content">
            <div class="tl-status">${h.status.replace(/-/g,' ').toUpperCase()}</div>
            <div class="tl-desc">${h.description} · <em>${h.location}</em></div>
            <div class="tl-time"><i class="fas fa-clock"></i> ${Utils.fmtDateTime(h.timestamp)}</div>
          </div>
        </div>`).join('')}
      </div>
      <div style="text-align:right;margin-top:16px">
        <button class="btn btn-secondary btn-sm" onclick="Utils.generateShippingLabel(DB.Shipments.getByTracking('${s.trackingNumber}'),'40x60')">
          <i class="fas fa-tags"></i> Print Label
        </button>
      </div>`;
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  // Public tracking (auth screen)
  function publicTrack() {
    const tn = document.getElementById('pubTrackInput')?.value.trim().toUpperCase();
    if (!tn) { Utils.toast('ກະລຸນາໃສ່ເລກຕິດຕາມ', 'warning'); return; }
    const result = document.getElementById('pubTrackResult');
    if (!result) return;
    const s = DB.Shipments.getByTracking(tn);
    if (!s) { result.innerHTML = `<p style="color:var(--danger);text-align:center;padding:16px">${I18n.t('noTrackingFound')}</p>`; result.scrollIntoView({behavior:'smooth',block:'nearest'}); return; }
    const history = DB.Tracking.getByShipment(s.id);
    result.innerHTML = `
      <div style="background:var(--primary-pale);border-radius:8px;padding:14px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <code style="color:var(--primary);font-weight:700;font-size:15px">${s.trackingNumber}</code>
          ${Utils.statusBadge(s.status)}
        </div>
        <div style="font-size:12px;margin-top:8px;color:var(--text-muted)">
          <div>From: ${s.senderName}, ${s.senderCity}</div>
          <div>To: ${s.receiverName}, ${s.receiverCity}</div>
        </div>
      </div>
      <div class="track-timeline">
        ${history.slice(-4).map((h, i) => `<div class="tl-item">
          <div class="tl-dot ${i === history.length-1 || i===3 ? 'active' : 'done'}"></div>
          <div class="tl-content">
            <div class="tl-status" style="font-size:12px;font-weight:700">${h.status.replace(/-/g,' ')}</div>
            <div class="tl-desc" style="font-size:11px;color:var(--text-muted)">${h.description}</div>
            <div class="tl-time" style="font-size:11px">${Utils.fmtDateTime(h.timestamp)}</div>
          </div>
        </div>`).join('')}
      </div>`;
    result.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function getCurrentPage() { return currentPage; }

  function calcCBM() {
    const l = parseFloat(document.getElementById('fs_length')?.value) || 0;
    const w = parseFloat(document.getElementById('fs_width')?.value)  || 0;
    const h = parseFloat(document.getElementById('fs_height')?.value) || 0;
    const cbm = (l && w && h) ? (l*w*h)/1e6 : 0;
    const cbmEl = document.getElementById('fs_cbm');
    if (cbmEl) cbmEl.value = cbm ? cbm.toFixed(4)+' m³' : '—';
    calcAutoPrice(cbm);
  }

  function calcAutoPrice(cbm) {
    const rates   = Pages3.getPricingRates();
    const isVIP   = document.getElementById('fs_isVIP')?.checked;
    const kg      = parseFloat(document.getElementById('fs_weight')?.value) || 0;
    const priceEl = document.getElementById('fs_price');
    if (!priceEl) return;
    const cbmVal  = cbm !== undefined ? cbm : parseFloat(document.getElementById('fs_cbm')?.value) || 0;
    const rateKg  = isVIP ? (rates.vipPerKg  || rates.perKg)  : rates.perKg;
    const rateCBM = isVIP ? (rates.vipPerCBM || rates.perCBM) : rates.perCBM;
    const auto    = Math.max(kg * rateKg, cbmVal * rateCBM);
    if (auto > 0) priceEl.value = Math.round(auto);
  }

  return { navigate, getCurrentPage, renderDashboard, updateDashChart, renderShipments, searchShipments, filterShipments, viewShipment, editShipment, openCreateShipment, openShipmentForm, saveShipment, deleteShipment, exportShipments, selectAllShipments, clearSelection, batchLabel, _doBatchLabel, batchDelete, _doBatchDelete, renderTracking, doTrack, publicTrack, calcCBM, calcAutoPrice };
})();
