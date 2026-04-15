/* ============================================================
   UK Medical Schools Comparison Tool — app.js
   ============================================================ */
(function () {
  'use strict';

  var allData    = [];
  var sortedData = [];
  var currentSort = { col: null, dir: 'asc' };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/medical_schools.json', true);
    xhr.responseType = 'json';
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        allData = (xhr.response && Array.isArray(xhr.response.schools)) ? xhr.response.schools : [];
        sortedData = allData.slice();
        renderTable(sortedData);
        setupSearch();
        setupFilters();
        setupSort();
      } else { showError(); }
    };
    xhr.onerror = showError;
    xhr.send();
  }

  /* ── Render ──────────────────────────────────────────────── */
  function renderTable(data) {
    var tbody = document.getElementById('table-body');
    var countEl = document.getElementById('table-count');
    if (!tbody) return;

    if (countEl) countEl.textContent = data.length + ' of ' + allData.length + ' institutions';

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="loading-cell">No matching institutions found.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(function (s) {
      return '<tr>'
        + '<td class="col-uni">'      + esc(s.university)              + '</td>'
        + '<td class="col-fees">'     + fmtFees(s.international_fees)  + '</td>'
        + '<td class="col-travel">'   + travelBadge(s.travel_type)     + '</td>'
        + '<td class="col-yn">'       + ynBadge(s.flexible_leave)      + '</td>'
        + '<td class="col-yn">'       + ynBadge(s.scrubs)              + '</td>'
        + '<td class="col-yn">'       + ynBadge(s.stethoscope)         + '</td>'
        + '<td class="col-yn">'       + ynBadge(s.passmed)             + '</td>'
        + '<td class="col-yn">'       + ynBadge(s.ipads)               + '</td>'
        + '<td class="col-fund">'     + esc(s.hardship_funding || '—') + '</td>'
        + '<td class="col-elective">' + esc(s.elective_funding_year || '—') + '</td>'
        + '</tr>';
    }).join('');
  }

  /* ── Formatters ─────────────────────────────────────────── */
  function fmtFees(v) {
    if (!v || v === 'Not available' || v === 'TBA') return '<span class="muted">' + esc(v || '—') + '</span>';
    return esc(v);
  }

  function ynBadge(v) {
    if (!v || v === 'Not reported') return '<span class="badge b-nr">—</span>';
    var l = v.toLowerCase();
    if (l === 'yes')  return '<span class="badge b-yes">Yes</span>';
    if (l === 'no')   return '<span class="badge b-no">No</span>';
    if (l.indexOf("don't") !== -1) return '<span class="badge b-nr">?</span>';
    return '<span class="badge b-nr">' + esc(v) + '</span>';
  }

  function travelBadge(v) {
    if (!v || v === 'Not reported')  return '<span class="badge b-nr">Not reported</span>';
    if (v === 'No reimbursement')    return '<span class="badge b-no">No reimbursement</span>';
    if (v === 'Not applicable')      return '<span class="badge b-nr">N/A</span>';
    return '<span class="badge b-travel">' + esc(v) + '</span>';
  }

  function esc(s) {
    if (s === null || s === undefined) return '—';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showError() {
    var tb = document.getElementById('table-body');
    if (tb) tb.innerHTML = '<tr><td colspan="10" class="loading-cell">Data unavailable.</td></tr>';
  }

  /* ── Search & Filters ───────────────────────────────────── */
  function getFiltered() {
    var q  = ((document.getElementById('table-search') || {}).value || '').toLowerCase().trim();
    var fl = ((document.getElementById('f-leave')      || {}).value || '');
    var fs = ((document.getElementById('f-scrubs')     || {}).value || '');
    var ft = ((document.getElementById('f-travel')     || {}).value || '');

    return sortedData.filter(function (s) {
      if (q  && s.university.toLowerCase().indexOf(q) === -1) return false;
      if (fl && (s.flexible_leave || '').toLowerCase() !== fl.toLowerCase()) return false;
      if (fs && (s.scrubs         || '').toLowerCase() !== fs.toLowerCase()) return false;
      if (ft && (s.travel_type    || '').indexOf(ft) === -1) return false;
      return true;
    });
  }

  function applyFilters() { renderTable(getFiltered()); }

  function setupSearch() {
    var el = document.getElementById('table-search');
    if (el) el.addEventListener('input', applyFilters);
  }

  function setupFilters() {
    ['f-leave','f-scrubs','f-travel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', applyFilters);
    });
  }

  /* ── Sort ───────────────────────────────────────────────── */
  function setupSort() {
    var ths = document.querySelectorAll('#comparison-table th.sortable');
    ths.forEach(function (th) {
      th.addEventListener('click', function () {
        var col = this.getAttribute('data-col');
        if (currentSort.col === col) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.col = col;
          currentSort.dir = 'asc';
        }
        ths.forEach(function (t) { t.classList.remove('sort-asc','sort-desc'); });
        this.classList.add(currentSort.dir === 'asc' ? 'sort-asc' : 'sort-desc');

        sortedData = allData.slice().sort(function (a, b) {
          var va = String(a[col] || '').toLowerCase();
          var vb = String(b[col] || '').toLowerCase();
          return currentSort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        });
        renderTable(getFiltered());
      });
    });
  }

})();
