// ============================================================
// Pages3 — Analytics, Exceptions, Payments, Labels, GPS,
//           Notifications, Settings
// ============================================================
const Pages3 = (() => {

  // ============================================================
  // ANALYTICS
  // ============================================================
  function renderAnalytics() {
    const topCities = DB.Analytics.topCities(6);
    const topAgents = DB.Analytics.topAgents(5);
    const deliveryRate = DB.Analytics.deliveryRate();
    const total = DB.Shipments.getAll().length;

    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-chart-bar"></i> ${I18n.t('analytics')}</h1></div>
      <select class="filter-select" id="analyticsPeriod" onchange="Pages3.reloadAnalytics()">
        <option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="60">Last 60 days</option>
      </select>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-boxes"></i></div><div class="stat-info"><div class="stat-label">Total Shipments</div><div class="stat-value">${Utils.fmtNum(total)}</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> 12% vs prev period</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-percentage"></i></div><div class="stat-info"><div class="stat-label">Delivery Rate</div><div class="stat-value">${deliveryRate}%</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> above target</div></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-clock"></i></div><div class="stat-info"><div class="stat-label">Avg Delivery Time</div><div class="stat-value">2.4d</div><div class="stat-change down"><i class="fas fa-arrow-down"></i> improving</div></div></div>
      <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-chart-line"></i></div><div class="stat-info"><div class="stat-label">Revenue (30d)</div><div class="stat-value" style="font-size:18px">${Utils.fmt(DB.Finance.getTotalIncome())}</div><div class="stat-change up"><i class="fas fa-arrow-up"></i> 8%</div></div></div>
    </div>
    <div class="grid2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-chart-area"></i> Shipments Over Time</span></div>
        <div class="card-body"><div class="chart-container"><canvas id="shipTrendChart"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-chart-line"></i> Revenue Trend</span></div>
        <div class="card-body"><div class="chart-container"><canvas id="revTrendChart"></canvas></div></div>
      </div>
    </div>
    <div class="grid2">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-map-marker-alt"></i> Top Destination Cities</span></div>
        <div class="card-body">
          <div class="chart-container chart-sm" style="margin-bottom:16px"><canvas id="cityChart"></canvas></div>
          ${topCities.map(([city, count], i) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="width:20px;text-align:right;color:var(--text-muted);font-size:12px">${i+1}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:3px"><span>${city}</span><span>${count} shipments</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(count/topCities[0][1]*100)}%"></div></div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-store"></i> Top Agents</span></div>
        <div class="card-body">
          <div class="chart-container chart-sm" style="margin-bottom:16px"><canvas id="agentChart"></canvas></div>
          ${topAgents.map((a, i) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="width:20px;text-align:right;color:var(--text-muted);font-size:12px">${i+1}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:3px"><span>${a.name}</span><span>${a.count} shipments</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:${Math.round(a.count/topAgents[0].count*100)}%"></div></div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;

    setTimeout(() => {
      const days = parseInt(document.getElementById('analyticsPeriod')?.value || 30);
      const shipData = DB.Analytics.shipmentsByDay(days);
      const revData = DB.Analytics.revenueByDay(days);
      const labels = Object.keys(shipData).map(d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; });

      Utils.destroyChart('shipTrendChart');
      new Chart(document.getElementById('shipTrendChart'), {
        type: 'line',
        data: { labels, datasets: [{ label: 'Shipments', data: Object.values(shipData), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)', fill: true, tension: 0.4, pointRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });

      Utils.destroyChart('revTrendChart');
      new Chart(document.getElementById('revTrendChart'), {
        type: 'line',
        data: { labels, datasets: [{ label: 'Revenue (LAK)', data: Object.values(revData), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: 0.4, pointRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });

      Utils.destroyChart('cityChart');
      new Chart(document.getElementById('cityChart'), {
        type: 'bar',
        data: { labels: topCities.map(([c])=>c), datasets: [{ data: topCities.map(([,n])=>n), backgroundColor: '#3b82f6', borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });

      Utils.destroyChart('agentChart');
      new Chart(document.getElementById('agentChart'), {
        type: 'horizontalBar' in Chart.defaults.controllers ? 'horizontalBar' : 'bar',
        data: { labels: topAgents.map(a=>a.name), datasets: [{ data: topAgents.map(a=>a.count), backgroundColor: '#6366f1', borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
      });
    }, 100);
  }

  function reloadAnalytics() { renderAnalytics(); }

  // ============================================================
  // EXCEPTIONS
  // ============================================================
  function renderExceptions() {
    const all = DB.Exceptions.getAll();
    const typeIcons = { lost: 'fa-search', 'wrong-address': 'fa-map-marker-alt', rejected: 'fa-times-circle', damage: 'fa-box-open', other: 'fa-exclamation' };
    const typeCls = { lost: 'exc-lost', 'wrong-address': 'exc-wrong', rejected: 'exc-rejected', damage: 'exc-wrong', other: 'exc-other' };

    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-exclamation-circle"></i> ${I18n.t('exceptions')}</h1></div>
      <button class="btn btn-primary" onclick="Pages3.openExceptionForm()"><i class="fas fa-plus"></i> ${I18n.t('reportException')}</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><div class="stat-label">Open Issues</div><div class="stat-value">${all.filter(e=>e.status==='open').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-spinner"></i></div><div class="stat-info"><div class="stat-label">In Progress</div><div class="stat-value">${all.filter(e=>e.status==='in-progress').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-info"><div class="stat-label">Resolved</div><div class="stat-value">${all.filter(e=>e.status==='resolved').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-list"></i></div><div class="stat-info"><div class="stat-label">Total</div><div class="stat-value">${all.length}</div></div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${all.length === 0 ? '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No exceptions recorded!</p></div>' :
        all.map(e => `
        <div class="exc-item">
          <div class="exc-type-icon ${typeCls[e.type]||'exc-other'}"><i class="fas ${typeIcons[e.type]||'fa-exclamation'}"></i></div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap">
              <div>
                <code style="color:var(--primary);font-weight:700">${e.trackingNumber||'N/A'}</code>
                <span style="margin-left:8px;font-size:12px;color:var(--text-muted)">${e.type?.replace(/-/g,' ').toUpperCase()}</span>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                ${Utils.priorityBadge(e.priority)}
                ${Utils.statusBadge(e.status)}
              </div>
            </div>
            <p style="margin:6px 0;font-size:13px">${e.description}</p>
            <div style="font-size:11px;color:var(--text-muted);display:flex;gap:16px">
              <span><i class="fas fa-user"></i> Reported by: ${e.reportedBy}</span>
              <span><i class="fas fa-user-shield"></i> Assigned: ${e.assignedTo}</span>
              <span><i class="fas fa-clock"></i> ${Utils.fmtRelative(e.createdAt)}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${e.status !== 'resolved' ? `
            <button class="btn btn-sm btn-success" onclick="Pages3.resolveException(${e.id})"><i class="fas fa-check"></i> Resolve</button>
            <button class="btn btn-sm btn-secondary" onclick="Pages3.editException(${e.id})"><i class="fas fa-edit"></i></button>` :
            '<span style="font-size:11px;color:var(--success)"><i class="fas fa-check-circle"></i> Resolved</span>'}
          </div>
        </div>`).join('')}
    </div>`;
  }

  function openExceptionForm() {
    const shipments = DB.Shipments.getAll().slice(0, 20);
    App.openModal(I18n.t('reportException'), `
      <div class="form-grid2">
        <div class="form-group"><label>Shipment / Tracking #</label>
          <select id="exc_ship">
            <option value="">-- Select Shipment --</option>
            ${shipments.map(s=>`<option value="${s.id}" data-tn="${s.trackingNumber}">${s.trackingNumber} — ${s.receiverName}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>${I18n.t('issueType')}</label>
          <select id="exc_type">
            <option value="lost">Lost Parcel</option>
            <option value="wrong-address">Wrong Address</option>
            <option value="rejected">Rejected</option>
            <option value="damage">Damage</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group"><label>${I18n.t('priority')}</label>
          <select id="exc_priority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select>
        </div>
        <div class="form-group"><label>${I18n.t('assignedTo')}</label>
          <input id="exc_assigned" placeholder="e.g. Manager Lee">
        </div>
      </div>
      <div class="form-group"><label>${I18n.t('description')}</label><textarea id="exc_desc" rows="3" placeholder="Describe the issue..."></textarea></div>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-exclamation-circle"></i> Report', cls: 'btn-danger', action: 'Pages3.saveException()' }
    ]);
  }

  function saveException() {
    const shipId = parseInt(document.getElementById('exc_ship')?.value) || null;
    const tn = shipId ? DB.Shipments.getById(shipId)?.trackingNumber : '';
    const data = {
      shipmentId: shipId, trackingNumber: tn,
      type: document.getElementById('exc_type')?.value,
      priority: document.getElementById('exc_priority')?.value,
      description: document.getElementById('exc_desc')?.value.trim(),
      reportedBy: Auth.getUser()?.name || 'Staff',
      assignedTo: document.getElementById('exc_assigned')?.value.trim() || 'Unassigned',
    };
    if (!data.description) { Utils.toast('Description required', 'warning'); return; }
    DB.Exceptions.create(data);
    if (shipId) DB.Shipments.updateStatus(shipId, 'exception', 'Hub', `Exception reported: ${data.type}`);
    App.closeModal();
    Utils.toast('Exception reported', 'warning');
    renderExceptions();
  }

  function resolveException(id) {
    DB.Exceptions.resolve(id);
    Utils.toast('Exception resolved', 'success');
    renderExceptions();
  }

  function editException(id) {
    const e = DB.Exceptions.getById(id);
    if (!e) return;
    App.openModal('Update Exception', `
      <div class="form-group"><label>Status</label>
        <select id="exc_status"><option value="open" ${e.status==='open'?'selected':''}>Open</option><option value="in-progress" ${e.status==='in-progress'?'selected':''}>In Progress</option><option value="resolved" ${e.status==='resolved'?'selected':''}>Resolved</option></select>
      </div>
      <div class="form-group"><label>Assigned To</label><input id="exc_ass2" value="${e.assignedTo||''}"></div>
      <div class="form-group"><label>Notes</label><textarea id="exc_notes" rows="3">${e.description||''}</textarea></div>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-save"></i> Update', cls: 'btn-primary', action: `Pages3.updateException(${id})` }
    ]);
  }

  function updateException(id) {
    DB.Exceptions.update(id, {
      status: document.getElementById('exc_status')?.value,
      assignedTo: document.getElementById('exc_ass2')?.value.trim(),
      description: document.getElementById('exc_notes')?.value.trim(),
      resolvedAt: document.getElementById('exc_status')?.value === 'resolved' ? new Date().toISOString() : null,
    });
    App.closeModal();
    Utils.toast('Exception updated', 'success');
    renderExceptions();
  }

  // ============================================================
  // PAYMENTS
  // ============================================================
  function renderPayments() {
    const shipments = DB.Shipments.getAll().filter(s => s.cod > 0 || s.price > 0).slice(0, 20);
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header"><h1><i class="fas fa-credit-card"></i> ${I18n.t('payments')}</h1></div>
    <div class="tabs">
      <button class="tab-btn active" onclick="App.switchTab(this,'tabQR')">QR Payment</button>
      <button class="tab-btn" onclick="App.switchTab(this,'tabOnline')">Online Payment</button>
      <button class="tab-btn" onclick="App.switchTab(this,'tabCOD')">Cash on Delivery</button>
    </div>
    <div id="tabQR" class="tab-panel active">
      <div class="grid2">
        <div class="card">
          <div class="card-header"><span class="card-title"><i class="fas fa-qrcode"></i> Generate QR Payment</span></div>
          <div class="card-body">
            <div class="form-group"><label>Amount (LAK)</label><input type="number" id="qr_amount" placeholder="150000" oninput="Pages3.updateQRPreview()"></div>
            <div class="form-group"><label>Reference / Tracking #</label><input id="qr_ref" placeholder="LA20260322001" oninput="Pages3.updateQRPreview()"></div>
            <div class="form-group"><label>Description</label><input id="qr_desc" placeholder="Shipping payment"></div>
            <button class="btn btn-primary" onclick="Pages3.generatePaymentQR()"><i class="fas fa-qrcode"></i> ${I18n.t('generateQR')}</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title"><i class="fas fa-eye"></i> QR Preview</span></div>
          <div class="card-body">
            <div class="payment-qr-wrap">
              <div id="payQRCanvas" style="width:200px;height:200px;display:flex;align-items:center;justify-content:center"></div>
              <p id="qrAmountDisplay" style="font-size:20px;font-weight:800;color:var(--primary);margin-top:8px">0 LAK</p>
              <p id="qrRefDisplay" style="font-size:13px;color:var(--text-muted)">Enter amount to preview</p>
              <button class="btn btn-secondary btn-sm" onclick="Pages3.downloadQR()"><i class="fas fa-download"></i> Download QR</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="tabOnline" class="tab-panel">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-globe"></i> Online Payment Links</span></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:20px">
            ${[{name:'BCEL One',icon:'fa-university',color:'#1e40af'},{name:'Stripe',icon:'fa-stripe',color:'#6366f1'},{name:'PayPal',icon:'fa-paypal',color:'#0070ba'},{name:'ABA Bank',icon:'fa-credit-card',color:'#e11d48'}].map(p=>`
            <div style="background:var(--bg);border-radius:var(--radius-sm);padding:20px;text-align:center;cursor:pointer;border:2px solid var(--border);transition:.2s" onmouseover="this.style.borderColor='${p.color}'" onmouseout="this.style.borderColor='var(--border)'" onclick="Utils.toast('${p.name} integration — configure API keys in settings','info')">
              <i class="fas ${p.icon}" style="font-size:28px;color:${p.color};margin-bottom:8px"></i>
              <p style="font-size:13px;font-weight:600">${p.name}</p>
            </div>`).join('')}
          </div>
          <p style="color:var(--text-muted);font-size:13px"><i class="fas fa-info-circle"></i> Configure payment gateway API keys in Settings → Payment Integration</p>
        </div>
      </div>
    </div>
    <div id="tabCOD" class="tab-panel">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-money-bill-wave"></i> COD Pending Collection</span></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Tracking #</th><th>Receiver</th><th>COD Amount</th><th>Status</th><th>Driver</th><th>Action</th></tr></thead>
            <tbody>
              ${shipments.filter(s=>s.cod>0).slice(0,15).map(s=>{
                const driver = DB.Drivers.getById(s.driverId);
                return `<tr>
                  <td><code style="color:var(--primary)">${s.trackingNumber}</code></td>
                  <td>${s.receiverName}</td>
                  <td style="font-weight:700;color:var(--success)">${Utils.fmt(s.cod)}</td>
                  <td>${Utils.statusBadge(s.status)}</td>
                  <td>${driver ? driver.name : '—'}</td>
                  <td>${s.status==='delivered'?'<span class="badge badge-delivered">Collected</span>':`<button class="btn btn-sm btn-warning" onclick="Pages3.markCODCollected(${s.id})"><i class="fas fa-check"></i> Collect</button>`}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;

    setTimeout(() => {
      Utils.generateQR('https://pay.prologists.la/0 LAK', 'payQRCanvas', { width: 200 });
    }, 100);
  }

  function updateQRPreview() {
    const amt = document.getElementById('qr_amount')?.value || '0';
    const ref = document.getElementById('qr_ref')?.value || '';
    document.getElementById('qrAmountDisplay').textContent = `${Utils.fmtNum(parseInt(amt)||0)} LAK`;
    document.getElementById('qrRefDisplay').textContent = ref || 'No reference';
  }

  function generatePaymentQR() {
    const amt = document.getElementById('qr_amount')?.value;
    const ref = document.getElementById('qr_ref')?.value;
    const desc = document.getElementById('qr_desc')?.value;
    if (!amt) { Utils.toast('Enter amount', 'warning'); return; }
    const qrData = JSON.stringify({ amount: amt, currency: 'LAK', ref, desc, merchant: 'ProLogis ERP', timestamp: new Date().toISOString() });
    Utils.generateQR(qrData, 'payQRCanvas', { width: 200 });
    updateQRPreview();
    Utils.toast('QR code generated', 'success');
  }

  function downloadQR() {
    const div = document.getElementById('payQRCanvas');
    const canvas = div?.querySelector('canvas');
    if (!canvas) { Utils.toast('ສ້າງ QR ກ່ອນ', 'warning'); return; }
    const a = document.createElement('a'); a.href = canvas.toDataURL(); a.download = 'payment-qr.png'; a.click();
    Utils.toast('QR downloaded', 'success');
  }

  function markCODCollected(id) {
    DB.Shipments.update(id, { codCollected: true });
    DB.Finance.addRecord({ type: 'income', category: 'cod', amount: DB.Shipments.getById(id)?.cod || 0, description: `COD collected: ${DB.Shipments.getById(id)?.trackingNumber}` });
    Utils.toast('COD marked as collected', 'success');
    renderPayments();
  }

  // ============================================================
  // LABELS
  // ============================================================
  function renderLabels() {
    const shipments = DB.Shipments.getAll().slice(0, 20);
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header"><div><h1><i class="fas fa-tags"></i> ${I18n.t('labels')}</h1></div></div>
    <div class="grid2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-cog"></i> Label Settings</span></div>
        <div class="card-body">
          <div class="form-group"><label>${I18n.t('labelSize')}</label>
            <select id="labelSize" onchange="Pages3.previewLabel()">
              <option value="40x60">40×60 mm (Default)</option>
              <option value="30x40">30×40 mm (Small)</option>
              <option value="A6">A6 (Large)</option>
            </select>
          </div>
          <div class="form-group"><label>Select Shipment</label>
            <select id="labelShip" onchange="Pages3.previewLabel()">
              <option value="">-- Choose shipment --</option>
              ${shipments.map(s=>`<option value="${s.id}">${s.trackingNumber} → ${s.receiverName}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Company Name on Label</label><input id="labelCompany" value="ProLogis ERP" oninput="Pages3.previewLabel()"></div>
          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn btn-primary" onclick="Pages3.printSingleLabel()"><i class="fas fa-download"></i> Download PDF</button>
            <button class="btn btn-secondary" onclick="Pages3.previewLabel()"><i class="fas fa-eye"></i> Preview</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-eye"></i> Label Preview</span></div>
        <div class="card-body" style="display:flex;justify-content:center;align-items:flex-start;min-height:200px">
          <div id="labelPreviewArea"><p style="color:var(--text-muted);margin-top:40px;text-align:center">Select a shipment to preview</p></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fas fa-print"></i> ${I18n.t('batchPrint')}</span>
        <div style="display:flex;gap:8px">
          <select class="filter-select" id="batchLabelSize"><option value="40x60">40×60mm</option><option value="30x40">30×40mm</option><option value="A6">A6</option></select>
          <button class="btn btn-primary btn-sm" onclick="Pages3.batchPrintSelected()"><i class="fas fa-print"></i> Print Selected</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th><input type="checkbox" id="selectAllLabels" onchange="Pages3.selectAllLabels(this)"></th>
            <th>Tracking #</th><th>Sender</th><th>Receiver</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            ${shipments.map(s=>`<tr>
              <td><input type="checkbox" class="label-cb" value="${s.id}"></td>
              <td><code style="color:var(--primary)">${s.trackingNumber}</code></td>
              <td>${s.senderName}</td><td>${s.receiverName}</td>
              <td>${Utils.statusBadge(s.status)}</td>
              <td><button class="btn btn-sm btn-primary" onclick="Utils.generateShippingLabel(DB.Shipments.getById(${s.id}),document.getElementById('batchLabelSize')?.value||'40x60')"><i class="fas fa-download"></i> PDF</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function previewLabel() {
    const shipId = document.getElementById('labelShip')?.value;
    const size = document.getElementById('labelSize')?.value || '40x60';
    const area = document.getElementById('labelPreviewArea');
    if (!area) return;
    if (!shipId) { area.innerHTML = '<p style="color:var(--text-muted);margin-top:40px;text-align:center">Select a shipment</p>'; return; }
    const s = DB.Shipments.getById(parseInt(shipId));
    if (!s) return;
    const co = document.getElementById('labelCompany')?.value || 'ProLogis ERP';
    const sizeMap = { '40x60': { w: 200, h: 300 }, '30x40': { w: 150, h: 200 }, A6: { w: 420, h: 300 } };
    const dim = sizeMap[size] || { w: 200, h: 300 };
    area.innerHTML = `
      <div style="border:1px solid #ccc;padding:12px;background:#fff;border-radius:4px;box-shadow:2px 2px 8px rgba(0,0,0,.1);font-size:${size==='A6'?'11px':'9px'};width:${dim.w}px">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ddd;padding-bottom:6px;margin-bottom:6px">
          <span style="font-weight:800;font-size:${size==='A6'?'14px':'10px'};color:#1e40af">${co}</span>
          <span style="background:#1e40af;color:#fff;padding:2px 6px;border-radius:3px;font-size:${size==='A6'?'9px':'7px'}">${s.service}</span>
        </div>
        <div style="font-size:${size==='A6'?'16px':'11px'};font-weight:800;text-align:center;padding:8px 0;border:2px solid #1e40af;border-radius:4px;margin-bottom:6px;color:#1e40af;letter-spacing:1px">${s.trackingNumber}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:${size==='A6'?'10px':'8px'}">
          <div>
            <div style="font-weight:700;color:#64748b;font-size:7px;text-transform:uppercase;margin-bottom:2px">FROM</div>
            <div>${s.senderName}</div><div>${s.senderPhone}</div><div>${s.senderCity}</div>
          </div>
          <div>
            <div style="font-weight:700;color:#64748b;font-size:7px;text-transform:uppercase;margin-bottom:2px">TO</div>
            <div>${s.receiverName}</div><div>${s.receiverPhone}</div><div>${s.receiverCity}</div>
          </div>
        </div>
        ${s.cod > 0 ? `<div style="background:#fef3c7;padding:4px 8px;margin-top:6px;border-radius:3px;text-align:center;font-weight:700;color:#92400e">COD: ${Utils.fmtNum(s.cod)} LAK</div>` : ''}
        <div style="text-align:center;margin-top:6px;font-size:7px;color:#94a3b8">${Utils.fmtDate(s.createdAt)} · ${dim.w === 420 ? '105×148mm A6' : size}</div>
      </div>`;
  }

  function printSingleLabel() {
    const shipId = parseInt(document.getElementById('labelShip')?.value);
    const size = document.getElementById('labelSize')?.value || '40x60';
    const s = DB.Shipments.getById(shipId);
    if (!s) { Utils.toast('Select a shipment first', 'warning'); return; }
    Utils.generateShippingLabel(s, size);
  }

  function selectAllLabels(cb) { document.querySelectorAll('.label-cb').forEach(el => el.checked = cb.checked); }

  function batchPrintSelected() {
    const ids = [...document.querySelectorAll('.label-cb:checked')].map(el => parseInt(el.value));
    if (!ids.length) { Utils.toast('Select at least one shipment', 'warning'); return; }
    const size = document.getElementById('batchLabelSize')?.value || '40x60';
    Utils.generateBatchLabels(ids, size);
  }

  // ============================================================
  // GPS TRACKING
  // ============================================================
  function renderGPS() {
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header"><h1><i class="fas fa-map-marked-alt"></i> ${I18n.t('gpsTracking')}</h1></div>
    <div class="grid2">
      <div class="card" style="grid-column:span 2">
        <div class="card-header"><span class="card-title"><i class="fas fa-map"></i> Live Driver Map</span>
          <button class="btn btn-sm btn-secondary" onclick="Pages3.refreshGPS()"><i class="fas fa-sync"></i> Refresh</button>
        </div>
        <div class="card-body" style="padding:0">
          <div id="gpsMap" class="map-container"></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:20px">
      <div class="card-header"><span class="card-title"><i class="fas fa-truck"></i> Driver Status</span></div>
      <div class="map-driver-list">
        ${DB.Drivers.getAll().map(d=>`
        <div class="map-driver-item" onclick="Pages3.focusDriver(${d.id},${d.currentLocation?.lat||17.97},${d.currentLocation?.lng||102.63})">
          <div class="driver-status-dot ${d.status}"></div>
          <div class="driver-avatar" style="width:36px;height:36px;font-size:14px">${d.name.charAt(0)}</div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:13px">${d.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${d.vehicleType} · ${d.vehiclePlate}</div>
          </div>
          <div style="text-align:right">
            ${Utils.statusBadge(d.status)}
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${d.assignedParcels} parcels</div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;

    setTimeout(() => initMap(), 200);
  }

  let mapInstance = null;
  function initMap() {
    if (typeof L === 'undefined') { document.getElementById('gpsMap').innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)"><i class="fas fa-map" style="font-size:40px;opacity:.3"></i><p>Map loading...</p></div>'; return; }
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    mapInstance = L.map('gpsMap').setView([17.97, 102.63], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapInstance);

    const colors = { online: '#10b981', offline: '#94a3b8' };
    DB.Drivers.getAll().forEach(d => {
      if (!d.currentLocation) return;
      const icon = L.divIcon({
        html: `<div style="background:${colors[d.status]};color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">${d.name.charAt(0)}</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20], className: ''
      });
      L.marker([d.currentLocation.lat, d.currentLocation.lng], { icon })
        .addTo(mapInstance)
        .bindPopup(`<strong>${d.name}</strong><br>${d.vehicleType} · ${d.vehiclePlate}<br>Assigned: ${d.assignedParcels} parcels<br><span style="color:${colors[d.status]}">${d.status.toUpperCase()}</span>`);
    });
  }

  function focusDriver(id, lat, lng) {
    if (mapInstance) { mapInstance.setView([lat, lng], 15); }
  }

  function refreshGPS() {
    Utils.toast('GPS data refreshed', 'success');
    DB.Drivers.getAll().forEach(d => {
      if (d.status === 'online' && d.currentLocation) {
        DB.Drivers.update(d.id, { currentLocation: { lat: d.currentLocation.lat + (Math.random()-.5)*0.002, lng: d.currentLocation.lng + (Math.random()-.5)*0.002 } });
      }
    });
    initMap();
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  function renderNotifications() {
    const all = DB.Notifications.getAll();
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-bell"></i> ${I18n.t('allNotifications')}</h1></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="Pages3.markAllRead()"><i class="fas fa-check-double"></i> ${I18n.t('markAllRead')}</button>
        <button class="btn btn-primary" onclick="Pages3.openSendNotification()"><i class="fas fa-paper-plane"></i> ${I18n.t('sendNotification')}</button>
      </div>
    </div>
    <div class="grid2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-inbox"></i> Notification Inbox</span></div>
        <div style="divide-y">
          ${all.length === 0 ? '<div class="empty-state" style="padding:40px"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>' :
            all.map(n=>`
            <div class="np-item" style="${n.read?'opacity:.6':''}">
              <div class="np-icon ${n.type}"><i class="fas ${n.icon||'fa-bell'}"></i></div>
              <div class="np-content" style="flex:1">
                <p>${n.title} ${!n.read?'<span style="background:var(--danger);color:#fff;font-size:9px;padding:1px 5px;border-radius:8px;vertical-align:middle">NEW</span>':''}</p>
                <span>${n.body}</span><br>
                <span style="font-size:10px">${n.time}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-paper-plane"></i> Send Notification</span></div>
        <div class="card-body">
          <div class="form-group"><label>Channel</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${[{icon:'fa-sms',label:'SMS',cls:'btn-secondary'},{icon:'fa-whatsapp',label:'WhatsApp',cls:'btn-success'},{icon:'fa-telegram',label:'Telegram',cls:'btn-info'},{icon:'fa-envelope',label:'Email',cls:'btn-secondary'}].map(ch=>`
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 10px;border-radius:6px;border:1px solid var(--border);font-size:12px">
                <input type="checkbox" class="notif-channel" value="${ch.label}" style="width:14px;height:14px">
                <i class="fab ${ch.icon}" style="font-size:14px"></i> ${ch.label}
              </label>`).join('')}
            </div>
          </div>
          <div class="form-group"><label>Recipient(s)</label><input id="notif_to" placeholder="Phone / Email / Tracking #"></div>
          <div class="form-group"><label>Message</label><textarea id="notif_msg" rows="4" placeholder="Type message..."></textarea></div>
          <button class="btn btn-primary" onclick="Pages3.sendNotification()"><i class="fas fa-paper-plane"></i> Send</button>
        </div>
      </div>
    </div>`;
  }

  function markAllRead() {
    DB.Notifications.markAllRead();
    document.getElementById('notifDot')?.remove();
    Utils.toast('All notifications marked as read', 'info');
    renderNotifications();
  }

  function openSendNotification() { renderNotifications(); }

  function sendNotification() {
    const channels = [...document.querySelectorAll('.notif-channel:checked')].map(el => el.value);
    const to = document.getElementById('notif_to')?.value.trim();
    const msg = document.getElementById('notif_msg')?.value.trim();
    if (!msg) { Utils.toast('Enter a message', 'warning'); return; }
    if (channels.length === 0) { Utils.toast('Select at least one channel', 'warning'); return; }
    DB.Notifications.add({ type: 'info', icon: 'fa-paper-plane', title: 'Notification sent', body: `Sent via ${channels.join(', ')} to ${to || 'recipient'}` });
    Utils.toast(`Sent via ${channels.join(', ')}`, 'success');
    document.getElementById('notif_msg').value = '';
    document.getElementById('notif_to').value = '';
    renderNotifications();
  }

  // ============================================================
  // SETTINGS
  // ============================================================
  function renderSettings() {
    const user = Auth.getUser();
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header"><h1><i class="fas fa-cog"></i> ${I18n.t('settings')}</h1></div>
    <div class="tabs">
      <button class="tab-btn active" onclick="App.switchTab(this,'stab_general')">General</button>
      <button class="tab-btn" onclick="App.switchTab(this,'stab_company')">Company</button>
      ${user.role==='admin'?`<button class="tab-btn" onclick="App.switchTab(this,'stab_pricing');setTimeout(()=>Pages3.calcPricePreview(),50)"><i class="fas fa-tags"></i> ${I18n.t('pricingRates')}</button>`:''}
      ${user.role==='admin'?`<button class="tab-btn" onclick="App.switchTab(this,'stab_branches');Pages3.loadBranches()"><i class="fas fa-sitemap"></i> ${I18n.t('agents')}</button>`:''}
      <button class="tab-btn" onclick="App.switchTab(this,'stab_users')">Users</button>
      <button class="tab-btn" onclick="App.switchTab(this,'stab_security')">Security</button>
    </div>
    <div id="stab_general" class="tab-panel active">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-sliders-h"></i> General Settings</span></div>
        <div class="card-body">
          <div class="form-grid2">
            <div class="form-group"><label>${I18n.t('language')}</label>
              <select id="set_lang" onchange="App.setLang(this.value)">
                <option value="en" ${I18n.getLang()==='en'?'selected':''}>English</option>
                <option value="lo" ${I18n.getLang()==='lo'?'selected':''}>ລາວ (Lao)</option>
                <option value="th" ${I18n.getLang()==='th'?'selected':''}>ไทย (Thai)</option>
                <option value="zh" ${I18n.getLang()==='zh'?'selected':''}>中文 (Chinese)</option>
              </select>
            </div>
            <div class="form-group"><label>${I18n.t('currency')}</label>
              <select id="set_currency"><option value="LAK" selected>LAK - Lao Kip</option><option value="THB">THB - Thai Baht</option><option value="USD">USD - US Dollar</option><option value="CNY">CNY - Chinese Yuan</option></select>
            </div>
            <div class="form-group"><label>${I18n.t('timezone')}</label>
              <select><option selected>Asia/Vientiane (UTC+7)</option><option>Asia/Bangkok (UTC+7)</option><option>Asia/Shanghai (UTC+8)</option></select>
            </div>
            <div class="form-group"><label>Date Format</label>
              <select><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
            </div>
          </div>
          <button class="btn btn-primary" onclick="Utils.toast('Settings saved','success')"><i class="fas fa-save"></i> ${I18n.t('saveSettings')}</button>
        </div>
      </div>
    </div>
    <div id="stab_company" class="tab-panel">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-building"></i> Company Information</span></div>
        <div class="card-body">
          <div class="form-grid2">
            <div class="form-group"><label>${I18n.t('companyName')}</label><input id="comp_name" value="ProLogis ERP Co., Ltd."></div>
            <div class="form-group"><label>Phone</label><input value="+856 21 234567"></div>
            <div class="form-group"><label>Email</label><input value="info@prologists.la"></div>
            <div class="form-group"><label>Website</label><input value="https://prologists.la"></div>
            <div class="form-group"><label>Address</label><input value="123 Lan Xang Ave, Vientiane"></div>
            <div class="form-group"><label>Tax ID</label><input value="LAO-2024-001234"></div>
          </div>
          <div class="form-group"><label>${I18n.t('companyLogo')}</label>
            <div style="border:2px dashed var(--border);border-radius:var(--radius-sm);padding:30px;text-align:center;cursor:pointer" onclick="Utils.toast('Logo upload — coming soon','info')">
              <i class="fas fa-cloud-upload-alt" style="font-size:32px;color:var(--text-light);margin-bottom:8px"></i>
              <p style="color:var(--text-muted);font-size:13px">Click to upload logo (PNG, JPG, SVG)</p>
            </div>
          </div>
          <button class="btn btn-primary" onclick="Utils.toast('Company info saved','success')"><i class="fas fa-save"></i> Save</button>
        </div>
      </div>
    </div>
    ${user.role==='admin'?`
    <div id="stab_pricing" class="tab-panel">
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">ລາຄາຈະຖືກໄລ່ອັດຕະໂນມັດຕາມນ້ຳໜັກ ຫຼື ແມັດກ້ອນ (ໃຊ້ຄ່າທີ່ສູງກວ່າ)</p>
      <div class="form-grid2" style="max-width:640px">
        <div class="card" style="border:1px solid var(--border)">
          <div class="card-header"><span class="card-title">🟢 ${I18n.t('regularPrice')}</span></div>
          <div class="card-body">
            <div class="form-group">
              <label>${I18n.t('ratePerKg')}</label>
              <input type="number" id="pr_kg" min="0" step="1000" value="${Pages3.getPricingRates().perKg}" placeholder="10000" oninput="Pages3.calcPricePreview()">
            </div>
            <div class="form-group">
              <label>${I18n.t('ratePerCBM')}</label>
              <input type="number" id="pr_cbm" min="0" step="10000" value="${Pages3.getPricingRates().perCBM}" placeholder="1000000" oninput="Pages3.calcPricePreview()">
            </div>
          </div>
        </div>
        <div class="card" style="border:2px solid var(--warning)">
          <div class="card-header" style="background:linear-gradient(135deg,#fff9e6,#fffbeb)"><span class="card-title">⭐ ${I18n.t('vipPrice')}</span></div>
          <div class="card-body">
            <div class="form-group">
              <label>${I18n.t('vipRatePerKg')}</label>
              <input type="number" id="pr_vip_kg" min="0" step="1000" value="${Pages3.getPricingRates().vipPerKg||8000}" placeholder="8000" oninput="Pages3.calcPricePreview()">
            </div>
            <div class="form-group">
              <label>${I18n.t('vipRatePerCBM')}</label>
              <input type="number" id="pr_vip_cbm" min="0" step="10000" value="${Pages3.getPricingRates().vipPerCBM||800000}" placeholder="800000" oninput="Pages3.calcPricePreview()">
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="border:1px solid var(--primary);margin:16px 0;max-width:640px">
        <div class="card-header" style="background:linear-gradient(135deg,#eef2ff,#e0e7ff)"><span class="card-title"><i class="fas fa-calculator"></i> ທົດລອງຄິດໄລ່ລາຄາ</span></div>
        <div class="card-body">
          <div class="form-grid2" style="gap:10px;margin-bottom:12px">
            <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('weight')} (kg)</label><input type="number" id="calc_kg" min="0" step="0.1" value="5" oninput="Pages3.calcPricePreview()"></div>
            <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('length')} (cm)</label><input type="number" id="calc_l" min="0" value="50" oninput="Pages3.calcPricePreview()"></div>
            <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('width')} (cm)</label><input type="number" id="calc_w" min="0" value="40" oninput="Pages3.calcPricePreview()"></div>
            <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('height')} (cm)</label><input type="number" id="calc_h" min="0" value="25" oninput="Pages3.calcPricePreview()"></div>
          </div>
          <div id="calcResult" style="background:var(--bg-secondary);border-radius:var(--radius-sm);padding:12px;font-size:13px"></div>
        </div>
      </div>
      <button class="btn btn-primary" onclick="Pages3.savePricingRates()"><i class="fas fa-save"></i> ${I18n.t('savePricing')}</button>
    </div>`:''}
    <div id="stab_users" class="tab-panel">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-users"></i> User Management</span></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${DB.Users.getAll().map(u=>`<tr>
                <td><div style="display:flex;align-items:center;gap:10px">
                  <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${u.name.charAt(0)}</div>
                  <strong>${u.name}</strong>
                </div></td>
                <td style="color:var(--text-muted)">${u.email}</td>
                <td><span class="badge role-${u.role}">${u.role}</span></td>
                <td>${Utils.statusBadge(u.active?'active':'inactive')}</td>
                <td><div style="display:flex;gap:4px">
                  <button class="btn btn-sm btn-secondary" onclick="Utils.toast('Edit user — configure role','info')"><i class="fas fa-edit"></i></button>
                  ${u.id !== Auth.getUser()?.id ? `<button class="btn btn-sm btn-danger" onclick="Utils.toast('User deactivated','warning')"><i class="fas fa-ban"></i></button>` : ''}
                </div></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    ${user.role==='admin'?`
    <div id="stab_branches" class="tab-panel">
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
          <span class="card-title"><i class="fas fa-sitemap"></i> ${I18n.t('agentManagement')}</span>
          <button class="btn btn-primary btn-sm" onclick="Pages3.openBranchForm()"><i class="fas fa-plus"></i> ${I18n.t('addAgent')}</button>
        </div>
        <div class="card-body">
          <div id="branchList"></div>
        </div>
      </div>
    </div>`:''}
    <div id="stab_security" class="tab-panel">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-lock"></i> ${I18n.t('changePassword')}</span></div>
        <div class="card-body" style="max-width:400px">
          <div class="form-group"><label>Current Password</label><input type="password" id="cur_pwd"></div>
          <div class="form-group"><label>New Password</label><input type="password" id="new_pwd"></div>
          <div class="form-group"><label>Confirm New Password</label><input type="password" id="confirm_pwd"></div>
          <button class="btn btn-primary" onclick="Pages3.changePassword()"><i class="fas fa-key"></i> Update Password</button>
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="card-header"><span class="card-title"><i class="fas fa-shield-alt"></i> Role Permissions</span></div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Module</th><th>Admin</th><th>Manager</th><th>Agent</th><th>Driver</th><th>Customer</th></tr></thead>
              <tbody>
                ${[['Dashboard','✅','✅','✅','✅','✅'],['Shipments','✅','✅','✅','👁','✅'],['Tracking','✅','✅','✅','✅','✅'],['Warehouse','✅','✅','✅','❌','❌'],['Drivers','✅','✅','❌','❌','❌'],['Finance','✅','✅','❌','❌','❌'],['Analytics','✅','✅','❌','❌','❌'],['Exceptions','✅','✅','✅','✅','❌'],['Settings','✅','❌','❌','❌','❌']].map(([m,...p])=>`
                <tr><td><strong>${m}</strong></td>${p.map(v=>`<td style="text-align:center">${v}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
  }

  function getPricingRates() {
    try { return JSON.parse(localStorage.getItem('erp_pricing')) || { perKg:10000, perCBM:1000000, vipPerKg:8000, vipPerCBM:800000 }; }
    catch(e) { return { perKg:10000, perCBM:1000000, vipPerKg:8000, vipPerCBM:800000 }; }
  }

  function savePricingRates() {
    const perKg     = parseInt(document.getElementById('pr_kg')?.value)      || 0;
    const perCBM    = parseInt(document.getElementById('pr_cbm')?.value)     || 0;
    const vipPerKg  = parseInt(document.getElementById('pr_vip_kg')?.value)  || 0;
    const vipPerCBM = parseInt(document.getElementById('pr_vip_cbm')?.value) || 0;
    localStorage.setItem('erp_pricing', JSON.stringify({ perKg, perCBM, vipPerKg, vipPerCBM }));
    Utils.toast(I18n.t('savePricing') + ' ສຳເລັດ', 'success');
    calcPricePreview();
  }

  function calcPricePreview() {
    const el = document.getElementById('calcResult');
    if (!el) return;
    const kg = parseFloat(document.getElementById('calc_kg')?.value) || 0;
    const l  = parseFloat(document.getElementById('calc_l')?.value)  || 0;
    const w  = parseFloat(document.getElementById('calc_w')?.value)  || 0;
    const h  = parseFloat(document.getElementById('calc_h')?.value)  || 0;
    const cbm = (l && w && h) ? (l*w*h)/1e6 : 0;
    // Read current input values (not saved yet) so preview is live
    const perKg     = parseInt(document.getElementById('pr_kg')?.value)      || 0;
    const perCBM    = parseInt(document.getElementById('pr_cbm')?.value)     || 0;
    const vipPerKg  = parseInt(document.getElementById('pr_vip_kg')?.value)  || 0;
    const vipPerCBM = parseInt(document.getElementById('pr_vip_cbm')?.value) || 0;
    const regByKg  = kg * perKg;
    const regByCBM = cbm * perCBM;
    const regFinal = Math.max(regByKg, regByCBM);
    const vipByKg  = kg * vipPerKg;
    const vipByCBM = cbm * vipPerCBM;
    const vipFinal = Math.max(vipByKg, vipByCBM);
    el.innerHTML = `
      <div style="margin-bottom:6px"><strong>CBM:</strong> ${cbm.toFixed(4)} m³</div>
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <tr style="background:var(--bg-primary)"><th style="text-align:left;padding:6px;border:1px solid var(--border)"></th><th style="padding:6px;border:1px solid var(--border)">ຕາມກິໂລ</th><th style="padding:6px;border:1px solid var(--border)">ຕາມແມັດກ້ອນ</th><th style="padding:6px;border:1px solid var(--border);font-weight:700">ລາຄາສຸດທ້າຍ</th></tr>
        <tr><td style="padding:6px;border:1px solid var(--border)">🟢 ທົ່ວໄປ</td><td style="padding:6px;border:1px solid var(--border);text-align:center">${kg} × ${perKg.toLocaleString()} = <b>${regByKg.toLocaleString()}</b></td><td style="padding:6px;border:1px solid var(--border);text-align:center">${cbm.toFixed(4)} × ${perCBM.toLocaleString()} = <b>${Math.round(regByCBM).toLocaleString()}</b></td><td style="padding:6px;border:1px solid var(--border);text-align:center;font-weight:700;color:var(--primary);font-size:14px">${Math.round(regFinal).toLocaleString()} LAK</td></tr>
        <tr style="background:#fffbeb"><td style="padding:6px;border:1px solid var(--border)">⭐ VIP</td><td style="padding:6px;border:1px solid var(--border);text-align:center">${kg} × ${vipPerKg.toLocaleString()} = <b>${vipByKg.toLocaleString()}</b></td><td style="padding:6px;border:1px solid var(--border);text-align:center">${cbm.toFixed(4)} × ${vipPerCBM.toLocaleString()} = <b>${Math.round(vipByCBM).toLocaleString()}</b></td><td style="padding:6px;border:1px solid var(--border);text-align:center;font-weight:700;color:#b45309;font-size:14px">${Math.round(vipFinal).toLocaleString()} LAK</td></tr>
      </table>
      <div style="margin-top:6px;font-size:11px;color:var(--text-muted)"><i class="fas fa-info-circle"></i> ລະບົບໃຊ້ຄ່າທີ່ສູງກວ່າລະຫວ່າງ ກິໂລ ແລະ ແມັດກ້ອນ</div>
    `;
  }

  function changePassword() {
    const cur = document.getElementById('cur_pwd')?.value;
    const nw = document.getElementById('new_pwd')?.value;
    const conf = document.getElementById('confirm_pwd')?.value;
    const user = Auth.getUser();
    if (!cur || !nw || !conf) { Utils.toast('Fill all fields', 'warning'); return; }
    if (user.password !== cur) { Utils.toast('Current password incorrect', 'error'); return; }
    if (nw !== conf) { Utils.toast('Passwords do not match', 'error'); return; }
    if (nw.length < 6) { Utils.toast('Password too short (min 6)', 'warning'); return; }
    const users = DB.Users.getAll();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx > -1) { users[idx].password = nw; localStorage.setItem('erp_users', JSON.stringify(users)); }
    Utils.toast('Password updated successfully', 'success');
  }

  // === BRANCH MANAGEMENT ===
  function loadBranches() {
    const el = document.getElementById('branchList');
    if (!el) return;
    const agents = DB.Agents.getAll();
    if (!agents.length) {
      el.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:24px">${I18n.t('noData')}</p>`;
      return;
    }
    el.innerHTML = `<div class="table-wrap"><table class="data-table">
      <thead><tr>
        <th>${I18n.t('branchName')}</th><th>${I18n.t('agentCode')}</th>
        <th>${I18n.t('phone')}</th><th>${I18n.t('email')}</th>
        <th>${I18n.t('city')}</th><th>${I18n.t('status')}</th><th></th>
      </tr></thead>
      <tbody>${agents.map(a => `<tr>
        <td><strong>${a.name}</strong><br><small style="color:var(--text-muted)">${a.address||''}</small></td>
        <td><code>${a.code||''}</code></td>
        <td>${a.phone||''}</td>
        <td>${a.email||''}</td>
        <td>${a.city||''}${a.country?' ('+a.country+')':''}</td>
        <td>${Utils.statusBadge(a.active?'active':'inactive')}</td>
        <td style="white-space:nowrap">
          <button class="btn btn-secondary btn-sm" onclick="Pages3.openBranchForm(${a.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b" onclick="Pages3.deleteBranch(${a.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  }

  function openBranchForm(id) {
    const a = id ? DB.Agents.getById(id) : null;
    const title = a ? `${I18n.t('edit')} — ${a.name}` : I18n.t('addAgent');
    App.openModal(title, `
      <div class="form-grid2" style="gap:12px">
        <div class="form-group"><label>${I18n.t('branchName')} *</label><input id="br_name" value="${a?.name||''}" placeholder="ຊື່ສາຂາ..."></div>
        <div class="form-group"><label>${I18n.t('agentCode')}</label><input id="br_code" value="${a?.code||''}" placeholder="VTE-001"></div>
        <div class="form-group"><label>${I18n.t('phone')}</label><input id="br_phone" value="${a?.phone||''}" placeholder="+856 21 ..."></div>
        <div class="form-group"><label>${I18n.t('email')}</label><input id="br_email" value="${a?.email||''}" placeholder="email@prologists.la"></div>
        <div class="form-group"><label>${I18n.t('address')}</label><input id="br_address" value="${a?.address||''}" placeholder="ທີ່ຢູ່..."></div>
        <div class="form-group"><label>${I18n.t('city')}</label><input id="br_city" value="${a?.city||''}" placeholder="ເມືອງ"></div>
        <div class="form-group"><label>${I18n.t('country')}</label>
          <select id="br_country" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
            <option value="LA" ${(a?.country||'LA')==='LA'?'selected':''}>ລາວ (LA)</option>
            <option value="TH" ${a?.country==='TH'?'selected':''}>ໄທ (TH)</option>
            <option value="CN" ${a?.country==='CN'?'selected':''}>ຈີນ (CN)</option>
            <option value="VN" ${a?.country==='VN'?'selected':''}>ຫວຽດນາມ (VN)</option>
            <option value="MM" ${a?.country==='MM'?'selected':''}>ມຽນມາ (MM)</option>
          </select>
        </div>
        <div class="form-group"><label>${I18n.t('commission')}</label><input id="br_commission" type="number" min="0" max="100" step="0.5" value="${a?.commission||7}" placeholder="7"></div>
        <div class="form-group" style="grid-column:span 2">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" id="br_active" ${(a?.active!==false)?'checked':''} style="width:16px;height:16px">
            ${I18n.t('status')}: Active
          </label>
        </div>
      </div>
    `, [
      { label: I18n.t('cancel'), cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-save"></i> ' + I18n.t('save'), cls: 'btn-primary', action: `Pages3.saveBranch(${id||0})` }
    ], 'modal-lg');
  }

  function saveBranch(id) {
    const name = document.getElementById('br_name')?.value.trim();
    if (!name) { Utils.toast('ກະລຸນາໃສ່ຊື່ສາຂາ', 'warning'); return; }
    const data = {
      name,
      code: document.getElementById('br_code')?.value.trim() || '',
      phone: document.getElementById('br_phone')?.value.trim() || '',
      email: document.getElementById('br_email')?.value.trim() || '',
      address: document.getElementById('br_address')?.value.trim() || '',
      city: document.getElementById('br_city')?.value.trim() || '',
      country: document.getElementById('br_country')?.value || 'LA',
      commission: parseFloat(document.getElementById('br_commission')?.value) || 7,
      active: document.getElementById('br_active')?.checked !== false
    };
    if (id) {
      DB.Agents.update(id, data);
      Utils.toast(`${name} ອັບເດດສຳເລັດ`, 'success');
    } else {
      DB.Agents.create(data);
      Utils.toast(`${name} ເພີ່ມສຳເລັດ`, 'success');
    }
    App.closeModal();
    loadBranches();
  }

  function deleteBranch(id) {
    const a = DB.Agents.getById(id);
    if (!a) return;
    App.openModal('ຢືນຢັນການລຶບ', `
      <p style="text-align:center;padding:16px">
        <i class="fas fa-exclamation-triangle" style="font-size:32px;color:var(--danger);display:block;margin-bottom:12px"></i>
        ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບສາຂາ <strong>${a.name}</strong>?<br>
        <small style="color:var(--text-muted)">ການລຶບບໍ່ສາມາດກູ້ຄືນໄດ້</small>
      </p>
    `, [
      { label: I18n.t('cancel'), cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-trash"></i> ລຶບ', cls: 'btn-danger', action: `(()=>{DB.Agents.delete(${id});App.closeModal();Pages3.loadBranches();Utils.toast('ລຶບສຳເລັດ','success')})()` }
    ]);
  }

  return { renderAnalytics, reloadAnalytics, renderExceptions, openExceptionForm, saveException, resolveException, editException, updateException, renderPayments, updateQRPreview, generatePaymentQR, downloadQR, markCODCollected, renderLabels, previewLabel, printSingleLabel, selectAllLabels, batchPrintSelected, renderGPS, initMap, focusDriver, refreshGPS, renderNotifications, markAllRead, openSendNotification, sendNotification, renderSettings, changePassword, getPricingRates, savePricingRates, calcPricePreview, loadBranches, openBranchForm, saveBranch, deleteBranch };
})();
