// Vagas Transpetro 2026 — Guia do Candidato — script compartilhado

document.addEventListener('DOMContentLoaded', function () {
  // ---- Accordion: expandir/recolher tudo ----
  var expandBtn = document.getElementById('acc-expand-all');
  var collapseBtn = document.getElementById('acc-collapse-all');
  var accs = document.querySelectorAll('details.acc');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      accs.forEach(function (d) { d.open = true; });
    });
  }
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function () {
      accs.forEach(function (d) { d.open = false; });
    });
  }

  // ---- Botão voltar ao topo ----
  var backTop = document.getElementById('back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) backTop.classList.add('show');
      else backTop.classList.remove('show');
    });
    backTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Busca/filtro no índice (lista única com todas as vagas dos 4 editais) ----
  var searchInput = document.getElementById('vaga-search');
  if (searchInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.vaga-card'));
    var emptyState = document.getElementById('empty-state');

    function applyFilter() {
      var q = searchInput.value.trim().toLowerCase();
      var anyVisible = false;
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var match = q === '' || haystack.indexOf(q) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) anyVisible = true;
      });
      if (emptyState) emptyState.style.display = anyVisible ? 'none' : 'block';
    }

    searchInput.addEventListener('input', applyFilter);

    // Link vindo da página "editais.html" (?edital=01) pré-filtra pelo edital escolhido
    var params = new URLSearchParams(window.location.search);
    var editalParam = params.get('edital');
    if (editalParam) {
      searchInput.value = 'edital ' + editalParam;
      applyFilter();
      searchInput.focus();
    }
  }

  // ---- Toggle "outras vagas do mesmo edital" ----
  var toggles = document.querySelectorAll('[data-toggle-target]');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-toggle-target'));
      if (!target) return;
      var isHidden = target.style.display === 'none' || !target.style.display;
      target.style.display = isHidden ? 'block' : 'none';
      btn.textContent = isHidden ? 'Ocultar demais ênfases/cargos ▲' : 'Ver todas as demais ênfases/cargos ▼';
    });
  });
});
