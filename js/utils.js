// ============================================================
// Utils Module — Formatting, Barcode, QR, PDF Labels, Misc
// ============================================================
const Utils = (() => {

  // ---- FORMATTING ----
  function fmt(n, currency = 'LAK') {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  }
  function fmtNum(n) { return new Intl.NumberFormat('en-US').format(n || 0); }
  function fmtDate(iso, opts = {}) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', ...opts });
  }
  function fmtDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function fmtRelative(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  }
  function fmtWeight(kg) { return `${kg} kg`; }
  function fmtSize(l, w, h) { return `${l}×${w}×${h} cm`; }

  // ---- STATUS ----
  function statusBadge(status) {
    const cls = {
      'pending': 'badge-pending', 'processing': 'badge-processing',
      'in-warehouse': 'badge-in-warehouse', 'out-for-delivery': 'badge-out-for-delivery',
      'delivered': 'badge-delivered', 'exception': 'badge-exception',
      'cancelled': 'badge-cancelled', 'returned': 'badge-returned', 'lost': 'badge-lost',
      'paid': 'badge-paid', 'unpaid': 'badge-unpaid',
      'active': 'badge-active', 'inactive': 'badge-inactive',
      'online': 'badge-online', 'offline': 'badge-offline',
      'open': 'badge-exception', 'in-progress': 'badge-processing', 'resolved': 'badge-delivered',
    };
    const labels = {
      'pending': I18n.t('pending'), 'processing': I18n.t('processing'),
      'in-warehouse': I18n.t('inWarehouse'), 'out-for-delivery': I18n.t('outForDelivery'),
      'delivered': I18n.t('delivered'), 'exception': I18n.t('exception'),
      'cancelled': I18n.t('cancelled'), 'returned': I18n.t('returned'), 'lost': I18n.t('lost'),
      'paid': I18n.t('paid'), 'unpaid': I18n.t('unpaid'),
      'active': 'Active', 'inactive': 'Inactive',
      'online': 'Online', 'offline': 'Offline',
      'open': 'Open', 'in-progress': 'In Progress', 'resolved': 'Resolved',
    };
    return `<span class="badge ${cls[status] || 'badge-pending'}">${labels[status] || status}</span>`;
  }

  function priorityBadge(p) {
    const cls = { high: 'badge-exception', medium: 'badge-out-for-delivery', low: 'badge-processing' };
    return `<span class="badge ${cls[p] || 'badge-processing'}">${p || 'medium'}</span>`;
  }

  // ---- TOAST ----
  function toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.style.animation = 'slideOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, duration);
  }

  // ---- PASSWORD TOGGLE ----
  function togglePwd(id, btn) {
    const input = document.getElementById(id);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) icon.className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  }

  // ---- BARCODE ----
  function generateBarcode(trackingNumber, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    try {
      JsBarcode(`#${containerId}`, trackingNumber, {
        format: 'CODE128', width: 2, height: 60, displayValue: true,
        fontSize: 12, margin: 8, background: '#fff', lineColor: '#000',
      });
    } catch (e) { el.innerHTML = `<text>Barcode: ${trackingNumber}</text>`; }
  }

  function generateBarcodeDataURL(trackingNumber) {
    return new Promise((resolve) => {
      const svg = document.getElementById('barcodeSVG');
      if (!svg || typeof JsBarcode === 'undefined') { resolve(null); return; }
      JsBarcode(svg, trackingNumber, { format: 'CODE128', width: 2, height: 50, displayValue: true, fontSize: 11, margin: 4 });
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  }

  // ---- QR CODE ----
  function generateQR(text, containerId, opts = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (typeof QRCode === 'undefined') { console.warn('QR error: QRCode not loaded'); return; }
    try {
      new QRCode(container, {
        text, width: opts.width || 150, height: opts.width || 150,
        colorDark: '#000000', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) { console.warn('QR error', e); }
  }

  async function generateQRDataURL(text) {
    return new Promise(resolve => {
      if (typeof QRCode === 'undefined') { resolve(null); return; }
      const div = document.createElement('div');
      div.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:150px;height:150px';
      document.body.appendChild(div);
      try {
        new QRCode(div, { text, width: 150, height: 150, correctLevel: QRCode.CorrectLevel.M });
        setTimeout(() => {
          const canvas = div.querySelector('canvas');
          const img = div.querySelector('img');
          const url = canvas ? canvas.toDataURL() : (img ? img.src : null);
          document.body.removeChild(div);
          resolve(url);
        }, 120);
      } catch (e) { document.body.removeChild(div); resolve(null); }
    });
  }

  // ---- PDF LABEL GENERATION ----
  async function generateShippingLabel(shipment, size = '40x60') {
    const { jsPDF } = window.jspdf;
    let w, h;
    if (size === '30x40') { w = 30; h = 40; }
    else if (size === 'A6') { w = 105; h = 148; }
    else { w = 40; h = 60; } // 40x60 default

    const doc = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'mm', format: [w, h] });
    const margin = 3;
    let y = margin;

    // Company Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, w, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(size === 'A6' ? 9 : 6);
    doc.setFont('helvetica', 'bold');
    doc.text('ProLogis ERP', margin, 6.5);
    doc.setFontSize(size === 'A6' ? 7 : 5);
    doc.setFont('helvetica', 'normal');
    doc.text(shipment.service || 'Standard', w - margin, 6.5, { align: 'right' });
    y = 13;

    // Tracking Number
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(size === 'A6' ? 14 : 9);
    doc.setFont('helvetica', 'bold');
    doc.text(shipment.trackingNumber, w / 2, y, { align: 'center' });
    y += 5;

    // Barcode (as text fallback)
    doc.setFontSize(size === 'A6' ? 6 : 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Weight: ${shipment.weight}kg | ${shipment.length}x${shipment.width}x${shipment.height}cm`, w/2, y, { align: 'center' });
    y += 5;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, w - margin, y);
    y += 3;

    // Sender / Receiver
    const fs = size === 'A6' ? 7 : 4.5;
    doc.setFontSize(fs);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', margin, y);
    doc.text('TO:', w / 2 + 1, y);
    y += 3;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const wrapW = (w / 2) - margin - 2;

    const fromLines = doc.splitTextToSize(`${shipment.senderName}\n${shipment.senderPhone}\n${shipment.senderAddress}, ${shipment.senderCity}`, wrapW);
    const toLines = doc.splitTextToSize(`${shipment.receiverName}\n${shipment.receiverPhone}\n${shipment.receiverAddress}, ${shipment.receiverCity}`, wrapW);
    const maxLines = Math.max(fromLines.length, toLines.length);

    doc.text(fromLines, margin, y);
    doc.text(toLines, w / 2 + 1, y);
    y += maxLines * (fs * 0.4) + 4;

    // COD
    if (shipment.cod > 0) {
      doc.setFillColor(254, 243, 199);
      doc.rect(margin, y - 1, w - margin * 2, 7, 'F');
      doc.setFontSize(fs);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text(`COD: ${fmtNum(shipment.cod)} LAK`, w / 2, y + 3.5, { align: 'center' });
      y += 9;
    }

    // Footer
    doc.setFontSize(size === 'A6' ? 5 : 3.5);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Created: ${fmtDate(shipment.createdAt)} | prologists.la`, w / 2, h - 2, { align: 'center' });

    doc.save(`label-${shipment.trackingNumber}.pdf`);
    toast(`Label downloaded for ${shipment.trackingNumber}`, 'success');
  }

  async function generateBatchLabels(shipmentIds, size = '40x60') {
    for (const id of shipmentIds) {
      const s = DB.Shipments.getById(id);
      if (s) await generateShippingLabel(s, size);
    }
  }

  // ---- CLIPBOARD ----
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => toast(`Copied: ${text}`, 'success')).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast(`Copied: ${text}`, 'success');
    });
  }

  // ---- DEBOUNCE ----
  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  // ---- PAGINATION ----
  function paginate(data, page, perPage = 15) {
    const total = data.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    return { items: data.slice(start, start + perPage), total, totalPages, page, perPage };
  }

  function paginationHTML(current, total, onClickFn) {
    if (total <= 1) return '';
    let html = '<div class="pagination">';
    const prev = current > 1 ? `<div class="page-btn" onclick="${onClickFn}(${current-1})"><i class="fas fa-chevron-left"></i></div>` : '';
    const next = current < total ? `<div class="page-btn" onclick="${onClickFn}(${current+1})"><i class="fas fa-chevron-right"></i></div>` : '';
    html += prev;
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
        html += `<div class="page-btn ${i === current ? 'active' : ''}" onclick="${onClickFn}(${i})">${i}</div>`;
      } else if (i === current - 3 || i === current + 3) {
        html += `<div class="page-btn" style="pointer-events:none">…</div>`;
      }
    }
    html += next + '</div>';
    return html;
  }

  // ---- GENERATE TRACKING NUMBER ----
  function genTrackingNumber() {
    const today = new Date().toISOString().split('T')[0].replace(/-/g,'');
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `LA${today}${seq}`;
  }

  // ---- CHART HELPERS ----
  function destroyChart(id) {
    const existing = Chart.getChart(id);
    if (existing) existing.destroy();
  }

  // ---- BARCODE SCANNER (Camera) ----
  let _scanStream = null;
  let _scanActive = false;

  function openBarcodeScanner(onDetected) {
    if (!('BarcodeDetector' in window)) {
      toast('Browser ນີ້ບໍ່ຮອງຮັບກ້ອງ scan — ກະລຸນາໃຊ້ Chrome ຫຼື Edge', 'warning');
      return;
    }
    if (!document.getElementById('scannerStyle')) {
      const s = document.createElement('style');
      s.id = 'scannerStyle';
      s.textContent = '@keyframes scanLine{0%{top:8px}50%{top:calc(100% - 10px)}100%{top:8px}}';
      document.head.appendChild(s);
    }
    const overlay = document.createElement('div');
    overlay.id = 'scannerOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px';
    overlay.innerHTML = `
      <div style="color:#fff;font-size:15px;font-weight:600"><i class="fas fa-camera"></i> ສ່ອງກ້ອງໃສ່ບາໂຄດ</div>
      <div style="position:relative;width:280px;height:280px;border-radius:12px;overflow:hidden;border:2px solid #3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.3)">
        <video id="scannerVideo" style="width:100%;height:100%;object-fit:cover" autoplay muted playsinline></video>
        <div style="position:absolute;top:8px;left:8px;right:8px;height:2px;background:linear-gradient(90deg,transparent,#3b82f6,transparent);animation:scanLine 2s ease-in-out infinite"></div>
        <div style="position:absolute;top:0;left:0;width:24px;height:24px;border-top:3px solid #3b82f6;border-left:3px solid #3b82f6;border-radius:2px 0 0 0"></div>
        <div style="position:absolute;top:0;right:0;width:24px;height:24px;border-top:3px solid #3b82f6;border-right:3px solid #3b82f6;border-radius:0 2px 0 0"></div>
        <div style="position:absolute;bottom:0;left:0;width:24px;height:24px;border-bottom:3px solid #3b82f6;border-left:3px solid #3b82f6;border-radius:0 0 0 2px"></div>
        <div style="position:absolute;bottom:0;right:0;width:24px;height:24px;border-bottom:3px solid #3b82f6;border-right:3px solid #3b82f6;border-radius:0 0 2px 0"></div>
      </div>
      <div id="scanStatus" style="color:rgba(255,255,255,.7);font-size:12px">ກຳລັງກວດຈັບບາໂຄດ...</div>
      <button onclick="Utils.closeScanner()" style="background:#fff;border:none;padding:9px 28px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600"><i class="fas fa-times"></i> ປິດ</button>
    `;
    document.body.appendChild(overlay);
    _scanActive = true;

    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      .then(stream => {
        _scanStream = stream;
        const video = document.getElementById('scannerVideo');
        if (!video) { closeScanner(); return; }
        video.srcObject = stream;
        video.play();
        const detector = new BarcodeDetector({ formats: ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8', 'data_matrix'] });
        function detect() {
          if (!_scanActive) return;
          const v = document.getElementById('scannerVideo');
          if (!v || v.readyState < 2) { requestAnimationFrame(detect); return; }
          detector.detect(v).then(codes => {
            if (codes.length > 0 && _scanActive) {
              _scanActive = false;
              const val = codes[0].rawValue;
              closeScanner();
              toast('Scan ສຳເລັດ: ' + val, 'success');
              onDetected(val);
            } else { requestAnimationFrame(detect); }
          }).catch(() => requestAnimationFrame(detect));
        }
        video.addEventListener('playing', detect, { once: true });
      })
      .catch(err => {
        const st = document.getElementById('scanStatus');
        if (st) st.textContent = 'ບໍ່ສາມາດເຂົ້າເຖິງກ້ອງ: ' + err.message;
      });
  }

  function closeScanner() {
    _scanActive = false;
    if (_scanStream) { _scanStream.getTracks().forEach(t => t.stop()); _scanStream = null; }
    const overlay = document.getElementById('scannerOverlay');
    if (overlay) overlay.remove();
  }

  return { fmt, fmtNum, fmtDate, fmtDateTime, fmtRelative, fmtWeight, fmtSize, statusBadge, priorityBadge, toast, togglePwd, generateBarcode, generateBarcodeDataURL, generateQR, generateQRDataURL, generateShippingLabel, generateBatchLabels, copyToClipboard, debounce, paginate, paginationHTML, genTrackingNumber, destroyChart, openBarcodeScanner, closeScanner };
})();
