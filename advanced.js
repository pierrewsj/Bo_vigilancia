(() => {
  'use strict';

  function escapeHtml(value = '') {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function ensureLightbox() {
    let dialog = document.querySelector('#media-lightbox');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'media-lightbox';
    dialog.className = 'media-lightbox';
    dialog.innerHTML = `
      <div class="media-lightbox-card">
        <div class="media-lightbox-head">
          <div><p class="eyebrow">Conferência de evidência</p><h2 id="media-lightbox-title">Imagem</h2></div>
          <button class="icon-button" id="media-lightbox-close" type="button" aria-label="Fechar visualização"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        </div>
        <div class="media-lightbox-stage" id="media-lightbox-stage"></div>
        <div class="media-lightbox-foot"><span id="media-lightbox-meta"></span><span>Use pinça ou duplo toque para ampliar no navegador.</span></div>
      </div>`;
    document.body.appendChild(dialog);
    const close = () => dialog.close();
    dialog.querySelector('#media-lightbox-close').addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    return dialog;
  }

  function showImageLightbox(file = {}) {
    if (!file?.dataUrl && !file?.driveUrl) return false;
    const dialog = ensureLightbox();
    dialog.querySelector('#media-lightbox-title').textContent = file.name || 'Evidência';
    dialog.querySelector('#media-lightbox-meta').textContent = file.size ? `${Math.max(1, Math.round(Number(file.size) / 1024))} KB` : '';
    const stage = dialog.querySelector('#media-lightbox-stage');
    if (String(file.type || '').startsWith('image/') && file.dataUrl) {
      stage.innerHTML = `<img src="${file.dataUrl}" alt="${escapeHtml(file.name || 'Evidência')}">`;
    } else if (file.driveUrl) {
      stage.innerHTML = `<div class="media-document-placeholder"><strong>${escapeHtml(file.name || 'Documento')}</strong><a class="button primary" href="${escapeHtml(file.driveUrl)}" target="_blank" rel="noopener">Abrir documento</a></div>`;
    } else {
      stage.innerHTML = '<div class="media-document-placeholder"><strong>Prévia indisponível</strong><span>Este formato não possui visualização local.</span></div>';
    }
    dialog.showModal();
    return true;
  }

  // QR Code Model 2, byte mode, ECC L, versões 1 a 5. O conteúdo do QR é apenas o link/identificador do BO.
  const QR_SPECS = {
    1: { data: 19, ec: 7, align: [] },
    2: { data: 34, ec: 10, align: [6, 18] },
    3: { data: 55, ec: 15, align: [6, 22] },
    4: { data: 80, ec: 20, align: [6, 26] },
    5: { data: 108, ec: 26, align: [6, 30] }
  };

  const GF_EXP = new Uint8Array(512);
  const GF_LOG = new Uint8Array(256);
  (() => {
    let x = 1;
    for (let i = 0; i < 255; i += 1) {
      GF_EXP[i] = x;
      GF_LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i += 1) GF_EXP[i] = GF_EXP[i - 255];
  })();

  function gfMul(a, b) {
    if (!a || !b) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
  }

  function rsGenerator(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i += 1) {
      const root = GF_EXP[i];
      const next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j += 1) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], root);
      }
      poly = next;
    }
    return poly;
  }

  function rsRemainder(data, degree) {
    const gen = rsGenerator(degree);
    const rem = new Array(degree).fill(0);
    for (const byte of data) {
      const factor = byte ^ rem[0];
      rem.shift();
      rem.push(0);
      for (let i = 0; i < degree; i += 1) rem[i] ^= gfMul(gen[i + 1], factor);
    }
    return rem;
  }

  function pushBits(bits, value, length) {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
  }

  function chooseVersion(byteLength) {
    for (let version = 1; version <= 5; version += 1) {
      const capacityBits = QR_SPECS[version].data * 8;
      const neededBits = 4 + 8 + byteLength * 8;
      if (neededBits <= capacityBits) return version;
    }
    throw new Error('Conteúdo longo demais para o QR local. Use um endereço mais curto.');
  }

  function dataCodewords(text, version) {
    const bytes = [...new TextEncoder().encode(text)];
    const spec = QR_SPECS[version];
    const bits = [];
    pushBits(bits, 0b0100, 4);
    pushBits(bits, bytes.length, 8);
    bytes.forEach(byte => pushBits(bits, byte, 8));
    const cap = spec.data * 8;
    for (let i = 0; i < Math.min(4, cap - bits.length); i += 1) bits.push(0);
    while (bits.length % 8) bits.push(0);
    const out = [];
    for (let i = 0; i < bits.length; i += 8) {
      let value = 0;
      for (let j = 0; j < 8; j += 1) value = (value << 1) | bits[i + j];
      out.push(value);
    }
    let toggle = true;
    while (out.length < spec.data) {
      out.push(toggle ? 0xec : 0x11);
      toggle = !toggle;
    }
    return out;
  }

  function makeBaseMatrix(version) {
    const size = 21 + (version - 1) * 4;
    const modules = Array.from({ length: size }, () => Array(size).fill(false));
    const reserved = Array.from({ length: size }, () => Array(size).fill(false));
    const setFunction = (x, y, dark) => {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      modules[y][x] = Boolean(dark);
      reserved[y][x] = true;
    };

    const drawFinder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy += 1) {
        for (let dx = -4; dx <= 4; dx += 1) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFunction(cx + dx, cy + dy, dist !== 2 && dist !== 4);
        }
      }
    };
    drawFinder(3, 3);
    drawFinder(size - 4, 3);
    drawFinder(3, size - 4);

    for (let i = 8; i < size - 8; i += 1) {
      setFunction(6, i, i % 2 === 0);
      setFunction(i, 6, i % 2 === 0);
    }

    const positions = QR_SPECS[version].align;
    if (positions.length) {
      positions.forEach((cy, iy) => positions.forEach((cx, ix) => {
        const overlapsFinder = (ix === 0 && iy === 0) || (ix === positions.length - 1 && iy === 0) || (ix === 0 && iy === positions.length - 1);
        if (overlapsFinder) return;
        for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) {
          setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }));
    }

    // Reserva das duas cópias dos bits de formato.
    for (let i = 0; i <= 5; i += 1) setFunction(8, i, false);
    setFunction(8, 7, false);
    setFunction(8, 8, false);
    setFunction(7, 8, false);
    for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, false);
    for (let i = 0; i < 8; i += 1) setFunction(size - 1 - i, 8, false);
    for (let i = 8; i < 15; i += 1) setFunction(8, size - 15 + i, false);
    setFunction(8, size - 8, true);

    return { size, modules, reserved, setFunction };
  }

  function formatBits(mask) {
    const data = (0b01 << 3) | mask; // ECC L = 01
    let rem = data << 10;
    const generator = 0x537;
    for (let i = 14; i >= 10; i -= 1) if ((rem >>> i) & 1) rem ^= generator << (i - 10);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function maskBit(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5: return ((x * y) % 2 + (x * y) % 3) === 0;
      case 6: return (((x * y) % 2 + (x * y) % 3) % 2) === 0;
      default: return (((x + y) % 2 + (x * y) % 3) % 2) === 0;
    }
  }

  function drawFormat(matrix, mask) {
    const bits = formatBits(mask);
    const bit = i => ((bits >>> i) & 1) !== 0;
    const { size, setFunction } = matrix;
    for (let i = 0; i <= 5; i += 1) setFunction(8, i, bit(i));
    setFunction(8, 7, bit(6));
    setFunction(8, 8, bit(7));
    setFunction(7, 8, bit(8));
    for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i += 1) setFunction(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i += 1) setFunction(8, size - 15 + i, bit(i));
    setFunction(8, size - 8, true);
  }

  function qrMatrix(text) {
    const bytes = new TextEncoder().encode(text);
    const version = chooseVersion(bytes.length);
    const data = dataCodewords(text, version);
    const spec = QR_SPECS[version];
    const all = data.concat(rsRemainder(data, spec.ec));
    const bits = [];
    all.forEach(byte => pushBits(bits, byte, 8));
    const matrix = makeBaseMatrix(version);
    const { size, modules, reserved } = matrix;
    const mask = 0;
    let bitIndex = 0;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right -= 1;
      for (let vert = 0; vert < size; vert += 1) {
        const y = upward ? size - 1 - vert : vert;
        for (let j = 0; j < 2; j += 1) {
          const x = right - j;
          if (reserved[y][x]) continue;
          const raw = bitIndex < bits.length ? bits[bitIndex] : 0;
          bitIndex += 1;
          modules[y][x] = Boolean(raw ^ (maskBit(mask, x, y) ? 1 : 0));
        }
      }
      upward = !upward;
    }
    drawFormat(matrix, mask);
    return modules;
  }

  function qrSvg(text, scale = 7, border = 4) {
    const matrix = qrMatrix(text);
    const n = matrix.length;
    const dim = (n + border * 2) * scale;
    const cells = [];
    for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) {
      if (matrix[y][x]) cells.push(`M${(x + border) * scale},${(y + border) * scale}h${scale}v${scale}h-${scale}z`);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${dim}" height="${dim}" role="img" aria-label="QR Code"><rect width="100%" height="100%" fill="#fff"/><path d="${cells.join('')}" fill="#000"/></svg>`;
  }

  function ensureQrDialog() {
    let dialog = document.querySelector('#bo-qr-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'bo-qr-dialog';
    dialog.className = 'bo-qr-dialog';
    dialog.innerHTML = `
      <div class="bo-qr-card">
        <div class="bo-qr-head"><div><p class="eyebrow">Identificação rápida</p><h2 id="bo-qr-title">QR do boletim</h2></div><button class="icon-button" id="bo-qr-close" type="button" aria-label="Fechar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
        <div id="bo-qr-image" class="bo-qr-image"></div>
        <p id="bo-qr-caption" class="bo-qr-caption"></p>
        <div class="bo-qr-actions"><button id="bo-qr-share" class="button primary" type="button">Compartilhar identificação</button><button id="bo-qr-copy" class="button secondary" type="button">Copiar link</button></div>
      </div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('#bo-qr-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => { event.preventDefault(); dialog.close(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    return dialog;
  }

  async function shareText(title, text, url = '') {
    if (navigator.share) {
      try { await navigator.share({ title, text, url: url || undefined }); return true; }
      catch (error) { if (error?.name === 'AbortError') return false; }
    }
    const combined = [text, url].filter(Boolean).join('\n');
    await navigator.clipboard?.writeText?.(combined);
    return true;
  }

  function buildRecordDeepLink(record) {
    const number = String(record?.numero || '').trim();
    const url = new URL(location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('bo', number || record?.id || '');
    return url.toString();
  }

  function showQr(record = {}) {
    const dialog = ensureQrDialog();
    const label = String(record.numero || 'Boletim');
    const link = buildRecordDeepLink(record);
    dialog.querySelector('#bo-qr-title').textContent = `QR • ${label}`;
    dialog.querySelector('#bo-qr-caption').textContent = 'O QR contém apenas o endereço do aplicativo e o número/identificador do BO; não inclui relato ou dados pessoais.';
    try {
      dialog.querySelector('#bo-qr-image').innerHTML = qrSvg(link);
    } catch (error) {
      dialog.querySelector('#bo-qr-image').innerHTML = `<div class="notice warning">${escapeHtml(error.message)}</div>`;
    }
    dialog.querySelector('#bo-qr-copy').onclick = async () => {
      await navigator.clipboard?.writeText?.(link);
      window.dispatchEvent(new CustomEvent('bo-advanced-toast', { detail: 'Link do BO copiado.' }));
    };
    dialog.querySelector('#bo-qr-share').onclick = () => shareText(`BO ${label}`, `Abrir ${label} no BO Digital GSP`, link);
    dialog.showModal();
    return true;
  }

  window.BO_ADVANCED = { showImageLightbox, showQr, shareText, buildRecordDeepLink, qrMatrix, qrSvg };
})();
