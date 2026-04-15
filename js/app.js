/* ============================================================
   UK Medical Schools Comparison Tool — app.js
   Loads data/medical_schools.json, renders the comparison
   table, and handles sorting and filtering.
   ============================================================ */

(function () {
  'use strict';

  var allData = [];
  var sortedData = [];
  var currentSort = { col: null, dir: 'asc' };

  /* --- Bootstrap --- */
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
        setupSort();
      } else {
        showError();
      }
    };

    xhr.onerror = function () {
      showError();
    };

    xhr.send();
  }

  /* --- Render --- */
  function renderTable(data) {
    var tbody = document.getElementById('table-body');
    var countEl = document.getElementById('table-count');
    if (!tbody) return;

    if (countEl) {
      countEl.textContent = data.length + ' institution' + (data.length !== 1 ? 's' : '');
    }

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No matching institutions found.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(function (school) {
      var flexBadge = getBadgeClass(school.leave_flexibility);
      var resources = formatField(school.resources_provided);
      var support = formatField(school.financial_support);

      return '<tr>' +
        '<td class="university-cell">'  + esc(school.university)          + '</td>' +
        '<td>'                          + esc(school.international_fees)   + '</td>' +
        '<td>'                          + esc(school.travel_support)       + '</td>' +
        '<td><span class="badge '       + flexBadge + '">'
                                        + esc(school.leave_flexibility)    + '</span></td>' +
        '<td>'                          + esc(resources)                   + '</td>' +
        '<td>'                          + esc(support)                     + '</td>' +
        '</tr>';
    }).join('');
  }

  function formatField(value) {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  }

  function getBadgeClass(flexibility) {
    if (!flexibility) return '';
    var v = String(flexibility).toLowerCase();
    if (v === 'high')     return 'badge-high';
    if (v === 'moderate') return 'badge-moderate';
    if (v === 'limited')  return 'badge-limited';
    return '';
  }

  function esc(str) {
    if (str === null || str === undefined) return '&mdash;';
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  function showError() {
    var tbody = document.getElementById('table-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Data unavailable. Please try again later.</td></tr>';
    }
  }

  /* --- Search / filter --- */
  function setupSearch() {
    var input = document.getElementById('table-search');
    if (!input) return;

    input.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();
      var filtered = q
        ? sortedData.filter(function (s) {
            return s.university.toLowerCase().indexOf(q) !== -1;
          })
        : sortedData.slice();
      renderTable(filtered);
    });
  }

  /* --- Sorting --- */
  function setupSort() {
    var ths = document.querySelectorAll('#comparison-table th.sortable');
    if (!ths.length) return;

    ths.forEach(function (th) {
      th.addEventListener('click', function () {
        var col = this.getAttribute('data-col');

        if (currentSort.col === col) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.col = col;
          currentSort.dir = 'asc';
        }

        /* Update header indicators */
        ths.forEach(function (t) {
          t.classList.remove('sort-asc', 'sort-desc');
        });
        this.classList.add(currentSort.dir === 'asc' ? 'sort-asc' : 'sort-desc');

        /* Sort data */
        sortedData = allData.slice().sort(function (a, b) {
          var va = getSortValue(a, col);
          var vb = getSortValue(b, col);
          if (currentSort.dir === 'asc') {
            return va < vb ? -1 : va > vb ? 1 : 0;
          } else {
            return va > vb ? -1 : va < vb ? 1 : 0;
          }
        });

        /* Re-apply search filter */
        var q = (document.getElementById('table-search') || {}).value || '';
        q = q.toLowerCase().trim();
        var filtered = q
          ? sortedData.filter(function (s) {
              return s.university.toLowerCase().indexOf(q) !== -1;
            })
          : sortedData.slice();

        renderTable(filtered);
      });
    });
  }

  function getSortValue(obj, col) {
    var v = obj[col];
    if (v === null || v === undefined) return '';
    if (Array.isArray(v)) return v.join(', ').toLowerCase();
    return String(v).toLowerCase();
  }

})();
