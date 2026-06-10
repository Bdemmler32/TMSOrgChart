/**
 * TMS Organization Chart — main.js
 * Renders the interactive org chart from data.js
 */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────── */
  let currentView = 'org';         // 'org' | 'directory'
  let activeDept = 'all';          // dept id or 'all'
  let searchQuery = '';
  let modalOpen = false;

  /* ── Helpers ────────────────────────────────────────── */
  function photoPath(filename) {
    return `assets/headshots/${encodeURIComponent(filename)}`;
  }

  function initials(name) {
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }

  function allStaff() {
    const { org } = TMS_DATA;
    const list = [];
    // executive
    list.push({ ...org.executive, dept: 'executive', deptColor: 'exec', deptName: 'Executive' });
    list.push({ ...org.deputyExecutive, dept: 'executive', deptColor: 'exec', deptName: 'Executive' });
    // exec staff
    org.executiveStaff.forEach(p => list.push({ ...p, dept: 'executive', deptColor: 'exec', deptName: 'Executive' }));
    // departments
    org.departments.forEach(dept => {
      list.push({ ...dept.head, dept: dept.id, deptColor: dept.color, deptName: dept.name });
      dept.members.forEach(p => list.push({ ...p, dept: dept.id, deptColor: dept.color, deptName: dept.name }));
    });
    return list;
  }

  function matchesSearch(person, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      person.name.toLowerCase().includes(q) ||
      person.title.toLowerCase().includes(q) ||
      (person.email && person.email.toLowerCase().includes(q)) ||
      (person.ext && person.ext.includes(q))
    );
  }

  /* ── Photo element ──────────────────────────────────── */
  function makePhoto(person, size = '') {
    if (person.photo) {
      const img = document.createElement('img');
      img.className = 'staff-photo' + (size ? ` ${size}` : '');
      img.src = photoPath(person.photo);
      img.alt = person.name;
      img.loading = 'lazy';
      img.onerror = () => {
        const ph = document.createElement('div');
        ph.className = 'staff-photo-placeholder';
        ph.textContent = initials(person.name);
        img.replaceWith(ph);
      };
      return img;
    } else {
      const ph = document.createElement('div');
      ph.className = 'staff-photo-placeholder';
      ph.textContent = initials(person.name);
      return ph;
    }
  }

  /* ── Staff Card ─────────────────────────────────────── */
  function makeStaffCard(person, style = '') {
    const card = document.createElement('button');
    card.className = `staff-card${style ? ' ' + style : ''}`;
    card.setAttribute('aria-label', `View ${person.name} profile`);

    card.appendChild(makePhoto(person));

    const info = document.createElement('div');
    info.className = 'staff-info';
    info.innerHTML = `
      <div class="staff-name">${person.name}</div>
      <div class="staff-title">${person.title}</div>
      ${style === '' ? `<div class="staff-contact-inline">Ext. ${person.ext} · ${person.direct}</div>` : ''}
    `;
    card.appendChild(info);

    card.addEventListener('click', () => openModal(person));
    return card;
  }

  /* ── Dept Head Card ─────────────────────────────────── */
  function makeDeptHeadCard(person) {
    const card = document.createElement('button');
    card.className = 'staff-card dept-head-style';
    card.setAttribute('aria-label', `View ${person.name} profile`);

    card.appendChild(makePhoto(person));

    const info = document.createElement('div');
    info.className = 'staff-info';
    info.innerHTML = `
      <div class="staff-name">${person.name}</div>
      <div class="staff-title">${person.title}</div>
    `;
    card.appendChild(info);

    card.addEventListener('click', () => openModal(person));
    return card;
  }

  /* ── Modal ──────────────────────────────────────────── */
  function openModal(person) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('modal');

    let photoEl;
    if (person.photo) {
      photoEl = document.createElement('img');
      photoEl.className = 'modal-photo';
      photoEl.src = photoPath(person.photo);
      photoEl.alt = person.name;
      photoEl.onerror = () => {
        const ph = document.createElement('div');
        ph.className = 'modal-photo-placeholder';
        ph.textContent = initials(person.name);
        photoEl.replaceWith(ph);
      };
    } else {
      photoEl = document.createElement('div');
      photoEl.className = 'modal-photo-placeholder';
      photoEl.textContent = initials(person.name);
    }

    modal.innerHTML = `
      <button class="modal-close" id="modal-close-btn" aria-label="Close">✕</button>
      <div class="modal-header" id="modal-photo-slot"></div>
      <div class="modal-contact">
        <div class="modal-contact-row">
          <div class="modal-contact-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </div>
          <div>
            <div class="modal-contact-label">Extension</div>
            <div class="modal-contact-value">Ext. ${person.ext}</div>
          </div>
        </div>
        <div class="modal-contact-row">
          <div class="modal-contact-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </div>
          <div>
            <div class="modal-contact-label">Direct Line</div>
            <div class="modal-contact-value"><a href="tel:${person.direct}">${person.direct}</a></div>
          </div>
        </div>
        <div class="modal-contact-row">
          <div class="modal-contact-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <div class="modal-contact-label">Email</div>
            <div class="modal-contact-value"><a href="mailto:${person.email}">${person.email}</a></div>
          </div>
        </div>
        ${person.deptName ? `
        <div class="modal-contact-row">
          <div class="modal-contact-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
          </div>
          <div>
            <div class="modal-contact-label">Department</div>
            <div class="modal-contact-value">${person.deptName}</div>
          </div>
        </div>` : ''}
      </div>
    `;

    const headerSlot = modal.querySelector('#modal-photo-slot');
    headerSlot.appendChild(photoEl);
    headerSlot.insertAdjacentHTML('beforeend', `
      <div class="modal-name-block">
        <div class="modal-name">${person.name}</div>
        <div class="modal-title">${person.title}</div>
        ${person.deptName ? `<span class="modal-dept-badge">${person.deptName}</span>` : ''}
      </div>
    `);

    modal.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    overlay.classList.add('open');
    modalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('open');
    modalOpen = false;
    document.body.style.overflow = '';
  }

  /* ── Org View ───────────────────────────────────────── */
  function renderOrgView() {
    const { org } = TMS_DATA;
    const container = document.getElementById('org-view');
    container.innerHTML = '';

    // Executive tier
    const execTier = document.createElement('div');
    execTier.className = 'exec-tier';

    // Exec staff (left)
    const execStaffWrap = document.createElement('div');
    execStaffWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;justify-content:center;align-items:center;';
    org.executiveStaff.forEach(p => {
      const card = makeStaffCard({ ...p, deptName: 'Executive' });
      card.style.maxWidth = '220px';
      card.style.minWidth = '180px';
      execStaffWrap.appendChild(card);
    });
    execTier.appendChild(execStaffWrap);

    // CEO
    const execWrap = document.createElement('div');
    execWrap.className = 'exec-card-wrap';
    execWrap.appendChild(makeStaffCard({ ...org.executive, deptName: 'Executive' }, 'exec-style'));
    execTier.appendChild(execWrap);

    // Deputy
    execTier.appendChild(makeStaffCard({ ...org.deputyExecutive, deptName: 'Executive' }, 'deputy-style'));

    container.appendChild(execTier);

    // Departments row
    const deptRow = document.createElement('div');
    deptRow.className = 'dept-row';

    org.departments.forEach(dept => {
      if (activeDept !== 'all' && activeDept !== dept.id) return;

      const block = document.createElement('div');
      block.className = `dept-block dept-${dept.color}`;
      block.setAttribute('data-dept', dept.id);

      // Header
      const header = document.createElement('div');
      header.className = 'dept-header';

      const deptName = document.createElement('div');
      deptName.className = 'dept-name';
      deptName.textContent = dept.name;
      header.appendChild(deptName);

      const headCard = document.createElement('div');
      headCard.className = 'dept-head-card';
      headCard.appendChild(makeDeptHeadCard({ ...dept.head, deptName: dept.name }));
      header.appendChild(headCard);
      block.appendChild(header);

      // Members
      const members = document.createElement('div');
      members.className = 'dept-members';

      const filtered = dept.members.filter(p =>
        matchesSearch({ ...p, deptName: dept.name }, searchQuery)
      );

      if (filtered.length === 0 && searchQuery) {
        // hide entire block if nothing matches
        return;
      }

      filtered.forEach(p => {
        members.appendChild(makeStaffCard({ ...p, deptName: dept.name }));
      });
      block.appendChild(members);
      deptRow.appendChild(block);
    });

    if (deptRow.children.length === 0 && searchQuery) {
      deptRow.innerHTML = '<div class="no-results">No staff match your search.</div>';
    }

    container.appendChild(deptRow);
  }

  /* ── Directory View ─────────────────────────────────── */
  function renderDirectoryView() {
    const container = document.getElementById('directory-view');
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'directory-grid';

    const staff = allStaff();
    let visible = 0;

    staff.forEach(person => {
      if (activeDept !== 'all' && person.dept !== activeDept) return;
      if (searchQuery && !matchesSearch(person, searchQuery)) return;

      visible++;
      const card = document.createElement('div');
      card.className = `dir-card dept-${person.deptColor}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `View ${person.name} profile`);

      card.appendChild(makePhoto(person));

      card.innerHTML += `
        <div class="staff-name">${person.name}</div>
        <div class="staff-title">${person.title}</div>
        <span class="dir-dept-badge">${person.deptName || 'Executive'}</span>
        <div class="dir-contact">
          <div class="dir-contact-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            Ext. ${person.ext} · <a href="tel:${person.direct}">${person.direct}</a>
          </div>
          <div class="dir-contact-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <a href="mailto:${person.email}">${person.email}</a>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openModal(person));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(person); });
      grid.appendChild(card);
    });

    if (visible === 0) {
      grid.innerHTML = '<div class="no-results" style="grid-column:1/-1">No staff match your search.</div>';
    }

    container.appendChild(grid);
  }

  /* ── Render ─────────────────────────────────────────── */
  function render() {
    const orgView = document.getElementById('org-view');
    const dirView = document.getElementById('directory-view');

    if (currentView === 'org') {
      orgView.style.display = '';
      dirView.style.display = 'none';
      renderOrgView();
    } else {
      orgView.style.display = 'none';
      dirView.style.display = '';
      renderDirectoryView();
    }
  }

  /* ── Department Filters ─────────────────────────────── */
  function buildDeptFilters() {
    const wrap = document.getElementById('dept-filters');
    wrap.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'dept-filter-btn' + (activeDept === 'all' ? ' active' : '');
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => { activeDept = 'all'; syncFilters(); render(); });
    wrap.appendChild(allBtn);

    TMS_DATA.org.departments.forEach(dept => {
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
      btn.classList.toggle('active', d === activeDept || (activeDept === 'all' && !btn.getAttribute('data-dept')));
    });
  }

  /* ── PDF Export ─────────────────────────────────────── */
  function exportPDF() {
    // Switch to org view for printing
    const wasView = currentView;
    currentView = 'org';
    activeDept = 'all';
    searchQuery = '';
    document.getElementById('staff-search').value = '';
    render();
    syncFilters();

    setTimeout(() => {
      window.print();
      // Restore previous state
      currentView = wasView;
      render();
    }, 250);
  }

  /* ── Init ───────────────────────────────────────────── */
  function init() {
    // Update meta
    const { meta } = TMS_DATA;
    document.getElementById('meta-date').textContent = `Directory as of ${meta.directoryDate}`;

    // Build dept filter buttons
    buildDeptFilters();

    // View toggle buttons
    document.getElementById('btn-org-view').addEventListener('click', () => {
      currentView = 'org';
      document.getElementById('btn-org-view').classList.add('active');
      document.getElementById('btn-dir-view').classList.remove('active');
      render();
    });

    document.getElementById('btn-dir-view').addEventListener('click', () => {
      currentView = 'directory';
      document.getElementById('btn-dir-view').classList.add('active');
      document.getElementById('btn-org-view').classList.remove('active');
      render();
    });

    // Search
    let searchTimer;
    document.getElementById('staff-search').addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = e.target.value.trim();
        render();
      }, 180);
    });

    // PDF export
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

    // Modal close on overlay click
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) closeModal();
    });

    // Keyboard close modal
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modalOpen) closeModal();
    });

    // Initial render
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
