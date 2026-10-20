/* PatilWeb File Manager — UX enhancements */
(function () {
  'use strict';

  var STORAGE_VIEW = 'pwfm_view';
  var STORAGE_FILTER = 'pwfm_filter';
  var dtFilterHooked = false;

  function qs(sel, el) { return (el || document).querySelector(sel); }
  function qsa(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }

  function getView() {
    try { return localStorage.getItem(STORAGE_VIEW) || 'list'; } catch (e) { return 'list'; }
  }
  function setView(v) {
    try { localStorage.setItem(STORAGE_VIEW, v); } catch (e) {}
  }
  function getFilter() {
    try { return localStorage.getItem(STORAGE_FILTER) || 'all'; } catch (e) { return 'all'; }
  }
  function setFilter(f) {
    try { localStorage.setItem(STORAGE_FILTER, f); } catch (e) {}
  }

  function kindMatch(kind, filter) {
    if (filter === 'all') return true;
    return kind === filter;
  }

  function applyView(mode) {
    var shell = qs('.fm-shell');
    if (!shell) return;
    shell.classList.toggle('is-grid', mode === 'grid');
    shell.classList.toggle('is-list', mode !== 'grid');
    qsa('[data-fm-view]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-fm-view') === mode);
    });
    setView(mode);
    if (mode === 'grid') buildGrid();
  }

  function buildGrid() {
    var table = qs('#main-table');
    var grid = qs('#fm-grid');
    if (!table || !grid) return;
    grid.innerHTML = '';
    qsa('tbody tr', table).forEach(function (tr) {
      if (tr.querySelector('.go-back')) return;
      var kind = tr.getAttribute('data-kind') || 'file';
      var nameEl = tr.querySelector('.filename a');
      if (!nameEl) return;
      var href = nameEl.getAttribute('href') || '#';
      var title = nameEl.textContent.trim();
      var icon = nameEl.querySelector('i');
      var iconClass = icon ? icon.className : 'fa fa-file-o';
      var cells = tr.querySelectorAll('td');
      var sizeText = '';
      var modText = '';
      if (cells.length >= 3) {
        var offset = tr.querySelector('.custom-checkbox-td') ? 1 : 0;
        sizeText = (cells[1 + offset] && cells[1 + offset].textContent || '').trim();
        modText = (cells[2 + offset] && cells[2 + offset].textContent || '').trim();
      }
      var card = document.createElement('a');
      card.className = 'fm-grid-card';
      card.href = href;
      card.setAttribute('data-kind', kind);
      card.setAttribute('data-name', title.toLowerCase());
      card.innerHTML =
        '<span class="fm-grid-icon"><i class="' + iconClass + '"></i></span>' +
        '<span class="fm-grid-name" title="' + title.replace(/"/g, '&quot;') + '">' + title + '</span>' +
        '<span class="fm-grid-meta">' + sizeText + (modText ? ' · ' + modText : '') + '</span>';
      grid.appendChild(card);
    });
    filterGridCards();
  }

  function filterGridCards() {
    var filter = getFilter();
    var input = qs('#search-addon');
    var q = ((input && input.value) || '').toLowerCase().trim();
    qsa('#fm-grid .fm-grid-card').forEach(function (card) {
      var kind = card.getAttribute('data-kind') || 'file';
      var name = card.getAttribute('data-name') || '';
      var ok = kindMatch(kind, filter) && (!q || name.indexOf(q) !== -1);
      card.style.display = ok ? '' : 'none';
    });
  }

  function applyFilter(filter) {
    setFilter(filter);
    qsa('[data-fm-filter]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-fm-filter') === filter);
    });

    // DataTables-aware filter
    if (window.jQuery && jQuery.fn.dataTable) {
      var $table = jQuery('#main-table');
      if ($table.length && jQuery.fn.dataTable.isDataTable($table)) {
        if (!dtFilterHooked) {
          jQuery.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            if (settings.nTable.id !== 'main-table') return true;
            var row = settings.aoData[dataIndex] && settings.aoData[dataIndex].nTr;
            if (!row) return true;
            if (row.querySelector && row.querySelector('.go-back')) return true;
            var kind = row.getAttribute('data-kind') || 'file';
            return kindMatch(kind, getFilter());
          });
          dtFilterHooked = true;
        }
        $table.DataTable().draw();
      } else {
        qsa('#main-table tbody tr').forEach(function (tr) {
          if (tr.querySelector('.go-back')) { tr.style.display = ''; return; }
          var kind = tr.getAttribute('data-kind') || 'file';
          tr.style.display = kindMatch(kind, filter) ? '' : 'none';
        });
      }
    } else {
      qsa('#main-table tbody tr').forEach(function (tr) {
        if (tr.querySelector('.go-back')) { tr.style.display = ''; return; }
        var kind = tr.getAttribute('data-kind') || 'file';
        tr.style.display = kindMatch(kind, filter) ? '' : 'none';
      });
    }

    filterGridCards();
  }

  function wireSearch() {
    var input = qs('#search-addon');
    if (!input) return;
    input.addEventListener('keyup', function () {
      filterGridCards();
    });
  }

  function wireCopyPath() {
    qsa('[data-fm-copy-path]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var path = btn.getAttribute('data-fm-copy-path') || '';
        if (!path) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(path).then(function () {
            flashBtn(btn, 'Copied');
          }).catch(function () {
            fallbackCopy(path, btn);
          });
        } else {
          fallbackCopy(path, btn);
        }
      });
    });
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flashBtn(btn, 'Copied'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function flashBtn(btn, label) {
    var prev = btn.getAttribute('data-label') || btn.innerHTML;
    btn.setAttribute('data-label', prev);
    btn.innerHTML = '<i class="fa fa-check"></i> ' + label;
    setTimeout(function () { btn.innerHTML = btn.getAttribute('data-label'); }, 1200);
  }

  function wireToolbar() {
    qsa('[data-fm-view]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        applyView(btn.getAttribute('data-fm-view'));
      });
    });
    qsa('[data-fm-filter]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        applyFilter(btn.getAttribute('data-fm-filter'));
      });
    });
  }

  function boot() {
    if (!qs('.fm-shell')) return;
    wireToolbar();
    wireCopyPath();
    wireSearch();

    // Wait briefly so DataTables can init first (inline script runs before neu.js? neu.js is after jquery but DT init is in inline script after neu.js)
    // neu.js is loaded BEFORE the inline DT init script. So delay apply until after ready + tick.
    function start() {
      applyFilter(getFilter());
      applyView(getView());
    }
    if (window.jQuery) {
      jQuery(function () {
        setTimeout(start, 0);
      });
    } else {
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
