/**
 * TMS Organization Chart v0.09 — main.js
 */
(function () {
  'use strict';

  let staffMap  = {};
  let deptMap   = {};
  let allPeople = [];
  let metaObj   = {};

  let currentView = 'org';
  let searchQuery = '';
  let lightboxOpen = false;

  /* ── Excel loader ───────────────────────────────────── */
  function loadExcel(url, callback) {
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('Cannot load ' + url); return r.arrayBuffer(); })
      .then(buf => {
        const wb = XLSX.read(buf, { type: 'array' });

        const mws = wb.Sheets['Meta'];
        if (mws) XLSX.utils.sheet_to_json(mws, { header: 1 }).forEach(([k, v]) => { if (k) metaObj[k] = v; });

        const dws = wb.Sheets['Departments'];
        if (dws) XLSX.utils.sheet_to_json(dws).forEach(r => { deptMap[r.id] = { id: r.id, name: r.name, color: r.color }; });

        const sws = wb.Sheets['Staff'];
        if (sws) {
          XLSX.utils.sheet_to_json(sws).forEach(r => {
            const p = {
              id:          s(r.id),
              name:        s(r.name),
              title:       s(r.title),
              ext:         s(r.ext),
              direct:      s(r.direct),
              email:       s(r.email),
              photo:       s(r.photo),
              dept_id:     s(r.dept_id),
              role:        s(r.role) || 'staff',
              reports_to:  s(r.reports_to_id),
              description: s(r.description),
            };
            staffMap[p.id] = p;
          });
        }

        allPeople = Object.values(staffMap).map(p => ({
          ...p,
          deptName:  deptMap[p.dept_id]?.name  || 'Executive',
          deptColor: deptMap[p.dept_id]?.color || 'exec',
        }));

        callback();
      })
      .catch(err => {
        document.getElementById('org-view').innerHTML =
          '<div class="no-results">⚠️ Could not load staff-data.xlsx.<br><small>' + err.message + '</small></div>';
        console.error(err);
      });
  }

  function s(v) { return String(v == null ? '' : v).trim(); }

  /* ── Helpers ─────────────────────────────────────────── */
  function photoPath(f) { return 'assets/headshots/' + encodeURIComponent(f); }

  function initials(name) {
    return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  }

  function matchSearch(p) {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q)
        || p.title.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || p.ext.includes(q)
        || p.deptName.toLowerCase().includes(q);
  }

  function esc(v) {
    return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Photo element (uses <img> properly) ─────────────── */
  function makePhoto(person, cls) {
    if (person.photo) {
      const img = document.createElement('img');
      img.className = cls || 'staff-photo';
      img.src = photoPath(person.photo);
      img.alt = person.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = function () { this.replaceWith(makePlaceholder(person, cls)); };
      return img;
    }
    return makePlaceholder(person, cls);
  }

  function makePlaceholder(person, cls) {
    const el = document.createElement('div');
    el.className = cls || 'staff-photo-placeholder';
    el.textContent = initials(person.name);
    return el;
  }

  /* ── Staff card ──────────────────────────────────────── */
  function makeCard(person, extraClass) {
    const btn = document.createElement('button');
    btn.className = 'staff-card' + (extraClass ? ' ' + extraClass : '');
    btn.setAttribute('aria-label', 'View ' + person.name);

    btn.appendChild(makePhoto(person));

    const info = document.createElement('div');
    info.className = 'staff-info';
    info.innerHTML =
      '<div class="staff-name">' + esc(person.name) + '</div>' +
      '<div class="staff-title">' + esc(person.title) + '</div>' +
      '<div class="staff-contact">Ext. ' + esc(person.ext) + ' · ' + esc(person.direct) + '</div>';
    btn.appendChild(info);

    btn.addEventListener('pointerdown', function(e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      openModal(person);
    });
    return btn;
  }

  /* ── Org view ─────────────────────────────────────────── */
  function renderOrgView() {
    const container = document.getElementById('org-view');
    container.innerHTML = '';

    /* ─ Executive block — same structure as dept blocks ─ */
    const ceo       = allPeople.find(p => p.dept_id === 'executive' && p.role === 'executive');
    const execStaff = allPeople
      .filter(p => p.dept_id === 'executive' && p.role !== 'executive')
      .sort((a, b) => {
        const order = { deputy: 0, exec_staff: 1 };
        return (order[a.role] ?? 9) - (order[b.role] ?? 9);
      });

    const execVisible = [ceo, ...execStaff].filter(p => p && matchSearch({ ...p, deptName: 'Executive' }));

    if (execVisible.length > 0) {
      const execRow = document.createElement('div');
      execRow.className = 'exec-row';

      const execBlock = document.createElement('div');
      execBlock.className = 'dept-block dept-exec exec-block';

      /* Header — TMS red, Trudi as dept head */
      const execHdr = document.createElement('div');
      execHdr.className = 'dept-header';

      const execNameEl = document.createElement('div');
      execNameEl.className = 'dept-name';
      execNameEl.textContent = 'Executive';
      execHdr.appendChild(execNameEl);

      if (ceo && matchSearch({ ...ceo, deptName: 'Executive' })) {
        const wrap = document.createElement('div');
        wrap.className = 'dept-head-wrap';
        wrap.appendChild(makeCard({ ...ceo, deptName: 'Executive' }, 'dept-head-card ceo-head-card'));
        execHdr.appendChild(wrap);
      }
      execBlock.appendChild(execHdr);

      /* Members body */
      const execMembers = document.createElement('div');
      execMembers.className = 'dept-members';
      execStaff.forEach(p => {
        if (!matchSearch({ ...p, deptName: 'Executive' })) return;
        execMembers.appendChild(makeCard({ ...p, deptName: 'Executive' }));
      });
      execBlock.appendChild(execMembers);

      execRow.appendChild(execBlock);
      container.appendChild(execRow);
    }

    /* ─ Dept grid ─ */
    const grid = document.createElement('div');
    grid.className = 'dept-grid';

    const depts = Object.values(deptMap).filter(d => d.id !== 'executive');
    let visibleDepts = 0;

    depts.forEach(dept => {
      const head = allPeople.find(p => p.dept_id === dept.id && p.role === 'dept_head');
      const members = allPeople.filter(p => p.dept_id === dept.id && p.role !== 'dept_head');

      const headMatch = head && matchSearch({ ...head, deptName: dept.name });
      const memberMatches = members.filter(p => matchSearch({ ...p, deptName: dept.name }));

      if (searchQuery && !headMatch && memberMatches.length === 0) return;
      visibleDepts++;

      const block = document.createElement('div');
      block.className = 'dept-block dept-' + dept.color;

      /* Dept header */
      const hdr = document.createElement('div');
      hdr.className = 'dept-header';

      const nameEl = document.createElement('div');
      nameEl.className = 'dept-name';
      nameEl.textContent = dept.name;
      hdr.appendChild(nameEl);

      if (head) {
        const wrap = document.createElement('div');
        wrap.className = 'dept-head-wrap';
        wrap.appendChild(makeCard({ ...head, deptName: dept.name }, 'dept-head-card'));
        hdr.appendChild(wrap);
      }
      block.appendChild(hdr);

      /* Members */
      const membersEl = document.createElement('div');
      membersEl.className = 'dept-members';

      const managers = members.filter(p => p.role === 'manager');
      const managerIds = new Set(managers.map(m => m.id));
      // directStaff: reports to dept head, or reports_to is blank, or reports_to target isn't a known manager
      const directStaff = members.filter(p =>
        p.role === 'staff' && (!p.reports_to || p.reports_to === (head?.id || '') || !managerIds.has(p.reports_to))
      );
      // Track which staff are claimed by a manager group so we don't double-render
      const claimedIds = new Set();

      managers.forEach(mgr => {
        const mgrP = { ...mgr, deptName: dept.name };
        const mgrMatch = matchSearch(mgrP);
        const reports = members.filter(p => p.role === 'staff' && p.reports_to === mgr.id);
        const reportsVisible = reports.filter(p => matchSearch({ ...p, deptName: dept.name }));

        if (searchQuery && !mgrMatch && reportsVisible.length === 0) return;

        reports.forEach(r => claimedIds.add(r.id));

        const group = document.createElement('div');
        group.className = 'manager-group';
        group.appendChild(makeCard(mgrP));

        const displayReports = searchQuery ? reportsVisible : reports;
        if (displayReports.length > 0) {
          const indent = document.createElement('div');
          indent.className = 'reports-indent';
          displayReports.forEach(r => indent.appendChild(makeCard({ ...r, deptName: dept.name })));
          group.appendChild(indent);
        }

        membersEl.appendChild(group);
      });

      directStaff.forEach(p => {
        if (claimedIds.has(p.id)) return; // already rendered under a manager
        if (searchQuery && !matchSearch({ ...p, deptName: dept.name })) return;
        membersEl.appendChild(makeCard({ ...p, deptName: dept.name }));
      });

      block.appendChild(membersEl);
      grid.appendChild(block);
    });

    if (visibleDepts === 0 && searchQuery) {
      grid.innerHTML = '<div class="no-results" style="grid-column:1/-1">No staff match your search.</div>';
    }
    container.appendChild(grid);
  }

  /* ── Directory view ───────────────────────────────────── */
  function renderDirectoryView() {
    const container = document.getElementById('directory-view');
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'directory-grid';

    const roleOrder = { executive: 0, deputy: 1, exec_staff: 2, dept_head: 3, manager: 4, staff: 5 };
    const sorted = [...allPeople].sort((a, b) => {
      const d = (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9);
      return d !== 0 ? d : a.name.localeCompare(b.name);
    });

    let shown = 0;
    sorted.forEach(p => {
      if (!matchSearch(p)) return;
      shown++;

      const card = document.createElement('div');
      card.className = 'dir-card dept-' + p.deptColor;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'View ' + p.name);

      /* Build card children with DOM — no innerHTML += after appendChild */
      card.appendChild(makePhoto(p, p.photo ? 'dir-photo' : 'dir-photo-placeholder'));

      const nameEl = document.createElement('div');
      nameEl.className = 'dir-name';
      nameEl.textContent = p.name;
      card.appendChild(nameEl);

      const titleEl = document.createElement('div');
      titleEl.className = 'dir-title';
      titleEl.textContent = p.title;
      card.appendChild(titleEl);

      const badge = document.createElement('span');
      badge.className = 'dir-dept-badge';
      badge.textContent = p.deptName;
      card.appendChild(badge);

      const contact = document.createElement('div');
      contact.className = 'dir-contact';
      contact.innerHTML =
        '<div class="dir-contact-row">' + icoPhone() +
        '<span>Ext. ' + esc(p.ext) + ' · <a href="tel:' + esc(p.direct) + '">' + esc(p.direct) + '</a></span></div>' +
        '<div class="dir-contact-row">' + icoEmail() +
        '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></div>';
      card.appendChild(contact);

      card.addEventListener('pointerdown', () => openModal(p));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(p); });
      grid.appendChild(card);
    });

    if (shown === 0) {
      grid.innerHTML = '<div class="no-results" style="grid-column:1/-1">No staff match your search.</div>';
    }
    container.appendChild(grid);
  }

  /* ── SVG icons ───────────────────────────────────────── */
  function icoPhone() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>';
  }
  function icoEmail() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  }
  function icoDesk() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>';
  }

  /* ── Modal ───────────────────────────────────────────── */
  function openModal(person) {
    const overlay = document.getElementById('modal-overlay');
    const modal   = document.getElementById('modal');
    modal.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', closeModal);
    modal.appendChild(closeBtn);

    const hdr = document.createElement('div');
    hdr.className = 'modal-header';

    if (person.photo) {
      const wrap = document.createElement('div');
      wrap.className = 'modal-photo-wrap';
      wrap.title = 'Click to enlarge';

      const img = document.createElement('img');
      img.className = 'modal-photo';
      img.src = photoPath(person.photo);
      img.alt = person.name;
      img.onerror = function () {
        const ph = document.createElement('div');
        ph.className = 'modal-photo-placeholder';
        ph.textContent = initials(person.name);
        wrap.replaceWith(ph);
      };

      const hint = document.createElement('div');
      hint.className = 'modal-photo-zoom-hint';
      hint.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

      wrap.appendChild(img);
      wrap.appendChild(hint);
      wrap.addEventListener('click', () => openLightbox(person));
      hdr.appendChild(wrap);
    } else {
      const ph = document.createElement('div');
      ph.className = 'modal-photo-placeholder';
      ph.textContent = initials(person.name);
      hdr.appendChild(ph);
    }

    const nameBlock = document.createElement('div');
    nameBlock.className = 'modal-name-block';
    nameBlock.innerHTML =
      '<div class="modal-name">' + esc(person.name) + '</div>' +
      '<div class="modal-title-text">' + esc(person.title) + '</div>' +
      '<span class="modal-dept-badge">' + esc(person.deptName || 'Executive') + '</span>';
    hdr.appendChild(nameBlock);
    modal.appendChild(hdr);

    const contact = document.createElement('div');
    contact.className = 'modal-contact';
    contact.innerHTML =
      row(icoPhone(), 'Extension', 'Ext. ' + esc(person.ext)) +
      row(icoPhone(), 'Direct Line', '<a href="tel:' + esc(person.direct) + '">' + esc(person.direct) + '</a>') +
      row(icoEmail(), 'Email', '<a href="mailto:' + esc(person.email) + '">' + esc(person.email) + '</a>');
    modal.appendChild(contact);

    if (person.description && person.description.trim()) {
      const desc = document.createElement('div');
      desc.className = 'modal-description';
      desc.textContent = person.description;
      modal.appendChild(desc);
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function row(icon, label, value) {
    return '<div class="modal-contact-row"><div class="modal-contact-icon">' + icon + '</div>' +
           '<div><div class="modal-contact-label">' + label + '</div>' +
           '<div class="modal-contact-value">' + value + '</div></div></div>';
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Lightbox ─────────────────────────────────────────── */
  function openLightbox(person) {
    if (!person.photo) return;
    document.getElementById('lightbox-img').src  = photoPath(person.photo);
    document.getElementById('lightbox-img').alt  = person.name;
    document.getElementById('lightbox-name').textContent = person.name;
    document.getElementById('lightbox').classList.add('open');
    lightboxOpen = true;
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    lightboxOpen = false;
  }

  /* ── PDF export ───────────────────────────────────────── */
  function exportPDF() {
    const prev = { view: currentView, search: searchQuery };
    currentView = 'org'; searchQuery = '';
    document.getElementById('staff-search').value = '';
    syncViewBtns(); render();
    requestAnimationFrame(() => setTimeout(() => {
      window.print();
      currentView = prev.view; searchQuery = prev.search;
      document.getElementById('staff-search').value = prev.search;
      syncViewBtns(); render();
    }, 350));
  }

  /* ── Render ───────────────────────────────────────────── */
  function render() {
    const ov = document.getElementById('org-view');
    const dv = document.getElementById('directory-view');
    if (currentView === 'org') {
      ov.style.display = ''; dv.style.display = 'none'; renderOrgView();
    } else {
      ov.style.display = 'none'; dv.style.display = ''; renderDirectoryView();
    }
  }

  function syncViewBtns() {
    document.getElementById('btn-org-view').classList.toggle('active', currentView === 'org');
    document.getElementById('btn-dir-view').classList.toggle('active', currentView === 'directory');
  }

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    loadExcel('staff-data.xlsx', function () {
      const ver = metaObj.version || 'v0.09';
      const dateStr = 'Directory as of ' + (metaObj.directoryDate || '');
      document.getElementById('meta-date').textContent = dateStr;
      document.querySelectorAll('.version-text').forEach(el => el.textContent = ver);
      render();
    });

    let searchTimer;
    document.getElementById('staff-search').addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { searchQuery = this.value.trim(); render(); }, 160);
    });

    document.getElementById('btn-org-view').addEventListener('click', () => {
      currentView = 'org'; syncViewBtns(); render();
    });
    document.getElementById('btn-dir-view').addEventListener('click', () => {
      currentView = 'directory'; syncViewBtns(); render();
    });

    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

    document.getElementById('modal-overlay').addEventListener('pointerdown', function (e) {
      if (e.target === this) closeModal();
    });

    document.getElementById('lightbox').addEventListener('pointerdown', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { lightboxOpen ? closeLightbox() : closeModal(); }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
