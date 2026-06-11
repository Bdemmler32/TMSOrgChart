/**
 * TMS Organization Chart v0.02 — main.js
 * Loads data from staff-data.xlsx via SheetJS, renders org chart + directory.
 */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────── */
  let staffMap   = {};   // id → person obj
  let deptMap    = {};   // id → dept obj  { id, name, color }
  let allPeople  = [];   // flat list with dept info merged
  let metaObj    = {};

  let currentView  = 'org';
  let activeDept   = 'all';
  let searchQuery  = '';
  let lightboxOpen = false;

  /* ── SheetJS loader ─────────────────────────────────── */
  function loadExcel(url, callback) {
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Cannot load ' + url);
        return r.arrayBuffer();
      })
      .then(buf => {
        const wb = XLSX.read(buf, { type: 'array' });

        // Meta
        const mws = wb.Sheets['Meta'];
        if (mws) {
          XLSX.utils.sheet_to_json(mws, { header: 1 }).forEach(([k, v]) => {
            if (k) metaObj[k] = v;
          });
        }

        // Departments
        const dws = wb.Sheets['Departments'];
        if (dws) {
          XLSX.utils.sheet_to_json(dws).forEach(row => {
            deptMap[row.id] = { id: row.id, name: row.name, color: row.color };
          });
        }

        // Staff
        const sws = wb.Sheets['Staff'];
        if (sws) {
          XLSX.utils.sheet_to_json(sws).forEach(row => {
            const person = {
              id:           String(row.id || '').trim(),
              name:         String(row.name || '').trim(),
              title:        String(row.title || '').trim(),
              ext:          String(row.ext || '').trim(),
              direct:       String(row.direct || '').trim(),
              email:        String(row.email || '').trim(),
              photo:        String(row.photo || '').trim(),
              dept_id:      String(row.dept_id || '').trim(),
              role:         String(row.role || 'staff').trim(),
              reports_to:   String(row.reports_to_id || '').trim(),
              description:  String(row.description || '').trim(),
            };
            staffMap[person.id] = person;
          });
        }

        // Build flat list with dept info merged
        allPeople = Object.values(staffMap).map(p => ({
          ...p,
          deptName:  deptMap[p.dept_id]?.name  || 'Executive',
          deptColor: deptMap[p.dept_id]?.color || 'exec',
        }));

        callback();
      })
      .catch(err => {
        document.getElementById('org-view').innerHTML =
          `<div class="no-results">⚠️ Could not load staff-data.xlsx.<br><small>${err.message}</small></div>`;
        console.error(err);
      });
  }

  /* ── Helpers ─────────────────────────────────────────── */
  function photoPath(f) {
    return 'assets/headshots/' + encodeURIComponent(f);
  }

  function initials(name) {
    return name.split(' ').map(p => p[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  }

  function matchesSearch(p, q) {
    if (!q) return true;
    const lq = q.toLowerCase();
    return p.name.toLowerCase().includes(lq)
        || p.title.toLowerCase().includes(lq)
        || p.email.toLowerCase().includes(lq)
        || p.ext.includes(lq)
        || p.deptName.toLowerCase().includes(lq);
  }

  /* ── Photo element ───────────────────────────────────── */
  function makePhotoEl(person, extraClass) {
    const cls = 'staff-photo' + (extraClass ? ' ' + extraClass : '');
    if (person.photo) {
      const img = document.createElement('img');
      img.className = cls;
      img.src = photoPath(person.photo);
      img.alt = person.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = function () {
        const ph = makePlaceholder(person, extraClass);
        this.replaceWith(ph);
      };
      return img;
    }
    return makePlaceholder(person, extraClass);
  }

  function makePlaceholder(person, extraClass) {
    const ph = document.createElement('div');
    ph.className = 'staff-photo-placeholder' + (extraClass ? ' ' + extraClass : '');
    ph.textContent = initials(person.name);
    return ph;
  }

  /* ── Staff card ──────────────────────────────────────── */
  function makeCard(person, extraClass) {
    const btn = document.createElement('button');
    btn.className = 'staff-card' + (extraClass ? ' ' + extraClass : '');
    btn.setAttribute('aria-label', 'View ' + person.name);
    btn.appendChild(makePhotoEl(person));

    const info = document.createElement('div');
    info.className = 'staff-info';
    info.innerHTML =
      '<div class="staff-name">' + esc(person.name) + '</div>' +
      '<div class="staff-title">' + esc(person.title) + '</div>' +
      '<div class="staff-contact">Ext. ' + esc(person.ext) + ' · ' + esc(person.direct) + '</div>';
    btn.appendChild(info);

    // Fast click — use pointerdown + prevent duplicate
    let didFire = false;
    btn.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType !== 'touch') return;
      didFire = true;
      openModal(person);
    });
    btn.addEventListener('click', function () {
      if (didFire) { didFire = false; return; } // already fired
      openModal(person);
    });
    return btn;
  }

  /* ── Org View ─────────────────────────────────────────── */
  function renderOrgView() {
    const container = document.getElementById('org-view');
    container.innerHTML = '';

    // ─ Executive band ─
    const execPeople = allPeople.filter(p => p.dept_id === 'executive');

    // Order: executive (CEO) → deputy → exec_staff (sarah, paul)
    const roleOrder = { executive: 0, deputy: 1, exec_staff: 2 };
    execPeople.sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9));

    const band = document.createElement('div');
    band.className = 'exec-band';

    const bandHdr = document.createElement('div');
    bandHdr.className = 'exec-band-header';
    bandHdr.innerHTML = '<span class="exec-band-title">Executive</span>';
    band.appendChild(bandHdr);

    const bandBody = document.createElement('div');
    bandBody.className = 'exec-band-body';

    execPeople.forEach(p => {
      if (activeDept !== 'all' && activeDept !== 'executive') return;
      if (searchQuery && !matchesSearch(p, searchQuery)) return;
      bandBody.appendChild(makeCard(p, 'in-exec-band'));
    });

    if (activeDept !== 'all' && activeDept !== 'executive') {
      // hide band entirely
    } else {
      band.appendChild(bandBody);
      container.appendChild(band);
    }

    // ─ Dept grid ─
    const grid = document.createElement('div');
    grid.className = 'dept-grid';

    const depts = Object.values(deptMap).filter(d => d.id !== 'executive');

    depts.forEach(dept => {
      if (activeDept !== 'all' && activeDept !== dept.id) return;

      const head = allPeople.find(p => p.dept_id === dept.id && p.role === 'dept_head');
      const members = allPeople.filter(p => p.dept_id === dept.id && p.role !== 'dept_head');

      // Filter members by search
      const headMatch  = head && (!searchQuery || matchesSearch(head, searchQuery));
      const memberMatches = members.filter(p => !searchQuery || matchesSearch(p, searchQuery));

      if (searchQuery && !headMatch && memberMatches.length === 0) return;

      const block = document.createElement('div');
      block.className = 'dept-block dept-' + dept.color;

      // Header with dept name + dept head card
      const hdr = document.createElement('div');
      hdr.className = 'dept-header';

      const deptNameEl = document.createElement('div');
      deptNameEl.className = 'dept-name';
      deptNameEl.textContent = dept.name;
      hdr.appendChild(deptNameEl);

      if (head) {
        hdr.appendChild(makeCard({ ...head, deptName: dept.name }, 'dept-head-card'));
      }
      block.appendChild(hdr);

      // Members body — with sub-reporting
      const membersEl = document.createElement('div');
      membersEl.className = 'dept-members';

      // Separate managers from direct staff
      // managers: role === 'manager'
      // staff: role === 'staff', reports_to = manager or dept_head

      const managers = members.filter(p => p.role === 'manager');
      const directStaff = members.filter(p => p.role === 'staff' && (!p.reports_to || p.reports_to === (head?.id || '')));

      // For search: show manager if self matches OR any of their reports match
      managers.forEach(mgr => {
        const mgrMatch = !searchQuery || matchesSearch(mgr, searchQuery);
        const reports = members.filter(p => p.role === 'staff' && p.reports_to === mgr.id);
        const reportsMatch = reports.filter(p => !searchQuery || matchesSearch(p, searchQuery));

        if (searchQuery && !mgrMatch && reportsMatch.length === 0) return;

        const group = document.createElement('div');
        group.className = 'manager-group';

        const mgrRow = document.createElement('div');
        mgrRow.className = 'manager-row';
        mgrRow.appendChild(makeCard({ ...mgr, deptName: dept.name }));
        group.appendChild(mgrRow);

        if (reports.length > 0) {
          const indent = document.createElement('div');
          indent.className = 'reports-indent';
          const displayReports = searchQuery ? reportsMatch : reports;
          displayReports.forEach(r => {
            indent.appendChild(makeCard({ ...r, deptName: dept.name }));
          });
          group.appendChild(indent);
        }

        membersEl.appendChild(group);
      });

      // Direct staff (report to dept head, not a sub-manager)
      directStaff.forEach(p => {
        if (searchQuery && !matchesSearch(p, searchQuery)) return;
        membersEl.appendChild(makeCard({ ...p, deptName: dept.name }));
      });

      block.appendChild(membersEl);
      grid.appendChild(block);
    });

    if (grid.children.length === 0 && searchQuery) {
      grid.innerHTML = '<div class="no-results" style="grid-column:1/-1">No staff match your search.</div>';
    }

    container.appendChild(grid);
  }

  /* ── Directory View ──────────────────────────────────── */
  function renderDirectoryView() {
    const container = document.getElementById('directory-view');
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'directory-grid';

    // Role order for consistent sorting
    const roleOrder = { executive: 0, deputy: 1, exec_staff: 2, dept_head: 3, manager: 4, staff: 5 };
    const sorted = [...allPeople].sort((a, b) => {
      const rA = roleOrder[a.role] ?? 9, rB = roleOrder[b.role] ?? 9;
      if (rA !== rB) return rA - rB;
      return a.name.localeCompare(b.name);
    });

    let shown = 0;
    sorted.forEach(p => {
      if (activeDept !== 'all' && p.dept_id !== activeDept) return;
      if (searchQuery && !matchesSearch(p, searchQuery)) return;
      shown++;

      const card = document.createElement('div');
      card.className = 'dir-card dept-' + p.deptColor;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'View ' + p.name);

      card.appendChild(makePhotoEl(p));
      card.innerHTML += '<div class="staff-name">' + esc(p.name) + '</div>'
        + '<div class="staff-title">' + esc(p.title) + '</div>'
        + '<span class="dir-dept-badge">' + esc(p.deptName) + '</span>'
        + '<div class="dir-contact">'
        + '<div class="dir-contact-row">'
        + iconPhone()
        + 'Ext. ' + esc(p.ext) + ' · <a href="tel:' + esc(p.direct) + '">' + esc(p.direct) + '</a>'
        + '</div>'
        + '<div class="dir-contact-row">'
        + iconEmail()
        + '<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a>'
        + '</div></div>';

      card.addEventListener('pointerdown', () => openModal(p));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(p); });
      grid.appendChild(card);
    });

    if (shown === 0) {
      grid.innerHTML = '<div class="no-results" style="grid-column:1/-1">No staff match your search.</div>';
    }

    container.appendChild(grid);
  }

  /* ── SVG Icons ───────────────────────────────────────── */
  function iconPhone() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>';
  }
  function iconEmail() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  }
  function iconDesk() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>';
  }

  /* ── Escape helper ───────────────────────────────────── */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'modal-header';

    if (person.photo) {
      const photoWrap = document.createElement('div');
      photoWrap.className = 'modal-photo-wrap';
      photoWrap.title = 'Click to enlarge';

      const img = document.createElement('img');
      img.className = 'modal-photo';
      img.src = photoPath(person.photo);
      img.alt = person.name;
      img.onerror = function () {
        const ph = document.createElement('div');
        ph.className = 'modal-photo-placeholder';
        ph.textContent = initials(person.name);
        photoWrap.replaceWith(ph);
      };

      const hint = document.createElement('div');
      hint.className = 'modal-photo-zoom-hint';
      hint.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

      photoWrap.appendChild(img);
      photoWrap.appendChild(hint);
      photoWrap.addEventListener('click', () => openLightbox(person));
      hdr.appendChild(photoWrap);
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
      '<div class="modal-title">' + esc(person.title) + '</div>' +
      '<span class="modal-dept-badge">' + esc(person.deptName || 'Executive') + '</span>';
    hdr.appendChild(nameBlock);
    modal.appendChild(hdr);

    // Contact
    const contact = document.createElement('div');
    contact.className = 'modal-contact';
    contact.innerHTML =
      '<div class="modal-contact-row"><div class="modal-contact-icon">' + iconPhone() + '</div><div><div class="modal-contact-label">Extension</div><div class="modal-contact-value">Ext. ' + esc(person.ext) + '</div></div></div>' +
      '<div class="modal-contact-row"><div class="modal-contact-icon">' + iconPhone() + '</div><div><div class="modal-contact-label">Direct Line</div><div class="modal-contact-value"><a href="tel:' + esc(person.direct) + '">' + esc(person.direct) + '</a></div></div></div>' +
      '<div class="modal-contact-row"><div class="modal-contact-icon">' + iconEmail() + '</div><div><div class="modal-contact-label">Email</div><div class="modal-contact-value"><a href="mailto:' + esc(person.email) + '">' + esc(person.email) + '</a></div></div></div>' +
      '<div class="modal-contact-row"><div class="modal-contact-icon">' + iconDesk() + '</div><div><div class="modal-contact-label">Department</div><div class="modal-contact-value">' + esc(person.deptName) + '</div></div></div>';
    modal.appendChild(contact);

    // Description (if present)
    if (person.description && person.description.trim()) {
      const desc = document.createElement('div');
      desc.className = 'modal-description';
      desc.textContent = person.description;
      modal.appendChild(desc);
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Lightbox ─────────────────────────────────────────── */
  function openLightbox(person) {
    if (!person.photo) return;
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbName = document.getElementById('lightbox-name');
    lbImg.src = photoPath(person.photo);
    lbImg.alt = person.name;
    lbName.textContent = person.name;
    lb.classList.add('open');
    lightboxOpen = true;
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    lightboxOpen = false;
  }

  /* ── PDF Export ───────────────────────────────────────── */
  function exportPDF() {
    const prev = { view: currentView, dept: activeDept, search: searchQuery };
    currentView = 'org';
    activeDept  = 'all';
    searchQuery = '';
    document.getElementById('staff-search').value = '';
    syncViewButtons();
    syncFilters();
    render();
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        // restore
        currentView = prev.view;
        activeDept  = prev.dept;
        searchQuery = prev.search;
        document.getElementById('staff-search').value = prev.search;
        syncViewButtons();
        syncFilters();
        render();
      }, 300);
    });
  }

  /* ── Render ───────────────────────────────────────────── */
  function render() {
    const ov = document.getElementById('org-view');
    const dv = document.getElementById('directory-view');
    if (currentView === 'org') {
      ov.style.display = '';
      dv.style.display = 'none';
      renderOrgView();
    } else {
      ov.style.display = 'none';
      dv.style.display = '';
      renderDirectoryView();
    }
  }

  /* ── Filter / button sync ─────────────────────────────── */
  function buildDeptFilters() {
    const wrap = document.getElementById('dept-filters');
    wrap.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'dept-filter-btn' + (activeDept === 'all' ? ' active' : '');
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => { activeDept = 'all'; syncFilters(); render(); });
    wrap.appendChild(allBtn);

    Object.values(deptMap).forEach(dept => {
      const btn = document.createElement('button');
      btn.className = 'dept-filter-btn' + (activeDept === dept.id ? ' active' : '');
      btn.textContent = dept.name;
      btn.setAttribute('data-dept', dept.id);
      btn.addEventListener('click', () => { activeDept = dept.id; syncFilters(); render(); });
      wrap.appendChild(btn);
    });
  }

  function syncFilters() {
    document.querySelectorAll('.dept-filter-btn').forEach(btn => {
      const d = btn.getAttribute('data-dept') || 'all';
      btn.classList.toggle('active', d === activeDept);
    });
  }

  function syncViewButtons() {
    document.getElementById('btn-org-view').classList.toggle('active', currentView === 'org');
    document.getElementById('btn-dir-view').classList.toggle('active', currentView === 'directory');
  }

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    loadExcel('staff-data.xlsx', function () {
      // Meta
      const ver = metaObj.version || 'v0.02';
      document.getElementById('meta-date').textContent = 'Directory as of ' + (metaObj.directoryDate || '');
      document.querySelectorAll('.version-text').forEach(el => el.textContent = ver);

      buildDeptFilters();
      render();
    });

    // Search
    let searchTimer;
    document.getElementById('staff-search').addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { searchQuery = this.value.trim(); render(); }, 160);
    });

    // View toggles
    document.getElementById('btn-org-view').addEventListener('click', () => {
      currentView = 'org'; syncViewButtons(); render();
    });
    document.getElementById('btn-dir-view').addEventListener('click', () => {
      currentView = 'directory'; syncViewButtons(); render();
    });

    // PDF export
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

    // Modal overlay click-to-close
    document.getElementById('modal-overlay').addEventListener('pointerdown', function (e) {
      if (e.target === this) closeModal();
    });

    // Lightbox close
    document.getElementById('lightbox').addEventListener('pointerdown', function (e) {
      if (e.target === this || e.target === document.getElementById('lightbox-img') || e.target === document.getElementById('lightbox-name')) {
        closeLightbox();
      }
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (lightboxOpen) closeLightbox();
        else closeModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
