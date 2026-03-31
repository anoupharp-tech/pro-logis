// ============================================================
// Pages2 — Warehouse, Drivers, Customers, Agents, Finance
// ============================================================
const Pages2 = (() => {

  // ============================================================
  // WAREHOUSE
  // ============================================================
  function renderWarehouse() {
    const stats = { inbound: 0, outbound: 0, inStock: DB.Shipments.countByStatus('in-warehouse'), sorted: 0 };
    const locations = ['A-01','A-02','A-03','A-04','B-01','B-02','B-03','C-01','C-02','C-03','D-01','D-02'];
    const occupancy = [0.9, 0.6, 0.3, 1.0, 0.7, 0.4, 0.2, 0.8, 0.5, 0.1, 0.6, 0.3];

    document.getElementById('pageContent').innerHTML = `
    <div class="page-header"><h1><i class="fas fa-warehouse"></i> ${I18n.t('warehouse')}</h1></div>
    <div class="stats-grid">
      <div class="stat-card" style="cursor:pointer" onclick="Pages.navigate('shipments');setTimeout(()=>{document.getElementById('shipStatus').value='in-warehouse';Pages.filterShipments('in-warehouse')},200)" title="ເບິ່ງສິນຄ້າໃນສາງ"><div class="stat-icon green"><i class="fas fa-sign-in-alt"></i></div><div class="stat-info"><div class="stat-label">${I18n.t('inStock')}</div><div class="stat-value">${Utils.fmtNum(stats.inStock)}</div></div></div>
      <div class="stat-card" style="cursor:pointer" onclick="document.getElementById('whMap')?.scrollIntoView({behavior:'smooth'})" title="ເບິ່ງແຜນທີ່ສາງ"><div class="stat-icon blue"><i class="fas fa-boxes"></i></div><div class="stat-info"><div class="stat-label">${I18n.t('totalLocations')}</div><div class="stat-value">${locations.length}</div></div></div>
      <div class="stat-card" style="cursor:pointer" onclick="document.getElementById('whMap')?.scrollIntoView({behavior:'smooth'})" title="ເບິ່ງຊ່ອງເຕັມ"><div class="stat-icon orange"><i class="fas fa-exclamation"></i></div><div class="stat-info"><div class="stat-label">${I18n.t('fullLocations')}</div><div class="stat-value">${occupancy.filter(o=>o>=1).length}</div></div></div>
      <div class="stat-card" style="cursor:pointer" onclick="document.getElementById('whMap')?.scrollIntoView({behavior:'smooth'})" title="ເບິ່ງຊ່ອງວ່າງ"><div class="stat-icon cyan"><i class="fas fa-check-double"></i></div><div class="stat-info"><div class="stat-label">${I18n.t('available')}</div><div class="stat-value">${occupancy.filter(o=>o<1).length}</div></div></div>
    </div>
    <div class="grid2">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-sign-in-alt"></i> ${I18n.t('inboundScan')}</span></div>
        <div class="card-body">
          <div class="scan-area">
            <h3><i class="fas fa-barcode"></i> ${I18n.t('scanToReceive')}</h3>
            <p>${I18n.t('scanReceiveDesc')}</p>
            <div class="scan-input-wrap">
              <input type="text" id="inboundScan" placeholder="${I18n.t('enterScan')}" style="text-transform:uppercase" onkeydown="if(event.key==='Enter') Pages2.processInbound()">
              <button onclick="Utils.openBarcodeScanner(v=>{document.getElementById('inboundScan').value=v.toUpperCase();Pages2.processInbound()})" title="Scan barcode" style="background:var(--secondary)"><i class="fas fa-camera"></i></button>
              <button onclick="Pages2.processInbound()"><i class="fas fa-check"></i></button>
            </div>
            <div style="text-align:center;margin-top:8px">
              <button class="btn btn-sm btn-secondary" onclick="Pages2.openManualInbound()"><i class="fas fa-keyboard"></i> ${I18n.t('manualEntry')}</button>
            </div>
          </div>
          <div style="margin-top:14px;padding:14px;background:var(--bg-secondary);border-radius:var(--radius);border:1px solid var(--border)">
            <p style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px"><i class="fas fa-cog"></i> ${I18n.t('inboundSettings')}</p>
            <div class="form-row2" style="gap:10px">
              <div class="form-field" style="margin:0">
                <label style="font-size:12px"><i class="fas fa-map-marker-alt"></i> ${I18n.t('zoneLocation')}</label>
                <select id="inboundZone" style="font-size:13px;padding:7px 10px;border:1px solid var(--border);border-radius:6px;width:100%;background:white">
                  <option value="Main Warehouse">Main Warehouse</option>
                  ${locations.map(l=>`<option value="${l}">${l}</option>`).join('')}
                </select>
              </div>
              <div class="form-field" style="margin:0">
                <label style="font-size:12px"><i class="fas fa-user"></i> ${I18n.t('staffReceiver')}</label>
                <select id="inboundStaff" style="font-size:13px;padding:7px 10px;border:1px solid var(--border);border-radius:6px;width:100%;background:white">
                  <option value="Staff A">Staff A</option>
                  <option value="Staff B">Staff B</option>
                  <option value="Staff C">Staff C</option>
                  <option value="Staff D">Staff D</option>
                </select>
              </div>
            </div>
            <div class="form-field" style="margin:8px 0 0">
              <label style="font-size:12px"><i class="fas fa-sticky-note"></i> ${I18n.t('notes')} (optional)</label>
              <input type="text" id="inboundNote" placeholder="${I18n.t('remark') || ''}" style="font-size:13px;padding:7px 10px;border:1px solid var(--border);border-radius:6px;width:100%;box-sizing:border-box">
            </div>
            <div class="form-field" style="margin:8px 0 0">
              <label style="font-size:12px"><i class="fas fa-globe"></i> ${I18n.t('foreignCarrier')} <span style="color:var(--warning);font-size:10px">★ ສໍາລັບພັດສະດຸຕ່າງປະເທດ</span></label>
              <input type="text" id="inboundForeignCarrier" placeholder="DHL / FedEx / EMS China / JD Logistics..." style="font-size:13px;padding:7px 10px;border:1px solid var(--warning);border-radius:6px;width:100%;box-sizing:border-box;background:#fffbeb">
            </div>
          </div>
          <div id="inboundResult" style="margin-top:16px"></div>
          <div style="margin-top:16px">
            <h4 style="font-size:13px;margin-bottom:10px">${I18n.t('recentInbound')}</h4>
            ${DB.Shipments.search('','in-warehouse').slice(0,5).map(s=>`
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
                <code style="color:var(--primary)">${s.trackingNumber}</code>
                <span>${s.receiverCity}</span>
                <span>${Utils.statusBadge('in-warehouse')}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-sign-out-alt"></i> ${I18n.t('outboundScan')}</span></div>
        <div class="card-body">
          <div class="scan-area" style="background:linear-gradient(135deg,var(--success),#059669)">
            <h3><i class="fas fa-barcode"></i> ${I18n.t('scanToDispatch')}</h3>
            <p>${I18n.t('scanDispatchDesc')}</p>
            <div class="scan-input-wrap">
              <input type="text" id="outboundScan" placeholder="${I18n.t('enterScan')}" style="text-transform:uppercase" onkeydown="if(event.key==='Enter') Pages2.processOutbound()">
              <button onclick="Utils.openBarcodeScanner(v=>{document.getElementById('outboundScan').value=v.toUpperCase();Pages2.processOutbound()})" title="Scan barcode" style="background:var(--secondary)"><i class="fas fa-camera"></i></button>
              <button onclick="Pages2.processOutbound()"><i class="fas fa-truck"></i></button>
            </div>
            <div style="text-align:center;margin-top:8px">
              <button class="btn btn-sm btn-secondary" onclick="Pages2.openManualOutbound()"><i class="fas fa-keyboard"></i> ${I18n.t('manualEntry')}</button>
            </div>
          </div>
          <div id="outboundResult" style="margin-top:16px"></div>
          <div style="margin-top:16px">
            <h4 style="font-size:13px;margin-bottom:10px">${I18n.t('readyDispatch')}</h4>
            ${DB.Shipments.search('','in-warehouse').slice(0,5).map(s=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
                <code style="color:var(--primary)">${s.trackingNumber}</code>
                <span>${s.receiverCity}</span>
                <button class="btn btn-sm btn-success" onclick="Pages2.quickDispatch('${s.trackingNumber}')">${I18n.t('dispatch')}</button>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="card" id="whMap" style="margin-top:20px">
      <div class="card-header"><span class="card-title"><i class="fas fa-th"></i> ${I18n.t('warehouseMap')}</span></div>
      <div class="card-body">
        <div class="wh-grid">
          ${locations.map((loc, i) => {
            const occ = occupancy[i];
            const cls = occ >= 1 ? 'full' : occ > 0.5 ? 'occupied' : '';
            const pct = Math.round(occ * 100);
            return `<div class="wh-cell ${cls}" onclick="Pages2.viewLocation('${loc}')">
              <i class="fas fa-archive"></i>
              <p>${loc}</p>
              <small>${pct}% full</small>
              <div class="progress-bar" style="margin-top:6px"><div class="progress-fill" style="width:${pct}%;background:${occ>=1?'var(--danger)':occ>0.5?'var(--warning)':'var(--success)'}"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  }

  function processInbound() {
    const tn = document.getElementById('inboundScan')?.value.trim().toUpperCase();
    if (!tn) { Utils.toast('ກະລຸນາໃສ່ ຫຼື ສະແກນເລກພັດສະດຸ', 'warning'); return; }
    const zone    = document.getElementById('inboundZone')?.value           || 'Main Warehouse';
    const staff   = document.getElementById('inboundStaff')?.value          || 'Staff A';
    const note    = document.getElementById('inboundNote')?.value.trim()    || '';
    const carrier = document.getElementById('inboundForeignCarrier')?.value.trim() || '';
    const result  = document.getElementById('inboundResult');

    let s = DB.Shipments.getByTracking(tn);

    // Not found — if foreign carrier provided, auto-create entry
    if (!s) {
      if (carrier) {
        s = DB.Shipments.create({
          trackingNumber: tn,
          senderName: carrier, senderPhone: '', senderAddress: '', senderCity: 'International',
          receiverName: 'TBD', receiverPhone: '', receiverAddress: '', receiverCity: '',
          weight: 0, length: 0, width: 0, height: 0,
          declaredValue: 0, price: 0, cod: 0,
          service: 'Standard', paymentMethod: 'prepaid', status: 'pending',
          notes: `[Foreign Parcel] Carrier: ${carrier}${note ? ' | ' + note : ''}`
        });
      } else {
        result.innerHTML = `<div style="background:#fee2e2;padding:12px;border-radius:8px;color:var(--danger)">
          <i class="fas fa-times-circle"></i> ບໍ່ພົບ: <strong>${tn}</strong>
          <div style="font-size:12px;margin-top:6px;opacity:.85">ຖ້າເປັນພັດສະດຸຕ່າງປະເທດ, ໃສ່ຊື່ <strong>${I18n.t('foreignCarrier')}</strong> ໃນຊ່ອງຂ້າງລຸ່ມ ແລ້ວກົດ scan/ຮັບເຂົ້າ ອີກຄັ້ງ</div>
        </div>`;
        return;
      }
    }

    const remark = `ຮັບເຂົ້າສາງ — Zone: ${zone} | ພະນັກງານ: ${staff}${carrier ? ' | Carrier: ' + carrier : ''}${note ? ' | ' + note : ''}`;
    DB.Shipments.updateStatus(s.id, 'in-warehouse', zone, remark);
    const isNew = carrier && !DB.Shipments.getByTracking(tn + '_OLD');
    result.innerHTML = `<div style="background:#dcfce7;padding:14px;border-radius:8px;color:#065f46">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <i class="fas fa-check-circle" style="font-size:18px"></i>
        <strong>${tn}</strong> ຮັບເຂົ້າສາງສຳເລັດ${carrier ? ' <span style="background:#d1fae5;padding:2px 8px;border-radius:12px;font-size:11px">🌐 '+carrier+'</span>' : ''}
      </div>
      <div style="font-size:12px;opacity:.85"><i class="fas fa-map-marker-alt"></i> ${zone} &nbsp;|&nbsp; <i class="fas fa-user"></i> ${staff}${note ? ' &nbsp;|&nbsp; <i class="fas fa-sticky-note"></i> ' + note : ''}</div>
    </div>`;
    document.getElementById('inboundScan').value = '';
    if (document.getElementById('inboundNote')) document.getElementById('inboundNote').value = '';
    Utils.toast(`${tn} ຮັບເຂົ້າ ${zone}`, 'success');
  }

  function processOutbound() {
    const tn = document.getElementById('outboundScan')?.value.trim().toUpperCase();
    if (!tn) return;
    const s = DB.Shipments.getByTracking(tn);
    const result = document.getElementById('outboundResult');
    if (!s) { result.innerHTML = `<div style="background:#fee2e2;padding:12px;border-radius:8px;color:var(--danger)"><i class="fas fa-times-circle"></i> Not found: ${tn}</div>`; return; }
    DB.Shipments.updateStatus(s.id, 'out-for-delivery', 'Dispatch Hub', 'Dispatched for delivery');
    result.innerHTML = `<div style="background:#dcfce7;padding:12px;border-radius:8px;color:var(--success)"><i class="fas fa-truck"></i> <strong>${tn}</strong> dispatched for delivery!</div>`;
    document.getElementById('outboundScan').value = '';
    Utils.toast(`${tn} dispatched`, 'success');
  }

  function quickDispatch(tn) {
    const s = DB.Shipments.getByTracking(tn);
    if (!s) return;
    DB.Shipments.updateStatus(s.id, 'out-for-delivery', 'Dispatch Hub', 'Dispatched for delivery');
    Utils.toast(`${tn} dispatched`, 'success');
    renderWarehouse();
  }

  function viewLocation(loc) {
    App.openModal(`Location: ${loc}`, `<p style="color:var(--text-muted);margin-bottom:16px">Parcels in rack ${loc}:</p>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Tracking #</th><th>Receiver</th><th>Destination</th><th>Weight</th></tr></thead>
          <tbody>
            ${DB.Shipments.search('','in-warehouse').slice(0,4).map(s=>`<tr>
              <td><code style="color:var(--primary)">${s.trackingNumber}</code></td>
              <td>${s.receiverName}</td><td>${s.receiverCity}</td><td>${s.weight} kg</td>
            </tr>`).join('') || '<tr><td colspan="4"><div class="empty-state" style="padding:20px">Empty</div></td></tr>'}
          </tbody>
        </table>
      </div>`, [{ label: 'Close', cls: 'btn-secondary', action: 'App.closeModal()' }]);
  }

  // ============================================================
  // DRIVERS
  // ============================================================
  function renderDrivers() {
    const drivers = DB.Drivers.getAll();
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-truck"></i> ${I18n.t('driverManagement')}</h1><p>${drivers.length} drivers registered</p></div>
      <button class="btn btn-primary" onclick="Pages2.openDriverForm({},false)"><i class="fas fa-plus"></i> ${I18n.t('addDriver')}</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-circle"></i></div><div class="stat-info"><div class="stat-label">Online</div><div class="stat-value">${drivers.filter(d=>d.status==='online').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon red"><i class="fas fa-circle"></i></div><div class="stat-info"><div class="stat-label">Offline</div><div class="stat-value">${drivers.filter(d=>d.status==='offline').length}</div></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-box"></i></div><div class="stat-info"><div class="stat-label">Assigned Parcels</div><div class="stat-value">${Utils.fmtNum(drivers.reduce((s,d)=>s+d.assignedParcels,0))}</div></div></div>
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-check-circle"></i></div><div class="stat-info"><div class="stat-label">Total Deliveries</div><div class="stat-value">${Utils.fmtNum(drivers.reduce((s,d)=>s+d.completedDeliveries,0))}</div></div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${drivers.map(d => `
      <div class="card">
        <div class="card-body">
          <div class="driver-card" style="padding:0;background:none;border:none;cursor:default">
            <div class="driver-avatar">${d.name.charAt(0)}</div>
            <div class="driver-info" style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <h3>${d.name}</h3>
                ${Utils.statusBadge(d.status)}
              </div>
              <small style="color:var(--text-muted)">${d.vehicleType} · ${d.vehiclePlate}</small><br>
              <small style="color:var(--text-muted)">${d.phone}</small>
            </div>
          </div>
          <div class="driver-stats" style="margin-top:14px">
            <div class="driver-stat"><strong>${d.assignedParcels}</strong><span>Assigned</span></div>
            <div class="driver-stat"><strong>${d.completedDeliveries}</strong><span>Completed</span></div>
            <div class="driver-stat"><strong>${Utils.fmt(d.earnings,'LAK').replace('LAK','').trim()}</strong><span>Earnings</span></div>
          </div>
          <div style="display:flex;gap:8px;margin-top:14px">
            <button class="btn btn-sm btn-primary" onclick="Pages2.viewDriverParcels(${d.id})"><i class="fas fa-boxes"></i> Parcels</button>
            <button class="btn btn-sm btn-secondary" onclick="Pages2.openDriverForm(DB.Drivers.getById(${d.id}),true)"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm ${d.status==='online'?'btn-danger':'btn-success'}" onclick="Pages2.toggleDriverStatus(${d.id})">
              ${d.status==='online'?'<i class="fas fa-power-off"></i> Go Offline':'<i class="fas fa-circle"></i> Go Online'}
            </button>
          </div>
        </div>
      </div>`).join('')}
    </div>`;
  }

  function toggleDriverStatus(id) {
    const d = DB.Drivers.getById(id);
    if (!d) return;
    const newStatus = d.status === 'online' ? 'offline' : 'online';
    DB.Drivers.update(id, { status: newStatus });
    Utils.toast(`Driver ${d.name} is now ${newStatus}`, 'info');
    renderDrivers();
  }

  function viewDriverParcels(id) {
    const d = DB.Drivers.getById(id);
    if (!d) return;
    const parcels = DB.Shipments.getByDriver(id);
    App.openModal(`${d.name} — Assigned Parcels`, `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Tracking #</th><th>Receiver</th><th>Destination</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${parcels.length === 0 ? '<tr><td colspan="5"><div class="empty-state" style="padding:20px">No parcels assigned</div></td></tr>' :
              parcels.map(p=>`<tr>
                <td><code style="color:var(--primary)">${p.trackingNumber}</code></td>
                <td>${p.receiverName}</td><td>${p.receiverCity}</td>
                <td>${Utils.statusBadge(p.status)}</td>
                <td><button class="btn btn-sm btn-success" onclick="DB.Shipments.updateStatus(${p.id},'delivered','Destination','Delivered by driver');Utils.toast('Delivered!','success');App.closeModal()">
                  <i class="fas fa-check"></i> Deliver
                </button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`, [{ label: 'Close', cls: 'btn-secondary', action: 'App.closeModal()' }]);
  }

  function openDriverForm(d, isEdit) {
    d = d || {};
    App.openModal(isEdit ? 'Edit Driver' : I18n.t('addDriver'), `
      <div class="form-grid2">
        <div class="form-group"><label>Full Name</label><input id="df_name" value="${d.name||''}" required></div>
        <div class="form-group"><label>Phone</label><input id="df_phone" value="${d.phone||''}"></div>
        <div class="form-group"><label>Email</label><input id="df_email" type="email" value="${d.email||''}"></div>
        <div class="form-group"><label>License Number</label><input id="df_license" value="${d.licenseNumber||''}"></div>
        <div class="form-group"><label>Vehicle Type</label>
          <select id="df_vtype"><option ${d.vehicleType==='Motorbike'?'selected':''}>Motorbike</option><option ${d.vehicleType==='Van'?'selected':''}>Van</option><option ${d.vehicleType==='Truck'?'selected':''}>Truck</option><option ${d.vehicleType==='Car'?'selected':''}>Car</option></select>
        </div>
        <div class="form-group"><label>Vehicle Plate</label><input id="df_plate" value="${d.vehiclePlate||''}"></div>
      </div>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: `<i class="fas fa-save"></i> Save`, cls: 'btn-primary', action: `Pages2.saveDriver(${d.id||0})` }
    ]);
  }

  function saveDriver(id) {
    const data = {
      name: document.getElementById('df_name')?.value.trim(),
      phone: document.getElementById('df_phone')?.value.trim(),
      email: document.getElementById('df_email')?.value.trim(),
      licenseNumber: document.getElementById('df_license')?.value.trim(),
      vehicleType: document.getElementById('df_vtype')?.value,
      vehiclePlate: document.getElementById('df_plate')?.value.trim(),
    };
    if (!data.name) { Utils.toast('Name is required', 'warning'); return; }
    if (id) DB.Drivers.update(id, data); else DB.Drivers.create(data);
    App.closeModal();
    Utils.toast(`Driver ${id ? 'updated' : 'created'}`, 'success');
    renderDrivers();
  }

  // ============================================================
  // CUSTOMERS
  // ============================================================
  function renderCustomers(q = '') {
    const all = DB.Customers.search(q);
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-users"></i> ${I18n.t('customers')}</h1><p>${Utils.fmtNum(all.length)} customers</p></div>
      <button class="btn btn-primary" onclick="Pages2.openCustomerForm({},false)"><i class="fas fa-user-plus"></i> ${I18n.t('addCustomer2')}</button>
    </div>
    <div class="page-toolbar">
      <div class="search-box"><i class="fas fa-search"></i><input type="text" id="custSearch" value="${q}" placeholder="Search customers..." oninput="Pages2.renderCustomers(this.value)"></div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>City</th><th>Shipments</th><th>Balance</th><th>Member Since</th><th>Actions</th></tr></thead>
          <tbody>
            ${all.length===0 ? '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-users"></i><p>No customers found</p></div></td></tr>' :
              all.map(c=>`<tr>
                <td style="color:var(--text-muted);font-size:12px">#${c.id}</td>
                <td><div style="display:flex;align-items:center;gap:10px">
                  <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${c.name.charAt(0)}</div>
                  <div><div style="font-weight:600">${c.name}</div><small style="color:var(--text-muted)">${c.email}</small></div>
                </div></td>
                <td>${c.phone}</td>
                <td>${c.city}, ${c.country}</td>
                <td><strong>${c.totalShipments}</strong></td>
                <td style="color:var(--primary);font-weight:600">${Utils.fmt(c.balance)}</td>
                <td style="font-size:12px;color:var(--text-muted)">${Utils.fmtDate(c.createdAt)}</td>
                <td><div style="display:flex;gap:4px">
                  <button class="btn btn-sm btn-secondary" onclick="Pages2.viewCustomerHistory(${c.id})"><i class="fas fa-history"></i></button>
                  <button class="btn btn-sm btn-secondary" onclick="Pages2.openCustomerForm(DB.Customers.getById(${c.id}),true)"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-sm btn-danger" onclick="Pages2.deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
                </div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function viewCustomerHistory(id) {
    const c = DB.Customers.getById(id);
    if (!c) return;
    const shipments = DB.Shipments.getByCustomer(id);
    App.openModal(`${c.name} — Shipment History`, `
      <div style="margin-bottom:16px;display:flex;gap:16px">
        <div class="stat-card" style="flex:1;padding:12px"><div class="stat-icon blue" style="width:36px;height:36px;font-size:16px"><i class="fas fa-boxes"></i></div><div class="stat-info"><div class="stat-label">Total</div><div class="stat-value" style="font-size:20px">${shipments.length}</div></div></div>
        <div class="stat-card" style="flex:1;padding:12px"><div class="stat-icon green" style="width:36px;height:36px;font-size:16px"><i class="fas fa-check"></i></div><div class="stat-info"><div class="stat-label">Delivered</div><div class="stat-value" style="font-size:20px">${shipments.filter(s=>s.status==='delivered').length}</div></div></div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Tracking</th><th>Receiver</th><th>Status</th><th>Price</th><th>Date</th></tr></thead>
          <tbody>
            ${shipments.slice(0,10).map(s=>`<tr>
              <td><code style="color:var(--primary);font-size:11px">${s.trackingNumber}</code></td>
              <td>${s.receiverName}</td><td>${Utils.statusBadge(s.status)}</td>
              <td>${Utils.fmt(s.price)}</td><td style="font-size:12px;color:var(--text-muted)">${Utils.fmtDate(s.createdAt)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`, [{ label: 'Close', cls: 'btn-secondary', action: 'App.closeModal()' }], 'modal-lg');
  }

  function openCustomerForm(c, isEdit) {
    c = c || {};
    App.openModal(isEdit ? 'Edit Customer' : I18n.t('addCustomer2'), `
      <div class="form-grid2">
        <div class="form-group"><label>Full Name</label><input id="cf_name" value="${c.name||''}" required></div>
        <div class="form-group"><label>Phone</label><input id="cf_phone" value="${c.phone||''}"></div>
        <div class="form-group"><label>Email</label><input id="cf_email" type="email" value="${c.email||''}"></div>
        <div class="form-group"><label>City</label><input id="cf_city" value="${c.city||''}"></div>
        <div class="form-group"><label>Address</label><input id="cf_address" value="${c.address||''}"></div>
        <div class="form-group"><label>Country</label>
          <select id="cf_country"><option value="LA" ${c.country==='LA'?'selected':''}>Laos</option><option value="TH" ${c.country==='TH'?'selected':''}>Thailand</option><option value="CN" ${c.country==='CN'?'selected':''}>China</option><option value="OTHER">Other</option></select>
        </div>
      </div>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-save"></i> Save', cls: 'btn-primary', action: `Pages2.saveCustomer(${c.id||0})` }
    ]);
  }

  function saveCustomer(id) {
    const data = {
      name: document.getElementById('cf_name')?.value.trim(),
      phone: document.getElementById('cf_phone')?.value.trim(),
      email: document.getElementById('cf_email')?.value.trim(),
      city: document.getElementById('cf_city')?.value.trim(),
      address: document.getElementById('cf_address')?.value.trim(),
      country: document.getElementById('cf_country')?.value,
    };
    if (!data.name) { Utils.toast('Name required', 'warning'); return; }
    if (id) DB.Customers.update(id, data); else DB.Customers.create(data);
    App.closeModal();
    Utils.toast('Customer saved', 'success');
    renderCustomers();
  }

  function deleteCustomer(id) {
    App.openModal('Delete Customer', '<p>Remove this customer?</p>', [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: 'Delete', cls: 'btn-danger', action: `DB.Customers.delete(${id});App.closeModal();Pages2.renderCustomers();Utils.toast('Deleted','success')` }
    ], 'modal-sm');
  }

  // ============================================================
  // AGENTS
  // ============================================================
  function renderAgents() {
    const agents = DB.Agents.getAll();
    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-store"></i> ${I18n.t('agentManagement')}</h1></div>
      <button class="btn btn-primary" onclick="Pages2.openAgentForm({},false)"><i class="fas fa-plus"></i> ${I18n.t('addAgent')}</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-store"></i></div><div class="stat-info"><div class="stat-label">Total Agents</div><div class="stat-value">${agents.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div><div class="stat-info"><div class="stat-label">Active</div><div class="stat-value">${agents.filter(a=>a.active).length}</div></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-boxes"></i></div><div class="stat-info"><div class="stat-label">Total Shipments</div><div class="stat-value">${Utils.fmtNum(agents.reduce((s,a)=>s+a.totalShipments,0))}</div></div></div>
      <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-wallet"></i></div><div class="stat-info"><div class="stat-label">Total Balance</div><div class="stat-value" style="font-size:18px">${Utils.fmt(agents.reduce((s,a)=>s+a.balance,0))}</div></div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
      ${agents.map(a=>`
      <div class="agent-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <h3>${a.name}</h3>
            <div class="agent-code">${a.code}</div>
            <small style="color:var(--text-muted)">${a.city}, ${a.country}</small>
          </div>
          ${Utils.statusBadge(a.active ? 'active' : 'inactive')}
        </div>
        <div class="agent-metrics">
          <div class="agent-metric"><strong>${a.totalShipments}</strong><span>Shipments</span></div>
          <div class="agent-metric"><strong>${a.commission}%</strong><span>Commission</span></div>
          <div class="agent-metric"><strong>${Utils.fmtNum(a.balance)}</strong><span>Balance (LAK)</span></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn btn-sm btn-secondary" style="flex:1" onclick="Pages2.viewAgentReport(${a.id})"><i class="fas fa-chart-bar"></i> Report</button>
          <button class="btn btn-sm btn-secondary" onclick="Pages2.openAgentForm(DB.Agents.getById(${a.id}),true)"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-primary" onclick="Pages2.settleAgent(${a.id})"><i class="fas fa-money-bill"></i> Settle</button>
        </div>
      </div>`).join('')}
    </div>`;
  }

  function viewAgentReport(id) {
    const a = DB.Agents.getById(id);
    if (!a) return;
    const shipments = DB.Shipments.getByAgent(id);
    const revenue = shipments.reduce((s,sh)=>s+sh.price, 0);
    App.openModal(`${a.name} — Report`, `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
        <div class="finance-card"><div class="fc-icon" style="background:#dbeafe;color:var(--primary)"><i class="fas fa-boxes"></i></div><div class="fc-value">${shipments.length}</div><div class="fc-label">Shipments</div></div>
        <div class="finance-card"><div class="fc-icon" style="background:#dcfce7;color:var(--success)"><i class="fas fa-chart-line"></i></div><div class="fc-value" style="font-size:16px">${Utils.fmtNum(revenue)}</div><div class="fc-label">Revenue (LAK)</div></div>
        <div class="finance-card"><div class="fc-icon" style="background:#fef3c7;color:var(--warning)"><i class="fas fa-percent"></i></div><div class="fc-value">${a.commission}%</div><div class="fc-label">Commission</div></div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Tracking</th><th>Status</th><th>Price</th><th>Date</th></tr></thead>
          <tbody>${shipments.slice(0,8).map(s=>`<tr><td><code style="color:var(--primary);font-size:11px">${s.trackingNumber}</code></td><td>${Utils.statusBadge(s.status)}</td><td>${Utils.fmt(s.price)}</td><td style="font-size:12px;color:var(--text-muted)">${Utils.fmtDate(s.createdAt)}</td></tr>`).join('')}</tbody>
        </table>
      </div>`, [{ label: 'Close', cls: 'btn-secondary', action: 'App.closeModal()' }], 'modal-lg');
  }

  function settleAgent(id) {
    const a = DB.Agents.getById(id);
    if (!a) return;
    App.openModal('Agent Settlement', `
      <div style="text-align:center;padding:20px">
        <i class="fas fa-money-bill-wave" style="font-size:48px;color:var(--success);margin-bottom:16px"></i>
        <h3 style="margin-bottom:8px">${a.name}</h3>
        <p style="color:var(--text-muted)">Current outstanding balance:</p>
        <p style="font-size:28px;font-weight:800;color:var(--primary);margin:8px 0">${Utils.fmt(a.balance)}</p>
      </div>
      <div class="form-group"><label>Amount to Settle</label><input type="number" id="settle_amt" value="${a.balance}"></div>
      <div class="form-group"><label>Notes</label><input id="settle_notes" placeholder="Settlement note..."></div>
    `, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-check"></i> Confirm Settlement', cls: 'btn-success', action: `Pages2.confirmSettlement(${id})` }
    ]);
  }

  function confirmSettlement(id) {
    const amt = parseInt(document.getElementById('settle_amt')?.value) || 0;
    const notes = document.getElementById('settle_notes')?.value;
    DB.Agents.update(id, { balance: 0 });
    DB.Finance.addRecord({ type: 'expense', amount: amt, description: `Agent settlement: ${notes || ''}`, category: 'settlement' });
    App.closeModal();
    Utils.toast('Settlement completed', 'success');
    renderAgents();
  }

  function openAgentForm(a, isEdit) {
    a = a || {};
    App.openModal(isEdit ? 'Edit Agent' : I18n.t('addAgent'), `
      <div class="form-grid2">
        <div class="form-group"><label>Branch Name</label><input id="af_name" value="${a.name||''}" required></div>
        <div class="form-group"><label>Agent Code</label><input id="af_code" value="${a.code||''}"></div>
        <div class="form-group"><label>Phone</label><input id="af_phone" value="${a.phone||''}"></div>
        <div class="form-group"><label>Email</label><input id="af_email" value="${a.email||''}"></div>
        <div class="form-group"><label>City</label><input id="af_city" value="${a.city||''}"></div>
        <div class="form-group"><label>Commission %</label><input type="number" id="af_commission" value="${a.commission||7}" step="0.5"></div>
        <div class="form-group"><label>Address</label><input id="af_address" value="${a.address||''}"></div>
        <div class="form-group"><label>Country</label>
          <select id="af_country"><option value="LA" ${a.country==='LA'?'selected':''}>Laos</option><option value="TH" ${a.country==='TH'?'selected':''}>Thailand</option><option value="CN" ${a.country==='CN'?'selected':''}>China</option></select>
        </div>
      </div>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-save"></i> Save', cls: 'btn-primary', action: `Pages2.saveAgent(${a.id||0})` }
    ]);
  }

  function saveAgent(id) {
    const data = {
      name: document.getElementById('af_name')?.value.trim(),
      code: document.getElementById('af_code')?.value.trim(),
      phone: document.getElementById('af_phone')?.value.trim(),
      email: document.getElementById('af_email')?.value.trim(),
      city: document.getElementById('af_city')?.value.trim(),
      commission: parseFloat(document.getElementById('af_commission')?.value) || 7,
      address: document.getElementById('af_address')?.value.trim(),
      country: document.getElementById('af_country')?.value,
    };
    if (!data.name) { Utils.toast('Name required', 'warning'); return; }
    if (id) DB.Agents.update(id, data); else DB.Agents.create(data);
    App.closeModal();
    Utils.toast('Agent saved', 'success');
    renderAgents();
  }

  // ============================================================
  // FINANCE
  // ============================================================
  function renderFinance() {
    const income = DB.Finance.getTotalIncome();
    const expense = DB.Finance.getTotalExpense();
    const profit = DB.Finance.getNetProfit();
    const records = DB.Finance.getAll().slice(0, 20);

    document.getElementById('pageContent').innerHTML = `
    <div class="page-header">
      <div><h1><i class="fas fa-chart-line"></i> ${I18n.t('finance')}</h1></div>
      <button class="btn btn-primary" onclick="Pages2.openAddFinanceRecord()"><i class="fas fa-plus"></i> Add Record</button>
    </div>
    <div class="finance-summary">
      <div class="finance-card">
        <div class="fc-icon" style="background:#dcfce7;color:var(--success)"><i class="fas fa-arrow-up"></i></div>
        <div class="fc-value" style="color:var(--success)">${Utils.fmt(income)}</div>
        <div class="fc-label">${I18n.t('totalIncome')}</div>
      </div>
      <div class="finance-card">
        <div class="fc-icon" style="background:#fee2e2;color:var(--danger)"><i class="fas fa-arrow-down"></i></div>
        <div class="fc-value" style="color:var(--danger)">${Utils.fmt(expense)}</div>
        <div class="fc-label">${I18n.t('totalExpense')}</div>
      </div>
      <div class="finance-card">
        <div class="fc-icon" style="background:${profit>=0?'#dcfce7':'#fee2e2'};color:${profit>=0?'var(--success)':'var(--danger)'}"><i class="fas fa-wallet"></i></div>
        <div class="fc-value" style="color:${profit>=0?'var(--success)':'var(--danger)'}">${Utils.fmt(profit)}</div>
        <div class="fc-label">${I18n.t('netProfit')}</div>
      </div>
    </div>
    <div class="grid2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-chart-bar"></i> Revenue vs Expenses</span></div>
        <div class="card-body"><div class="chart-container"><canvas id="financeChart"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="fas fa-chart-pie"></i> Income Breakdown</span></div>
        <div class="card-body"><div class="chart-container"><canvas id="incomeBreakChart"></canvas></div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title"><i class="fas fa-list"></i> Transaction Records</span></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            ${records.map(r=>`<tr>
              <td style="font-size:12px">${Utils.fmtDate(r.date||r.createdAt)}</td>
              <td>${r.type==='income'?'<span class="badge badge-delivered">Income</span>':'<span class="badge badge-exception">Expense</span>'}</td>
              <td style="font-size:12px;color:var(--text-muted)">${r.category||'—'}</td>
              <td>${r.description}</td>
              <td style="font-weight:700;color:${r.type==='income'?'var(--success)':'var(--danger)'}">${r.type==='income'?'+':'−'}${Utils.fmt(r.amount)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

    setTimeout(() => {
      // Revenue vs Expenses bar chart
      Utils.destroyChart('financeChart');
      const days30 = DB.Analytics.revenueByDay(14);
      const dateLabels = Object.keys(days30).map(d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; });
      new Chart(document.getElementById('financeChart'), {
        type: 'bar',
        data: {
          labels: dateLabels,
          datasets: [
            { label: 'Revenue', data: Object.values(days30), backgroundColor: 'rgba(16,185,129,.7)', borderRadius: 4 },
            { label: 'Expenses', data: Object.values(days30).map(v => Math.round(v * 0.35)), backgroundColor: 'rgba(239,68,68,.7)', borderRadius: 4 },
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }
      });
      Utils.destroyChart('incomeBreakChart');
      new Chart(document.getElementById('incomeBreakChart'), {
        type: 'pie',
        data: {
          labels: ['Shipping Fees', 'COD Fees', 'Agent Comm.', 'Value Added'],
          datasets: [{ data: [55, 20, 15, 10], backgroundColor: ['#3b82f6','#10b981','#f59e0b','#6366f1'], borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }, 100);
  }

  function openAddFinanceRecord() {
    App.openModal('Add Finance Record', `
      <div class="form-grid2">
        <div class="form-group"><label>Type</label><select id="fin_type"><option value="income">Income</option><option value="expense">Expense</option></select></div>
        <div class="form-group"><label>Category</label><input id="fin_cat" placeholder="e.g. shipping, operations"></div>
        <div class="form-group"><label>Amount (LAK)</label><input type="number" id="fin_amt" min="0"></div>
        <div class="form-group"><label>Date</label><input type="date" id="fin_date" value="${new Date().toISOString().split('T')[0]}"></div>
      </div>
      <div class="form-group"><label>Description</label><input id="fin_desc" placeholder="Record description..."></div>`, [
      { label: 'Cancel', cls: 'btn-secondary', action: 'App.closeModal()' },
      { label: '<i class="fas fa-save"></i> Save', cls: 'btn-primary', action: 'Pages2.saveFinanceRecord()' }
    ]);
  }

  function saveFinanceRecord() {
    const data = {
      type: document.getElementById('fin_type')?.value,
      category: document.getElementById('fin_cat')?.value.trim(),
      amount: parseInt(document.getElementById('fin_amt')?.value) || 0,
      date: document.getElementById('fin_date')?.value,
      description: document.getElementById('fin_desc')?.value.trim(),
    };
    if (!data.amount || !data.description) { Utils.toast('Amount and description required', 'warning'); return; }
    DB.Finance.addRecord(data);
    App.closeModal();
    Utils.toast('Record added', 'success');
    renderFinance();
  }

  function openManualInbound() {
    const zone  = document.getElementById('inboundZone')?.value  || 'Main Warehouse';
    const staff = document.getElementById('inboundStaff')?.value || 'Staff A';
    App.openModal(I18n.t('manualEntry'), `
      <div class="tabs" style="margin-bottom:14px">
        <button class="tab-btn active" onclick="App.switchTab(this,'miSearch')"><i class="fas fa-search"></i> ຄົ້ນຫາ</button>
        <button class="tab-btn" onclick="App.switchTab(this,'miCreate')"><i class="fas fa-plus"></i> ສ້າງໃໝ່</button>
      </div>
      <div id="miSearch" class="tab-panel active">
        <input id="manualSearchInput" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);font-size:13px;box-sizing:border-box;margin-bottom:10px"
          placeholder="ຄົ້ນຫາດ້ວຍ ເລກຕິດຕາມ / ຊື່ / ເມືອງ..."
          oninput="Pages2.doManualSearch(this.value,'manualSearchResults','inbound')">
        <div id="manualSearchResults" style="max-height:300px;overflow-y:auto"></div>
      </div>
      <div id="miCreate" class="tab-panel">
        <div class="form-grid2" style="gap:10px;margin-bottom:10px">
          <div class="form-group" style="margin:0"><label style="font-size:12px">ເລກຕິດຕາມ <small style="color:var(--text-muted)">(ປ່ອຍວ່າງ=ສ້າງໃຫ້ອັດຕະໂນມັດ)</small></label><input id="mi_tn" placeholder="LA... ຫຼື ເລກຕ່າງປະເທດ" style="text-transform:uppercase" oninput="this.value=this.value.toUpperCase()"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px"><i class="fas fa-globe"></i> ${I18n.t('foreignCarrier')}</label><input id="mi_carrier" placeholder="DHL / FedEx / EMS..."></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('senderName')} *</label><input id="mi_sName" placeholder="ຊື່ຜູ້ສົ່ງ"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('senderPhone')}</label><input id="mi_sPhone" placeholder="+856 20..."></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('origin')}</label><input id="mi_sCity" placeholder="ເມືອງ / ປະເທດ"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('receiverName')} *</label><input id="mi_rName" placeholder="ຊື່ຜູ້ຮັບ"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('receiverPhone')}</label><input id="mi_rPhone" placeholder="+856 20..."></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('destination')}</label><input id="mi_rCity" placeholder="ເມືອງ"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('weight')} (kg)</label><input id="mi_weight" type="number" step="0.1" min="0" placeholder="0.0"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('length')} (cm)</label><input id="mi_length" type="number" min="0" placeholder="0" oninput="Pages2.calcManualCBM()"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('width')} (cm)</label><input id="mi_width" type="number" min="0" placeholder="0" oninput="Pages2.calcManualCBM()"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('height')} (cm)</label><input id="mi_height" type="number" min="0" placeholder="0" oninput="Pages2.calcManualCBM()"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('cbm')}</label><input id="mi_cbm" type="text" readonly style="background:var(--bg-secondary);color:var(--text-muted)" value="—"></div>
          <div class="form-group" style="margin:0"><label style="font-size:12px">${I18n.t('service')}</label>
            <select id="mi_service" style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px">
              <option>Standard</option><option>Express</option><option>Economy</option><option>Overnight</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin:0;grid-column:span 2">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px">
            <input type="checkbox" id="mi_isVIP" style="width:16px;height:16px;accent-color:#d97706">
            ⭐ ${I18n.t('vipCustomer')} <small style="color:var(--text-muted)">(ໃຊ້ລາຄາ VIP)</small>
          </label>
        </div>
        <div class="form-group" style="margin:0 0 10px"><label style="font-size:12px">${I18n.t('notes')}</label><input id="mi_notes" placeholder="ໝາຍເຫດ..."></div>
        <div style="background:var(--bg-secondary);padding:8px 12px;border-radius:6px;font-size:12px;color:var(--text-muted);margin-bottom:10px">
          <i class="fas fa-map-marker-alt"></i> ${zone} &nbsp;|&nbsp; <i class="fas fa-user"></i> ${staff}
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="Pages2.saveManualInbound()">
          <i class="fas fa-sign-in-alt"></i> ສ້າງ & ຮັບເຂົ້າສາງ
        </button>
      </div>
    `, [{ label: I18n.t('close'), cls: 'btn-secondary', action: 'App.closeModal()' }], 'modal-lg');
    setTimeout(() => { Pages2.doManualSearch('', 'manualSearchResults', 'inbound'); document.getElementById('manualSearchInput')?.focus(); }, 60);
  }

  function saveManualInbound() {
    const zone    = document.getElementById('inboundZone')?.value  || 'Main Warehouse';
    const staff   = document.getElementById('inboundStaff')?.value || 'Staff A';
    const tn      = document.getElementById('mi_tn')?.value.trim().toUpperCase() || '';
    const carrier = document.getElementById('mi_carrier')?.value.trim() || '';
    const sName   = document.getElementById('mi_sName')?.value.trim();
    const rName   = document.getElementById('mi_rName')?.value.trim();
    if (!sName || !rName) { Utils.toast('ກະລຸນາໃສ່ຊື່ຜູ້ສົ່ງ ແລະ ຜູ້ຮັບ', 'warning'); return; }

    // If tracking already exists, just receive it
    if (tn) {
      const existing = DB.Shipments.getByTracking(tn);
      if (existing) {
        const remark = `ຮັບເຂົ້າສາງ (ດ້ວຍມື) — Zone: ${zone} | ພະນັກງານ: ${staff}`;
        DB.Shipments.updateStatus(existing.id, 'in-warehouse', zone, remark);
        App.closeModal();
        Utils.toast(`${tn} ຮັບເຂົ້າ ${zone}`, 'success');
        renderWarehouse();
        return;
      }
    }

    const notes = [
      carrier ? `Carrier: ${carrier}` : '',
      document.getElementById('mi_notes')?.value.trim() || ''
    ].filter(Boolean).join(' | ');

    const createData = {
      senderName: sName || carrier || 'Unknown',
      senderPhone: document.getElementById('mi_sPhone')?.value.trim() || '',
      senderAddress: '', senderCity: document.getElementById('mi_sCity')?.value.trim() || '',
      receiverName: rName,
      receiverPhone: document.getElementById('mi_rPhone')?.value.trim() || '',
      receiverAddress: '', receiverCity: document.getElementById('mi_rCity')?.value.trim() || '',
      weight: parseFloat(document.getElementById('mi_weight')?.value) || 0,
      length: parseFloat(document.getElementById('mi_length')?.value) || 0,
      width:  parseFloat(document.getElementById('mi_width')?.value)  || 0,
      height: parseFloat(document.getElementById('mi_height')?.value) || 0,
      isVIP: document.getElementById('mi_isVIP')?.checked || false,
      declaredValue: 0, price: 0, cod: 0,
      service: document.getElementById('mi_service')?.value || 'Standard',
      paymentMethod: 'prepaid', status: 'pending', notes
    };
    if (tn) createData.trackingNumber = tn;
    const s = DB.Shipments.create(createData);

    const remark = `ຮັບເຂົ້າສາງ (ດ້ວຍມື) — Zone: ${zone} | ພະນັກງານ: ${staff}${carrier ? ' | Carrier: ' + carrier : ''}`;
    DB.Shipments.updateStatus(s.id, 'in-warehouse', zone, remark);
    App.closeModal();
    Utils.toast(`${s.trackingNumber} ສ້າງ & ຮັບເຂົ້າ ${zone} ສຳເລັດ`, 'success');
    renderWarehouse();
  }

  function calcManualCBM() {
    const l = parseFloat(document.getElementById('mi_length')?.value) || 0;
    const w = parseFloat(document.getElementById('mi_width')?.value)  || 0;
    const h = parseFloat(document.getElementById('mi_height')?.value) || 0;
    const el = document.getElementById('mi_cbm');
    if (el) el.value = (l && w && h) ? ((l*w*h)/1e6).toFixed(4)+' m³' : '—';
  }

  function openManualOutbound() {
    App.openModal(I18n.t('searchAndDispatch'), `
      <div style="margin-bottom:12px">
        <input id="manualSearchInput" class="form-control" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius);font-size:13px"
          placeholder="ຄົ້ນຫາດ້ວຍ ເລກຕິດຕາມ / ຊື່ / ເມືອງ..."
          oninput="Pages2.doManualSearch(this.value,'manualSearchResults','outbound')">
      </div>
      <div id="manualSearchResults" style="max-height:340px;overflow-y:auto"></div>
    `, [{ label: I18n.t('close'), cls: 'btn-secondary', action: 'App.closeModal()' }], 'modal-md');
    setTimeout(() => { Pages2.doManualSearch('', 'manualSearchResults', 'outbound'); document.getElementById('manualSearchInput')?.focus(); }, 60);
  }

  function doManualSearch(q, resultId, mode) {
    const results = document.getElementById(resultId);
    if (!results) return;
    const items = DB.Shipments.search(q).slice(0, 20);
    if (!items.length) {
      results.innerHTML = `<div style="text-align:center;padding:28px;color:var(--text-muted)"><i class="fas fa-search" style="font-size:24px;margin-bottom:8px;display:block"></i>ບໍ່ພົບຂໍ້ມູນ</div>`;
      return;
    }
    results.innerHTML = items.map(s => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1;min-width:0;overflow:hidden">
          <code style="color:var(--primary);font-size:12px;font-weight:700">${s.trackingNumber}</code>
          <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.senderName} → ${s.receiverName} | ${s.receiverCity}</div>
        </div>
        ${Utils.statusBadge(s.status)}
        ${mode === 'inbound'
          ? `<button class="btn btn-sm btn-primary" onclick="Pages2.manualReceive('${s.trackingNumber}')"><i class="fas fa-sign-in-alt"></i> ຮັບເຂົ້າ</button>`
          : `<button class="btn btn-sm btn-success" onclick="Pages2.manualDispatch('${s.trackingNumber}')"><i class="fas fa-truck"></i> ສົ່ງອອກ</button>`}
      </div>`).join('');
  }

  function manualReceive(tn) {
    App.closeModal();
    const el = document.getElementById('inboundScan');
    if (el) el.value = tn;
    processInbound();
  }

  function manualDispatch(tn) {
    App.closeModal();
    const el = document.getElementById('outboundScan');
    if (el) el.value = tn;
    processOutbound();
  }

  return { renderWarehouse, processInbound, processOutbound, quickDispatch, viewLocation, openManualInbound, openManualOutbound, calcManualCBM, doManualSearch, manualReceive, manualDispatch, saveManualInbound, renderDrivers, toggleDriverStatus, viewDriverParcels, openDriverForm, saveDriver, renderCustomers, viewCustomerHistory, openCustomerForm, saveCustomer, deleteCustomer, renderAgents, viewAgentReport, settleAgent, confirmSettlement, openAgentForm, saveAgent, renderFinance, openAddFinanceRecord, saveFinanceRecord };
})();
