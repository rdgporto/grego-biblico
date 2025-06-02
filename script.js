// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores do DOM ---
    const greekWordEl = document.querySelector('.greek-word');
    const transliterationEl = document.querySelector('.transliteration');
    const meaningEl = document.querySelector('.meaning');
    const occurrencesEl = document.querySelector('.occurrences');
    const flashcardBackEl = document.querySelector('.flashcard-back');
    const toggleAnswerBtn = document.getElementById('toggleAnswerBtn');
    const prevWordBtn = document.getElementById('prevWordBtn');
    const nextWordBtn = document.getElementById('nextWordBtn');
    const wordCounterEl = document.getElementById('wordCounter');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const toggleFullListBtn = document.getElementById('toggleFullListBtn');
    const fullVocabularyListContainerEl = document.getElementById('fullVocabularyListContainer');
    const fullVocabularyTableBodyEl = document.getElementById('fullVocabularyTableBody'); // Alterado para o tbody
    const flashcardInterfaceEl = document.getElementById('flashcardInterface');
    const currentYearEl = document.getElementById('currentYear');

    // --- Estado da Aplicação ---
    let currentWords = [];
    if (window.vocabularioLicao20 && Array.isArray(window.vocabularioLicao20)) {
        currentWords = [...window.vocabularioLicao20];
    } else {
        console.error("Vocabulário da Lição 20 não encontrado ou não é um array.");
    }

    let currentIndex = 0;
    let isAnswerShown = false;
    let isFullListPopulated = false;

    // --- Funções ---
    function loadWord() {
        if (currentWords.length === 0) {
            displayNoWordsMessage();
            return;
        }
        const wordData = currentWords[currentIndex];
        greekWordEl.textContent = wordData.grego;
        transliterationEl.textContent = wordData.transliteracao;
        meaningEl.textContent = wordData.significado;

        if (wordData.ocorrencias) {
            occurrencesEl.textContent = `(${wordData.ocorrencias} ocorrências no NT)`;
            occurrencesEl.hidden = false;
        } else {
            occurrencesEl.hidden = true;
        }
        hideAnswer();
        updateWordCounter();
        updateNavigationButtons();
    }

    function showAnswer() {
        flashcardBackEl.hidden = false;
        toggleAnswerBtn.textContent = 'Esconder Significado';
        isAnswerShown = true;
    }

    function hideAnswer() {
        flashcardBackEl.hidden = true;
        toggleAnswerBtn.textContent = 'Revelar Significado';
        isAnswerShown = false;
    }

    function toggleAnswer() {
        if (isAnswerShown) {
            hideAnswer();
        } else {
            showAnswer();
        }
    }

    function nextWord() {
        if (currentIndex < currentWords.length - 1) {
            currentIndex++;
            loadWord();
        }
    }

    function prevWord() {
        if (currentIndex > 0) {
            currentIndex--;
            loadWord();
        }
    }

    function updateWordCounter() {
        if (currentWords.length > 0) {
            wordCounterEl.textContent = `${currentIndex + 1} / ${currentWords.length}`;
        } else {
            wordCounterEl.textContent = "0 / 0";
        }
    }

    function updateNavigationButtons() {
        prevWordBtn.disabled = currentIndex === 0;
        nextWordBtn.disabled = currentIndex === currentWords.length - 1 || currentWords.length === 0;
        toggleAnswerBtn.disabled = currentWords.length === 0;
    }

    function shuffleWords() {
        if (currentWords.length === 0) return;
        for (let i = currentWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]];
        }
        currentIndex = 0;
        loadWord();
        isFullListPopulated = false; // Força repopulação se a lista for mostrada
        if (fullVocabularyListContainerEl.classList.contains('view-active')) {
            populateFullVocabularyList();
        }
    }

    function displayNoWordsMessage() {
        greekWordEl.textContent = 'N/A';
        transliterationEl.textContent = 'Nenhuma palavra carregada';
        meaningEl.textContent = '';
        flashcardInterfaceEl.classList.add('view-inactive');
        flashcardInterfaceEl.classList.remove('view-active');
    }

    function populateFullVocabularyList() {
        fullVocabularyTableBodyEl.innerHTML = ''; // Limpa o corpo da tabela

        if (currentWords.length === 0) {
            const row = fullVocabularyTableBodyEl.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3; // Número de colunas no thead
            cell.textContent = 'Nenhum vocabulário para exibir.';
            cell.style.textAlign = 'center';
            return;
        }

        currentWords.forEach(word => {
            const row = fullVocabularyTableBodyEl.insertRow();

            const greekCell = row.insertCell();
            greekCell.textContent = word.grego;
            greekCell.lang = 'el';
            greekCell.classList.add('greek-cell');

            const translitCell = row.insertCell();
            translitCell.textContent = word.transliteracao;
            translitCell.classList.add('translit-cell');

            const meaningCell = row.insertCell();
            meaningCell.textContent = word.significado;
            meaningCell.classList.add('meaning-cell');
        });
        isFullListPopulated = true;
    }

    function toggleFullVocabularyView() {
        const isListCurrentlyVisible = fullVocabularyListContainerEl.classList.contains('view-active');

        if (isListCurrentlyVisible) {
            fullVocabularyListContainerEl.classList.remove('view-active');
            fullVocabularyListContainerEl.classList.add('view-inactive');
            fullVocabularyListContainerEl.hidden = true; // Garante que esteja oculto para leitores de tela

            flashcardInterfaceEl.classList.remove('view-inactive');
            flashcardInterfaceEl.classList.add('view-active');
            flashcardInterfaceEl.hidden = false;

            toggleFullListBtn.textContent = 'Ver Lista Completa';
        } else {
            if (!isFullListPopulated) {
                populateFullVocabularyList();
            }
            fullVocabularyListContainerEl.classList.remove('view-inactive');
            fullVocabularyListContainerEl.classList.add('view-active');
            fullVocabularyListContainerEl.hidden = false;

            flashcardInterfaceEl.classList.remove('view-active');
            flashcardInterfaceEl.classList.add('view-inactive');
            flashcardInterfaceEl.hidden = true;

            toggleFullListBtn.textContent = 'Ver Flashcards';
        }
    }
    
    function setDynamicYear() {
        if(currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    // --- Event Listeners ---
    toggleAnswerBtn.addEventListener('click', toggleAnswer);
    nextWordBtn.addEventListener('click', nextWord);
    prevWordBtn.addEventListener('click', prevWord);
    shuffleBtn.addEventListener('click', shuffleWords);
    toggleFullListBtn.addEventListener('click', toggleFullVocabularyView);

    // --- Inicialização ---
    setDynamicYear();
    if (currentWords.length > 0) {
        flashcardInterfaceEl.classList.add('view-active');
        flashcardInterfaceEl.classList.remove('view-inactive');
        loadWord();
    } else {
        console.warn("Nenhum vocabulário encontrado para a Lição 20.");
        displayNoWordsMessage();
        // Desabilitar botões se não houver palavras
        shuffleBtn.disabled = true;
        toggleFullListBtn.disabled = true;
    }
});