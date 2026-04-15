/* ============================================================
   UK Medical Schools Comparison Tool — app.js
   ============================================================ */

(function () {
  'use strict';

  var allData = [];
  var sortedData = [];
  var currentSort = { col: null, dir: 'asc' };

  document.addEventListener('DOMContentLoaded', function () {
    loadData();
  });

  function loadData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/medical_schools.json', true);
    xhr.responseType = 'json';
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var json = xhr.response;
        allData = (json && Array.isArray(json.schools)) ? json.schools : [];
        sortedData = allData.slice();
        renderTable(sortedData);
        setupSearch();
        setupFilters();
        setupSort();
      } else {
        showError();
      }
    };
    xhr.onerror = showError;
    xhr.send();
  }

  /* --- Render --- */
  function renderTable(data) {
    var tbody = document.getElementById('table-body');
    var countEl = document.getElementById('table-count');
    if (!tbody) return;

    if (countEl) {
      countEl.textContent = data.length + ' of ' + allData.length + ' institution' + (allData.length !== 1 ? 's' : '');
    }

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No matching institutions found.</td></tr>';
      return;
    }

    var html = '';
    data.forEach(function (school, idx) {
      var rowId = 'row-' + idx;
      var detailId = 'detail-' + idx;

      html += '<tr class="data-row" data-detail="' + detailId + '" tabindex="0" role="button" aria-expanded="false">' +
        '<td class="university-cell">' + esc(school.university) + '</td>' +
        '<td class="fees-cell">' + formatFees(school.international_fees) + '</td>' +
        '<td>' + travelBadge(school.travel_support_type) + '</td>' +
        '<td>' + ynBadge(school.flexible_leave) + '</td>' +
        '<td>' + ynBadge(school.scrubs) + '</td>' +
        '<td>' + ynBadge(school.stethoscope) + '</td>' +
        '<td>' + ynBadge(school.passmed) + '</td>' +
        '<td class="fund-cell">' + formatFunding(school.hardship_funding) + '</td>' +
        '<td class="expand-cell"><span class="expand-icon" aria-hidden="true">&#9660;</span></td>' +
        '</tr>';

      html += '<tr class="detail-row" id="' + detailId + '" aria-hidden="true">' +
        '<td colspan="9">' +
        '<div class="detail-grid">' +

        '<div class="detail-block">' +
        '<div class="detail-label">Travel support — full details</div>' +
        '<div class="detail-value">' + esc(school.travel_details) + '</div>' +
        '</div>' +

        '<div class="detail-block">' +
        '<div class="detail-label">Flexible leave — details</div>' +
        '<div class="detail-value">' + esc(school.leave_details) + '</div>' +
        '</div>' +

        '<div class="detail-block">' +
        '<div class="detail-label">Resources provided</div>' +
        '<div class="detail-value">' + resourcesList(school) + '</div>' +
        '</div>' +

        '<div class="detail-block">' +
        '<div class="detail-label">Financial support</div>' +
        '<div class="detail-value">' +
        '<div class="detail-sub"><span class="detail-sub-label">Hardship:</span> ' + esc(school.hardship_funding) + '</div>' +
        (school.research_funding && school.research_funding !== '—' ? '<div class="detail-sub"><span class="detail-sub-label">Research:</span> ' + esc(school.research_funding) + '</div>' : '') +
        (school.elective_funding_year && school.elective_funding_year !== '—' ? '<div class="detail-sub"><span class="detail-sub-label">Elective funding:</span> ' + esc(school.elective_funding_year) + '</div>' : '') +
        '</div>' +
        '</div>' +

        '</div>' +
        '</td>' +
        '</tr>';
    });

    tbody.innerHTML = html;

    /* Attach expand/collapse */
    var rows = tbody.querySelectorAll('.data-row');
    rows.forEach(function (row) {
      row.addEventListener('click', toggleDetail);
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDetail.call(row); }
      });
    });
  }

  function toggleDetail() {
    var detailId = this.getAttribute('data-detail');
    var detail = document.getElementById(detailId);
    if (!detail) return;
    var open = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', open ? 'false' : 'true');
    detail.setAttribute('aria-hidden', open ? 'true' : 'false');
    this.classList.toggle('row-expanded', !open);
  }

  /* --- Formatters --- */
  function formatFees(fees) {
    if (!fees || fees === '—' || fees === 'Not available') return '<span class="na-cell">Not available</span>';
    return '<span class="fees-value">' + esc(fees) + '</span>';
  }

  function formatFunding(v) {
    if (!v || v === '—') return '<span class="na-cell">—</span>';
    // Extract a short version (up to first parenthesis or 40 chars)
    var short = v.replace(/\(.*?\)/g, '').trim();
    if (short.length > 45) short = short.substring(0, 45) + '…';
    return '<span title="' + esc(v) + '">' + esc(short) + '</span>';
  }

  function ynBadge(v) {
    if (!v || v === '—') return '<span class="badge badge-unknown">—</span>';
    var lower = v.toLowerCase();
    if (lower === 'yes') return '<span class="badge badge-yes">Yes</span>';
    if (lower === 'no') return '<span class="badge badge-no">No</span>';
    if (lower === "don't know" || lower === "don't know") return '<span class="badge badge-unknown">Unknown</span>';
    return '<span class="badge badge-unknown">' + esc(v) + '</span>';
  }

  function travelBadge(v) {
    if (!v || v === '—' || v === 'Not specified') return '<span class="badge badge-unknown">Not specified</span>';
    if (v === 'None provided') return '<span class="badge badge-no">None provided</span>';
    if (v.indexOf('Advance') !== -1) return '<span class="badge badge-advance">' + esc(v) + '</span>';
    return '<span class="badge badge-travel">' + esc(v) + '</span>';
  }

  function resourcesList(school) {
    var items = [];
    if (school.scrubs && school.scrubs.toLowerCase() === 'yes') {
      items.push('Scrubs' + (school.scrubs_details && school.scrubs_details !== '—' ? ' (' + school.scrubs_details.substring(0,60) + ')' : ''));
    }
    if (school.stethoscope && school.stethoscope.toLowerCase() === 'yes') items.push('Stethoscope');
    if (school.passmed && school.passmed.toLowerCase() === 'yes') items.push('Passmed');
    if (school.ipads && school.ipads.toLowerCase() === 'yes') items.push('iPads');
    if (school.other_resources && school.other_resources !== '—') items.push(school.other_resources);
    return items.length ? items.map(function(i){ return '<span class="resource-tag">' + esc(i) + '</span>'; }).join(' ') : '<span class="na-cell">None reported</span>';
  }

  function esc(str) {
    if (str === null || str === undefined) return '&mdash;';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showError() {
    var tbody = document.getElementById('table-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">Data unavailable. Please try again later.</td></tr>';
  }

  /* --- Filtering --- */
  function getFiltered() {
    var q = ((document.getElementById('table-search') || {}).value || '').toLowerCase().trim();
    var leaveVal = ((document.getElementById('filter-leave') || {}).value || '');
    var scrubsVal = ((document.getElementById('filter-scrubs') || {}).value || '');
    var travelVal = ((document.getElementById('filter-travel') || {}).value || '');

    return sortedData.filter(function (s) {
      if (q && s.university.toLowerCase().indexOf(q) === -1) return false;
      if (leaveVal && (s.flexible_leave || '').toLowerCase() !== leaveVal.toLowerCase()) return false;
      if (scrubsVal && (s.scrubs || '').toLowerCase() !== scrubsVal.toLowerCase()) return false;
      if (travelVal && (s.travel_support_type || '').indexOf(travelVal) === -1) return false;
      return true;
    });
  }

  function applyFilters() { renderTable(getFiltered()); }

  function setupSearch() {
    var input = document.getElementById('table-search');
    if (input) input.addEventListener('input', applyFilters);
  }

  function setupFilters() {
    ['filter-leave', 'filter-scrubs', 'filter-travel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', applyFilters);
    });
  }

  /* --- Sorting --- */
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
        ths.forEach(function (t) { t.classList.remove('sort-asc', 'sort-desc'); });
        this.classList.add(currentSort.dir === 'asc' ? 'sort-asc' : 'sort-desc');

        sortedData = allData.slice().sort(function (a, b) {
          var va = getSortValue(a, col);
          var vb = getSortValue(b, col);
          if (currentSort.dir === 'asc') return va < vb ? -1 : va > vb ? 1 : 0;
          return va > vb ? -1 : va < vb ? 1 : 0;
        });

        renderTable(getFiltered());
      });
    });
  }

  function getSortValue(obj, col) {
    var v = obj[col];
    if (v === null || v === undefined) return '';
    return String(v).toLowerCase();
  }

})();
