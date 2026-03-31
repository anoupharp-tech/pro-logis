// ============================================================
// Database Module — localStorage-based mock database
// Tables: shipments, tracking_history, drivers, customers,
//         agents, orders, payments, finance, exceptions, users
// ============================================================
const DB = (() => {
  const KEYS = {
    shipments: 'erp_shipments', tracking: 'erp_tracking', drivers: 'erp_drivers',
    customers: 'erp_customers', agents: 'erp_agents', orders: 'erp_orders',
    payments: 'erp_payments', finance: 'erp_finance', exceptions: 'erp_exceptions',
    users: 'erp_users', seq: 'erp_seq', notifications: 'erp_notifications'
  };

  function get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
  function set(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  function nextId(table) {
    const seq = JSON.parse(localStorage.getItem(KEYS.seq) || '{}');
    seq[table] = (seq[table] || 0) + 1;
    localStorage.setItem(KEYS.seq, JSON.stringify(seq));
    return seq[table];
  }
  function now() { return new Date().toISOString(); }
  function dateStr(offset = 0) {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }

  function seed() {
    if (localStorage.getItem('erp_seeded')) return;

    set(KEYS.users, [
      { id:1, name:'Admin User', email:'admin@prologists.la', password:'admin123', role:'admin', avatar:'AU', phone:'+856 20 1234 5678', active:true, createdAt:'2025-01-01' },
      { id:2, name:'Manager Lee', email:'manager@prologists.la', password:'manager123', role:'manager', avatar:'ML', phone:'+856 20 2345 6789', active:true, createdAt:'2025-01-15' },
      { id:3, name:'Agent Vientiane', email:'agent@prologists.la', password:'agent123', role:'agent', avatar:'AV', agentId:1, phone:'+856 20 3456 7890', active:true, createdAt:'2025-02-01' },
      { id:4, name:'Driver Somchai', email:'driver@prologists.la', password:'driver123', role:'driver', avatar:'DS', driverId:1, phone:'+856 20 4567 8901', active:true, createdAt:'2025-02-15' },
      { id:5, name:'Customer Kham', email:'customer@prologists.la', password:'customer123', role:'customer', avatar:'CK', customerId:1, phone:'+856 20 5678 9012', active:true, createdAt:'2025-03-01' },
    ]);

    set(KEYS.customers, [
      { id:1, name:'Kham Phommasack', email:'kham@email.la', phone:'+856 20 5678 9012', address:'12 Saylom Rd', city:'Vientiane', country:'LA', totalShipments:24, balance:150000, createdAt:'2025-03-01' },
      { id:2, name:'Noy Chanthavong', email:'noy@email.la', phone:'+856 20 6789 0123', address:'45 Setthathilath', city:'Luang Prabang', country:'LA', totalShipments:12, balance:80000, createdAt:'2025-03-15' },
      { id:3, name:'Somphone Keola', email:'somphone@email.com', phone:'+856 20 7890 1234', address:'78 Mekong Blvd', city:'Pakse', country:'LA', totalShipments:8, balance:45000, createdAt:'2025-04-01' },
      { id:4, name:'Wang Li', email:'wang.li@email.cn', phone:'+86 138 1234 5678', address:'99 Kunming St', city:'Kunming', country:'CN', totalShipments:35, balance:220000, createdAt:'2025-02-10' },
      { id:5, name:'Siriporn Thanakit', email:'siriporn@email.th', phone:'+66 81 234 5678', address:'55 Sukhumvit Soi 11', city:'Bangkok', country:'TH', totalShipments:19, balance:120000, createdAt:'2025-01-20' },
    ]);

    set(KEYS.agents, [
      { id:1, name:'Vientiane Central', code:'VTE-001', email:'vte@prologists.la', phone:'+856 21 234567', address:'23 Lan Xang Ave', city:'Vientiane', country:'LA', commission:8, balance:450000, totalShipments:128, active:true, createdAt:'2024-12-01' },
      { id:2, name:'Luang Prabang Branch', code:'LPB-002', email:'lpb@prologists.la', phone:'+856 71 212345', address:'7 Phothisalath', city:'Luang Prabang', country:'LA', commission:7, balance:280000, totalShipments:76, active:true, createdAt:'2024-12-15' },
      { id:3, name:'Pakse Agent', code:'PKS-003', email:'pks@prologists.la', phone:'+856 31 251234', address:'15 Nokeochoumphon', city:'Pakse', country:'LA', commission:7.5, balance:190000, totalShipments:54, active:true, createdAt:'2025-01-10' },
      { id:4, name:'Bangkok Office', code:'BKK-004', email:'bkk@prologists.la', phone:'+66 2 345 6789', address:'88 Silom Rd', city:'Bangkok', country:'TH', commission:6, balance:680000, totalShipments:215, active:true, createdAt:'2024-11-01' },
      { id:5, name:'Kunming Partner', code:'KMG-005', email:'kmg@prologists.la', phone:'+86 871 1234567', address:'56 Renmin Donglu', city:'Kunming', country:'CN', commission:5.5, balance:920000, totalShipments:312, active:false, createdAt:'2024-10-15' },
    ]);

    set(KEYS.drivers, [
      { id:1, name:'Somchai Boupha', email:'driver@prologists.la', phone:'+856 20 4567 8901', licenseNumber:'DL-2023-001', vehicleType:'Motorbike', vehiclePlate:'VTE-1234', status:'online', currentLocation:{lat:17.9757,lng:102.6331}, assignedParcels:5, completedDeliveries:148, earnings:1250000, agentId:1, createdAt:'2025-01-05' },
      { id:2, name:'Bouakhay Siphone', email:'bouakhay@prologists.la', phone:'+856 20 5678 9012', licenseNumber:'DL-2023-002', vehicleType:'Van', vehiclePlate:'VTE-5678', status:'online', currentLocation:{lat:17.972,lng:102.62}, assignedParcels:8, completedDeliveries:203, earnings:1800000, agentId:1, createdAt:'2025-01-10' },
      { id:3, name:'Khamla Douangmala', email:'khamla@prologists.la', phone:'+856 20 6789 0123', licenseNumber:'DL-2023-003', vehicleType:'Motorbike', vehiclePlate:'LPB-2345', status:'offline', currentLocation:{lat:19.8845,lng:102.1348}, assignedParcels:0, completedDeliveries:95, earnings:870000, agentId:2, createdAt:'2025-02-01' },
      { id:4, name:'Viengsamai Phetsana', email:'vieng@prologists.la', phone:'+856 20 7890 1234', licenseNumber:'DL-2023-004', vehicleType:'Truck', vehiclePlate:'PKS-3456', status:'online', currentLocation:{lat:15.1207,lng:105.7919}, assignedParcels:12, completedDeliveries:267, earnings:2100000, agentId:3, createdAt:'2025-01-20' },
    ]);

    const statuses = ['pending','processing','in-warehouse','out-for-delivery','delivered','delivered','delivered','exception'];
    const services = ['Standard','Express','Economy','Overnight'];
    const cities = ['Vientiane','Luang Prabang','Pakse','Savannakhet','Thakhek','Bangkok','Kunming','Chiang Mai'];
    const senderNames = ['Kham P.','Wang Li','Noy C.','Siriporn T.','Somphone K.'];
    const receiverNames = ['Chen Wei','Malee S.','Phonethip B.','Ahmad R.','Park J.'];
    const shipments = [];

    for (let i = 1; i <= 50; i++) {
      const date = new Date(); date.setDate(date.getDate() - Math.floor(Math.random() * 60));
      const dateCode = date.toISOString().split('T')[0].replace(/-/g,'');
      const st = statuses[Math.floor(Math.random() * statuses.length)];
      shipments.push({
        id:i, trackingNumber:`LA${dateCode}${String(i).padStart(3,'0')}`,
        customerId:Math.ceil(Math.random()*5), agentId:Math.ceil(Math.random()*5),
        driverId:(st==='out-for-delivery'||st==='delivered')?Math.ceil(Math.random()*4):null,
        senderName:senderNames[Math.floor(Math.random()*5)],
        senderPhone:`+856 20 ${Math.floor(Math.random()*9000000+1000000)}`,
        senderAddress:`${Math.floor(Math.random()*99)+1} Main St`,
        senderCity:cities[Math.floor(Math.random()*8)],
        receiverName:receiverNames[Math.floor(Math.random()*5)],
        receiverPhone:`+856 20 ${Math.floor(Math.random()*9000000+1000000)}`,
        receiverAddress:`${Math.floor(Math.random()*99)+1} Delivery Rd`,
        receiverCity:cities[Math.floor(Math.random()*8)],
        weight:+(Math.random()*20+0.5).toFixed(1),
        length:Math.floor(Math.random()*50+10), width:Math.floor(Math.random()*40+10), height:Math.floor(Math.random()*30+5),
        declaredValue:Math.floor(Math.random()*500000+10000),
        price:Math.floor(Math.random()*80000+15000),
        cod:Math.random()>0.6?Math.floor(Math.random()*200000+20000):0,
        service:services[Math.floor(Math.random()*4)],
        paymentMethod:['prepaid','cod','account'][Math.floor(Math.random()*3)],
        status:st, notes:Math.random()>0.7?'Handle with care':'',
        createdAt:date.toISOString(), updatedAt:new Date().toISOString(),
      });
    }
    set(KEYS.shipments, shipments);

    const tracking = [];
    let tid = 1;
    shipments.forEach(s => {
      getTrackingSteps(s.status, s.createdAt).forEach(step => {
        tracking.push({ id:tid++, shipmentId:s.id, ...step });
      });
    });
    set(KEYS.tracking, tracking);

    const financeRecords = [];
    for (let i = 1; i <= 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      financeRecords.push({ id:i, type:i%3===0?'expense':'income', amount:Math.floor(Math.random()*500000+50000), description:i%3===0?'Driver payment':'Shipping fee collected', category:i%3===0?'operations':'revenue', date:d.toISOString().split('T')[0], createdAt:d.toISOString() });
    }
    set(KEYS.finance, financeRecords);

    set(KEYS.exceptions, [
      { id:1, shipmentId:3, trackingNumber:'LA20260101003', type:'lost', description:'Parcel missing since warehouse scan 3 days ago.', status:'open', priority:'high', reportedBy:'Agent Vientiane', assignedTo:'Manager Lee', createdAt:dateStr(-3)+'T09:00:00Z', resolvedAt:null },
      { id:2, shipmentId:7, trackingNumber:'LA20260105007', type:'wrong-address', description:'Address on label does not match database.', status:'in-progress', priority:'medium', reportedBy:'Driver Somchai', assignedTo:'Agent Vientiane', createdAt:dateStr(-1)+'T14:00:00Z', resolvedAt:null },
      { id:3, shipmentId:12, trackingNumber:'LA20260110012', type:'rejected', description:'Receiver refused delivery.', status:'resolved', priority:'low', reportedBy:'Driver Bouakhay', assignedTo:'Customer Service', createdAt:dateStr(-5)+'T11:00:00Z', resolvedAt:dateStr(-4)+'T15:00:00Z' },
      { id:4, shipmentId:18, trackingNumber:'LA20260115018', type:'damage', description:'Package arrived with visible damage.', status:'open', priority:'high', reportedBy:'Customer Kham', assignedTo:'Manager Lee', createdAt:dateStr(0)+'T08:00:00Z', resolvedAt:null },
    ]);

    set(KEYS.notifications, [
      { id:1, type:'info', icon:'fa-box', title:'New shipment created', body:'Tracking #LA20260322050 has been created', time:'2 min ago', read:false },
      { id:2, type:'success', icon:'fa-check-circle', title:'Delivery confirmed', body:'LA20260320045 delivered successfully', time:'1 hour ago', read:false },
      { id:3, type:'warning', icon:'fa-exclamation-triangle', title:'Exception reported', body:'Package LA20260301003 is missing', time:'3 hours ago', read:false },
      { id:4, type:'danger', icon:'fa-map-marker-alt', title:'Wrong address', body:'Driver reported wrong address for LA20260305007', time:'5 hours ago', read:true },
      { id:5, type:'info', icon:'fa-dollar-sign', title:'Payment received', body:'COD collected: 150,000 LAK', time:'1 day ago', read:true },
    ]);

    localStorage.setItem('erp_seeded', '1');
    localStorage.setItem(KEYS.seq, JSON.stringify({ shipments:50, tracking:tid-1, customers:5, agents:5, drivers:4, finance:30, exceptions:4 }));
  }

  function getTrackingSteps(status, createdAt) {
    const base = new Date(createdAt);
    const advance = (h) => { const d = new Date(base); d.setHours(d.getHours()+h); return d.toISOString(); };
    const steps = [{ status:'pending', location:'Origin', description:'Shipment created', timestamp:base.toISOString(), updatedBy:'System' }];
    if (['processing','in-warehouse','out-for-delivery','delivered'].includes(status))
      steps.push({ status:'processing', location:'Origin Hub', description:'Parcel received and processing', timestamp:advance(2), updatedBy:'Agent' });
    if (['in-warehouse','out-for-delivery','delivered'].includes(status))
      steps.push({ status:'in-warehouse', location:'Main Warehouse', description:'Sorted and stored in warehouse', timestamp:advance(8), updatedBy:'Warehouse Staff' });
    if (['out-for-delivery','delivered'].includes(status))
      steps.push({ status:'out-for-delivery', location:'Local Hub', description:'Out for delivery with driver', timestamp:advance(24), updatedBy:'Driver' });
    if (status==='delivered')
      steps.push({ status:'delivered', location:'Destination', description:'Delivered successfully', timestamp:advance(32), updatedBy:'Driver' });
    if (status==='exception')
      steps.push({ status:'exception', location:'Hub', description:'Issue detected — under investigation', timestamp:advance(12), updatedBy:'System' });
    return steps;
  }

  const Shipments = {
    getAll() { return get(KEYS.shipments); },
    getById(id) { return get(KEYS.shipments).find(s=>s.id==id)||null; },
    getByTracking(tn) { return get(KEYS.shipments).find(s=>s.trackingNumber===tn)||null; },
    getByCustomer(cid) { return get(KEYS.shipments).filter(s=>s.customerId==cid); },
    getByAgent(aid) { return get(KEYS.shipments).filter(s=>s.agentId==aid); },
    getByDriver(did) { return get(KEYS.shipments).filter(s=>s.driverId==did); },
    create(data) {
      const all = get(KEYS.shipments);
      const id = nextId('shipments');
      const today = new Date().toISOString().split('T')[0].replace(/-/g,'');
      const item = { id, trackingNumber:`LA${today}${String(id).padStart(3,'0')}`, ...data, createdAt:now(), updatedAt:now() };
      all.push(item); set(KEYS.shipments, all);
      Tracking.add({ shipmentId:id, status:'pending', location:'Origin', description:'Shipment created', timestamp:now(), updatedBy:'System' });
      return item;
    },
    update(id, data) {
      const all = get(KEYS.shipments);
      const idx = all.findIndex(s=>s.id==id);
      if (idx===-1) return null;
      all[idx] = { ...all[idx], ...data, updatedAt:now() };
      set(KEYS.shipments, all); return all[idx];
    },
    updateStatus(id, status, location, description) {
      const s = this.update(id, { status });
      if (s) Tracking.add({ shipmentId:id, status, location:location||'Hub', description:description||`Status: ${status}`, timestamp:now(), updatedBy:'System' });
      return s;
    },
    delete(id) { set(KEYS.shipments, get(KEYS.shipments).filter(s=>s.id!=id)); },
    count() { return get(KEYS.shipments).length; },
    countByStatus(st) { return get(KEYS.shipments).filter(s=>s.status===st).length; },
    totalRevenue() { return get(KEYS.shipments).reduce((s,sh)=>s+(sh.price||0),0); },
    search(q, statusFilter) {
      let all = get(KEYS.shipments);
      if (statusFilter && statusFilter!=='all') all = all.filter(s=>s.status===statusFilter);
      if (q) {
        const lq = q.toLowerCase();
        all = all.filter(s=>
          s.trackingNumber.toLowerCase().includes(lq) ||
          (s.senderName||'').toLowerCase().includes(lq) ||
          (s.receiverName||'').toLowerCase().includes(lq) ||
          (s.senderCity||'').toLowerCase().includes(lq) ||
          (s.receiverCity||'').toLowerCase().includes(lq)
        );
      }
      return all.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    },
  };

  const Tracking = {
    getAll() { return get(KEYS.tracking); },
    getByShipment(sid) { return get(KEYS.tracking).filter(t=>t.shipmentId==sid).sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp)); },
    add(data) {
      const all = get(KEYS.tracking);
      const item = { id:nextId('tracking'), ...data };
      all.push(item); set(KEYS.tracking, all); return item;
    },
  };

  const Drivers = {
    getAll() { return get(KEYS.drivers); },
    getById(id) { return get(KEYS.drivers).find(d=>d.id==id)||null; },
    create(data) {
      const all = get(KEYS.drivers);
      const item = { id:nextId('drivers'), ...data, completedDeliveries:0, earnings:0, status:'offline', assignedParcels:0, createdAt:now() };
      all.push(item); set(KEYS.drivers, all); return item;
    },
    update(id, data) {
      const all = get(KEYS.drivers);
      const idx = all.findIndex(d=>d.id==id);
      if (idx===-1) return null;
      all[idx] = { ...all[idx], ...data }; set(KEYS.drivers, all); return all[idx];
    },
    delete(id) { set(KEYS.drivers, get(KEYS.drivers).filter(d=>d.id!=id)); },
  };

  const Customers = {
    getAll() { return get(KEYS.customers); },
    getById(id) { return get(KEYS.customers).find(c=>c.id==id)||null; },
    create(data) {
      const all = get(KEYS.customers);
      const item = { id:nextId('customers'), ...data, totalShipments:0, balance:0, createdAt:now() };
      all.push(item); set(KEYS.customers, all); return item;
    },
    update(id, data) {
      const all = get(KEYS.customers);
      const idx = all.findIndex(c=>c.id==id);
      if (idx===-1) return null;
      all[idx] = { ...all[idx], ...data }; set(KEYS.customers, all); return all[idx];
    },
    delete(id) { set(KEYS.customers, get(KEYS.customers).filter(c=>c.id!=id)); },
    search(q) {
      if (!q) return get(KEYS.customers);
      const lq = q.toLowerCase();
      return get(KEYS.customers).filter(c=>c.name.toLowerCase().includes(lq)||c.email.toLowerCase().includes(lq)||c.phone.includes(q));
    },
  };

  const Agents = {
    getAll() { return get(KEYS.agents); },
    getById(id) { return get(KEYS.agents).find(a=>a.id==id)||null; },
    create(data) {
      const all = get(KEYS.agents);
      const item = { id:nextId('agents'), ...data, balance:0, totalShipments:0, active:true, createdAt:now() };
      all.push(item); set(KEYS.agents, all); return item;
    },
    update(id, data) {
      const all = get(KEYS.agents);
      const idx = all.findIndex(a=>a.id==id);
      if (idx===-1) return null;
      all[idx] = { ...all[idx], ...data }; set(KEYS.agents, all); return all[idx];
    },
    delete(id) { set(KEYS.agents, get(KEYS.agents).filter(a=>a.id!=id)); },
  };

  const Finance = {
    getAll() { return get(KEYS.finance).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); },
    addRecord(data) {
      const all = get(KEYS.finance);
      const item = { id:nextId('finance'), ...data, createdAt:now() };
      all.push(item); set(KEYS.finance, all); return item;
    },
    getTotalIncome() { return get(KEYS.finance).filter(f=>f.type==='income').reduce((s,f)=>s+f.amount,0); },
    getTotalExpense() { return get(KEYS.finance).filter(f=>f.type==='expense').reduce((s,f)=>s+f.amount,0); },
    getNetProfit() { return this.getTotalIncome()-this.getTotalExpense(); },
    getByPeriod(days) {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
      return get(KEYS.finance).filter(f=>new Date(f.createdAt)>=cutoff);
    },
  };

  const Exceptions = {
    getAll() { return get(KEYS.exceptions).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); },
    getById(id) { return get(KEYS.exceptions).find(e=>e.id==id)||null; },
    create(data) {
      const all = get(KEYS.exceptions);
      const item = { id:nextId('exceptions'), ...data, status:'open', createdAt:now(), resolvedAt:null };
      all.push(item); set(KEYS.exceptions, all); return item;
    },
    update(id, data) {
      const all = get(KEYS.exceptions);
      const idx = all.findIndex(e=>e.id==id);
      if (idx===-1) return null;
      all[idx] = { ...all[idx], ...data }; set(KEYS.exceptions, all); return all[idx];
    },
    resolve(id) { return this.update(id, { status:'resolved', resolvedAt:now() }); },
    countOpen() { return get(KEYS.exceptions).filter(e=>e.status==='open').length; },
  };

  const Notifications = {
    getAll() { return get(KEYS.notifications); },
    countUnread() { return get(KEYS.notifications).filter(n=>!n.read).length; },
    add(data) {
      const all = get(KEYS.notifications);
      const item = { id:nextId('notif'), ...data, read:false, time:'just now' };
      all.unshift(item); set(KEYS.notifications, all); return item;
    },
    markAllRead() { set(KEYS.notifications, get(KEYS.notifications).map(n=>({...n,read:true}))); },
  };

  const Users = {
    getAll() { return get(KEYS.users); },
    getByEmail(email) { return get(KEYS.users).find(u=>u.email===email)||null; },
    create(data) {
      const all = get(KEYS.users);
      const item = { id:nextId('users'), ...data, role:'customer', active:true, createdAt:now() };
      all.push(item); set(KEYS.users, all);
      Customers.create({ name:data.name, email:data.email, phone:data.phone||'', address:data.address||'', city:data.city||'', country:data.country||'LA' });
      return item;
    },
  };

  const Analytics = {
    shipmentsByDay(days=30) {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
      const all = get(KEYS.shipments).filter(s=>new Date(s.createdAt)>=cutoff);
      const map = {};
      for (let i=days-1; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i);
        map[d.toISOString().split('T')[0]] = 0;
      }
      all.forEach(s => { const day=s.createdAt.split('T')[0]; if(map[day]!==undefined) map[day]++; });
      return map;
    },
    revenueByDay(days=30) {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
      const all = get(KEYS.shipments).filter(s=>new Date(s.createdAt)>=cutoff);
      const map = {};
      for (let i=days-1; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i);
        map[d.toISOString().split('T')[0]] = 0;
      }
      all.forEach(s => { const day=s.createdAt.split('T')[0]; if(map[day]!==undefined) map[day]+=(s.price||0); });
      return map;
    },
    statusBreakdown() {
      const map = {};
      get(KEYS.shipments).forEach(s=>{ map[s.status]=(map[s.status]||0)+1; });
      return map;
    },
    topCities(n=5) {
      const map = {};
      get(KEYS.shipments).forEach(s=>{ if(s.receiverCity) map[s.receiverCity]=(map[s.receiverCity]||0)+1; });
      return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,n);
    },
    topAgents(n=5) {
      const map = {};
      get(KEYS.shipments).forEach(s=>{ if(s.agentId) map[s.agentId]=(map[s.agentId]||0)+1; });
      return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([id,count])=>{
        const ag = get(KEYS.agents).find(a=>a.id==id);
        return { name:ag?ag.name:`Agent ${id}`, count };
      });
    },
    deliveryRate() {
      const all = get(KEYS.shipments);
      return all.length>0 ? Math.round((all.filter(s=>s.status==='delivered').length/all.length)*100) : 0;
    },
  };

  return { seed, Shipments, Tracking, Drivers, Customers, Agents, Finance, Exceptions, Notifications, Users, Analytics };
})();
