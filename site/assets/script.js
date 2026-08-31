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

  // ---- Teste em tela cheia (estilo Duolingo) nas páginas de tópico ----
  var quizOverlay = document.querySelector('.quiz-overlay');
  var quizStartBtn = document.querySelector('.quiz-start-btn');
  if (quizOverlay && quizStartBtn) {
    var slides = Array.prototype.slice.call(quizOverlay.querySelectorAll('.quiz-slide'));
    var questionSlides = slides.filter(function (s) { return !s.classList.contains('quiz-result-slide'); });
    var resultSlide = quizOverlay.querySelector('.quiz-result-slide');
    var total = questionSlides.length;
    var progressFill = quizOverlay.querySelector('.quiz-progress-fill');
    var footerRow = quizOverlay.querySelector('.quiz-footer-row');
    var footerBtn = quizOverlay.querySelector('.quiz-footer-btn');
    var footerFeedback = quizOverlay.querySelector('.quiz-footer-feedback');
    var closeBtn = quizOverlay.querySelector('.quiz-close-btn');
    var closeSecondaryBtn = quizOverlay.querySelector('.quiz-close-secondary-btn');
    var restartBtn = quizOverlay.querySelector('.quiz-restart-btn');

    var current = 0;       // índice da questão ativa
    var checked = false;   // já clicou em "Verificar" na questão atual?
    var selectedValue = null;
    var streak = 0;        // quantos níveis seguidos acertou, começando do Básico
    var lastCorrect = false;
    var NIVEL_LABELS = ['Básico', 'Médio', 'Avançado'];

    function showSlide(index) {
      slides.forEach(function (s) { s.classList.remove('active'); s.hidden = true; });
      var slide = questionSlides[index];
      slide.hidden = false;
      slide.classList.add('active');
      footerRow.style.display = '';
      progressFill.style.width = (index / total * 100) + '%';
    }

    function levelResultMessage() {
      if (streak >= total) {
        return {
          icon: '🏆', title: 'Excelente — nível avançado dominado!',
          text: 'Você acertou as ' + total + ' questões, do nível Básico ao Avançado. Mandou muito bem!'
        };
      }
      if (streak === 0) {
        return {
          icon: '📘', title: 'Vamos reforçar a base primeiro',
          text: 'Essa questão de nível Básico ainda não saiu como esperado. Releia as seções "O que é" e ' +
                '"Como funciona" desta página antes de tentar de novo.'
        };
      }
      var nivelAlcancado = NIVEL_LABELS[streak - 1] || NIVEL_LABELS[0];
      var proximoNivel = NIVEL_LABELS[streak] || '';
      return {
        icon: '👍', title: 'Você chegou ao nível ' + nivelAlcancado + '!',
        text: 'Continue praticando o nível ' + proximoNivel + ' para dominar este tópico por completo.'
      };
    }

    function finishQuiz() {
      slides.forEach(function (s) { s.classList.remove('active'); s.hidden = true; });
      var msg = levelResultMessage();
      resultSlide.hidden = false;
      resultSlide.classList.add('active');
      resultSlide.querySelector('.quiz-result-icon').textContent = msg.icon;
      resultSlide.querySelector('.quiz-result-title').textContent = msg.title;
      resultSlide.querySelector('.quiz-result-text').textContent = msg.text;
      progressFill.style.width = '100%';
      footerRow.style.display = 'none';
    }

    function resetQuestionUI(slide) {
      checked = false;
      selectedValue = null;
      var opts = slide.querySelectorAll('.quiz-opt-btn');
      opts.forEach(function (o) {
        o.classList.remove('selected', 'opt-correct', 'opt-wrong', 'opt-disabled');
      });
      var explic = slide.querySelector('.quiz-slide-explicacao');
      if (explic) explic.hidden = true;
      footerFeedback.hidden = true;
      footerFeedback.className = 'quiz-footer-feedback';
      footerBtn.textContent = 'Verificar';
      footerBtn.classList.remove('is-wrong');
      footerBtn.disabled = true;
    }

    function openQuiz() {
      current = 0;
      streak = 0;
      lastCorrect = false;
      questionSlides.forEach(resetQuestionUI);
      showSlide(current);
      quizOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeQuiz() {
      quizOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    quizStartBtn.addEventListener('click', openQuiz);
    closeBtn.addEventListener('click', closeQuiz);
    if (closeSecondaryBtn) closeSecondaryBtn.addEventListener('click', closeQuiz);
    if (restartBtn) restartBtn.addEventListener('click', openQuiz);

    questionSlides.forEach(function (slide) {
      var optBtns = slide.querySelectorAll('.quiz-opt-btn');
      optBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (checked) return; // já verificado, trava seleção
          optBtns.forEach(function (o) { o.classList.remove('selected'); });
          btn.classList.add('selected');
          selectedValue = btn.getAttribute('data-value');
          footerBtn.disabled = false;
        });
      });
    });

    footerBtn.addEventListener('click', function () {
      var slide = questionSlides[current];
      if (!checked) {
        // Verificar resposta selecionada
        if (selectedValue === null) return;
        checked = true;
        var correct = slide.getAttribute('data-correct');
        var optBtns = slide.querySelectorAll('.quiz-opt-btn');
        optBtns.forEach(function (o) {
          o.classList.add('opt-disabled');
          if (o.getAttribute('data-value') === correct) o.classList.add('opt-correct');
          else if (o.classList.contains('selected')) o.classList.add('opt-wrong');
        });
        var explic = slide.querySelector('.quiz-slide-explicacao');
        if (explic) explic.hidden = false;
        footerFeedback.hidden = false;
        lastCorrect = (selectedValue === correct);
        if (lastCorrect) {
          footerFeedback.textContent = '✓ Correto!';
          footerFeedback.className = 'quiz-footer-feedback quiz-correct';
          footerBtn.classList.remove('is-wrong');
          // só avança de nível se ainda houver um próximo nível a mostrar
          footerBtn.textContent = current + 1 < total ? 'Continuar' : 'Ver resultado';
        } else {
          footerFeedback.textContent = '✗ Incorreto';
          footerFeedback.className = 'quiz-footer-feedback quiz-wrong';
          footerBtn.classList.add('is-wrong');
          // errou: o teste adaptativo encerra aqui, sem subir de nível
          footerBtn.textContent = 'Ver resultado';
        }
      } else {
        // Avançar: só sobe de nível (próxima pergunta) se acertou a atual;
        // errar encerra o teste adaptativo imediatamente no resultado.
        if (lastCorrect) {
          streak++;
          current++;
          if (current < total) {
            resetQuestionUI(questionSlides[current]);
            showSlide(current);
          } else {
            finishQuiz();
          }
        } else {
          finishQuiz();
        }
      }
    });
  }
});
