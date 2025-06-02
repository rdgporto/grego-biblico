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
    const fullVocabularyTableBodyEl = document.getElementById('fullVocabularyTableBody');
    const flashcardInterfaceEl = document.getElementById('flashcardInterface');
    const currentYearEl = document.getElementById('currentYear');

    // --- Estado da Aplicação ---
    let currentWords = [];
    // Carrega as palavras do vocabulário global (definido em data/licao20.js)
    if (window.vocabularioLicao20 && Array.isArray(window.vocabularioLicao20)) {
        currentWords = [...window.vocabularioLicao20]; // Cria uma cópia para permitir embaralhamento sem alterar o original
    } else {
        console.error("Vocabulário da Lição 20 não encontrado ou não é um array. Verifique data/licao20.js.");
    }

    let currentIndex = 0;
    let isAnswerShown = false;
    let isFullListPopulated = false; // Controla se a lista completa já foi gerada no DOM

    // --- Funções ---

    /**
     * Carrega e exibe a palavra atual no flashcard.
     */
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
        hideAnswer(); // Garante que a resposta esteja escondida ao carregar nova palavra
        updateWordCounter();
        updateNavigationButtons();
    }

    /**
     * Mostra a resposta (significado) no flashcard.
     */
    function showAnswer() {
        flashcardBackEl.hidden = false;
        toggleAnswerBtn.textContent = 'Esconder Significado';
        isAnswerShown = true;
    }

    /**
     * Esconde a resposta no flashcard.
     */
    function hideAnswer() {
        flashcardBackEl.hidden = true;
        toggleAnswerBtn.textContent = 'Revelar Significado';
        isAnswerShown = false;
    }

    /**
     * Alterna a visibilidade da resposta no flashcard.
     */
    function toggleAnswer() {
        if (isAnswerShown) {
            hideAnswer();
        } else {
            showAnswer();
        }
    }

    /**
     * Navega para a próxima palavra.
     */
    function nextWord() {
        if (currentIndex < currentWords.length - 1) {
            currentIndex++;
            loadWord();
        }
    }

    /**
     * Navega para a palavra anterior.
     */
    function prevWord() {
        if (currentIndex > 0) {
            currentIndex--;
            loadWord();
        }
    }

    /**
     * Atualiza o contador de palavras (ex: "1 / 20").
     */
    function updateWordCounter() {
        if (currentWords.length > 0) {
            wordCounterEl.textContent = `${currentIndex + 1} / ${currentWords.length}`;
        } else {
            wordCounterEl.textContent = "0 / 0";
        }
    }

    /**
     * Habilita/desabilita botões de navegação conforme necessário.
     */
    function updateNavigationButtons() {
        prevWordBtn.disabled = currentIndex === 0;
        nextWordBtn.disabled = currentIndex === currentWords.length - 1 || currentWords.length === 0;
        toggleAnswerBtn.disabled = currentWords.length === 0;
    }

    /**
     * Embaralha as palavras da lista atual e recarrega.
     */
    function shuffleWords() {
        if (currentWords.length === 0) return;
        for (let i = currentWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]]; // Troca de posições
        }
        currentIndex = 0; // Volta para a primeira palavra da lista embaralhada
        loadWord();
        isFullListPopulated = false; // Força a repopulação da lista completa se ela for exibida
        // Se a lista completa estiver visível, atualize-a com a nova ordem
        if (fullVocabularyListContainerEl.classList.contains('view-active')) {
            populateFullVocabularyList();
        }
    }

    /**
     * Exibe uma mensagem se não houver palavras carregadas.
     * Esconde a interface de flashcard.
     */
    function displayNoWordsMessage() {
        greekWordEl.textContent = 'N/A'; // Placeholder no flashcard
        transliterationEl.textContent = 'Nenhuma palavra carregada';
        meaningEl.textContent = '';
        // Esconde a interface principal de flashcards se não há palavras
        flashcardInterfaceEl.classList.add('view-inactive');
        flashcardInterfaceEl.classList.remove('view-active');
        flashcardInterfaceEl.hidden = true;
    }

    /**
     * Popula a tabela de vocabulário completo no DOM.
     * A tabela tem duas colunas: "Palavra" (Grego + Transliteração) e "Significado".
     */
    function populateFullVocabularyList() {
        fullVocabularyTableBodyEl.innerHTML = ''; // Limpa o corpo da tabela antes de popular

        if (currentWords.length === 0) {
            const row = fullVocabularyTableBodyEl.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2; // Abrange as duas colunas do cabeçalho
            cell.textContent = 'Nenhum vocabulário para exibir.';
            cell.style.textAlign = 'center';
            return;
        }

        currentWords.forEach(word => {
            const row = fullVocabularyTableBodyEl.insertRow();

            // Célula 1: Palavra (Contém Grego e Transliteração)
            const wordDetailCell = row.insertCell();
            wordDetailCell.classList.add('word-details-cell'); // Para estilização da célula se necessário

            const greekSpan = document.createElement('span');
            greekSpan.classList.add('table-greek-word');
            greekSpan.lang = 'el'; // Importante para a renderização correta da fonte grega
            greekSpan.textContent = word.grego;

            const translitSpan = document.createElement('span');
            translitSpan.classList.add('table-transliteration');
            translitSpan.textContent = word.transliteracao;

            wordDetailCell.appendChild(greekSpan);
            wordDetailCell.appendChild(translitSpan); // Transliteração adicionada abaixo do grego na mesma célula

            // Célula 2: Significado
            const meaningCell = row.insertCell();
            meaningCell.textContent = word.significado;
            meaningCell.classList.add('meaning-cell');
        });
        isFullListPopulated = true; // Marca que a lista foi populada
    }

    /**
     * Alterna a visibilidade entre a interface de flashcard e a lista completa de vocabulário.
     */
    function toggleFullVocabularyView() {
        const isListCurrentlyVisible = fullVocabularyListContainerEl.classList.contains('view-active');

        if (isListCurrentlyVisible) {
            // Esconder lista completa, mostrar flashcards
            fullVocabularyListContainerEl.classList.remove('view-active');
            fullVocabularyListContainerEl.classList.add('view-inactive');
            fullVocabularyListContainerEl.hidden = true; // Para acessibilidade

            flashcardInterfaceEl.classList.remove('view-inactive');
            flashcardInterfaceEl.classList.add('view-active');
            flashcardInterfaceEl.hidden = false;

            toggleFullListBtn.textContent = 'Ver Lista Completa';
        } else {
            // Mostrar lista completa, esconder flashcards
            if (!isFullListPopulated) { // Popula a lista apenas na primeira vez que é mostrada (ou após embaralhar)
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
    
    /**
     * Define o ano atual no rodapé.
     */
    function setDynamicYear() {
        if(currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    // --- Event Listeners (Configuração dos gatilhos de interação) ---
    toggleAnswerBtn.addEventListener('click', toggleAnswer);
    nextWordBtn.addEventListener('click', nextWord);
    prevWordBtn.addEventListener('click', prevWord);
    shuffleBtn.addEventListener('click', shuffleWords);
    toggleFullListBtn.addEventListener('click', toggleFullVocabularyView);

    // --- Inicialização da Página ---
    setDynamicYear(); // Define o ano no footer

    if (currentWords.length > 0) {
        flashcardInterfaceEl.classList.add('view-active'); // Garante que a interface de flashcard seja visível
        flashcardInterfaceEl.classList.remove('view-inactive');
        flashcardInterfaceEl.hidden = false;
        loadWord(); // Carrega a primeira palavra
    } else {
        // Se não houver palavras, exibe a mensagem e desabilita botões que dependem delas
        console.warn("Nenhum vocabulário carregado. Verifique o arquivo de dados.");
        displayNoWordsMessage(); 
        shuffleBtn.disabled = true;
        toggleFullListBtn.disabled = true;
        // Os botões de navegação e de resposta já são desabilitados por updateNavigationButtons via loadWord/displayNoWordsMessage
    }
});