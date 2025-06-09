// script.js
document.addEventListener('DOMContentLoaded', async () => { // Tornar o listener async
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
    const lessonTitleEl = document.getElementById('lessonTitle'); // Para atualizar o título da lição

    // --- Estado da Aplicação ---
    let currentWords = [];
    let currentIndex = 0;
    let isAnswerShown = false;
    let isFullListPopulated = false; // Controla se a lista completa já foi gerada no DOM

    // --- Funções de Inicialização e Carregamento de Dados ---
    async function initializeApp() {
        setDynamicYear();

        const urlParams = new URLSearchParams(window.location.search);
        const lessonId = urlParams.get('lesson');

        if (!lessonId) {
            displayErrorMessage("Nenhuma lição especificada. Por favor, <a href=\"index.html\">selecione uma lição no menu</a>.");
            disableAllControls();
            if (lessonTitleEl) lessonTitleEl.textContent = "Erro";
            document.title = "Grego Bíblico - Erro";
            return;
        }

        if (lessonTitleEl) lessonTitleEl.innerHTML = `Vocabulário da Lição ${lessonId} <br><a href="index.html">Voltar ao Menu</a>`;
        document.title = `Grego Bíblico - Vocabulário Lição ${lessonId}`;

        try {
            const dataModule = await import(`./data/licao${lessonId}.js`);
            const vocabularyData = dataModule[`vocabularioLicao${lessonId}`];

            if (vocabularyData && Array.isArray(vocabularyData)) {
                currentWords = [...vocabularyData];
            } else {
                throw new Error(`Dados do vocabulário para lição ${lessonId} não encontrados ou em formato inválido no módulo.`);
            }
        } catch (error) {
            console.error(`Erro ao carregar dados da lição ${lessonId}:`, error);
            displayErrorMessage(`Não foi possível carregar o vocabulário da Lição ${lessonId}. Verifique se a lição existe e <a href="index.html">tente novamente a partir do menu</a>.`);
            disableAllControls();
            return;
        }

        if (currentWords.length > 0) {
            flashcardInterfaceEl.classList.add('view-active');
            flashcardInterfaceEl.classList.remove('view-inactive');
            flashcardInterfaceEl.hidden = false;
            shuffleBtn.disabled = false;
            toggleFullListBtn.disabled = false;
            loadWord();
        } else {
            console.warn(`Nenhum vocabulário carregado para a Lição ${lessonId} (lição vazia).`);
            displayNoWordsMessage(); // Trata o caso de lição vazia
            shuffleBtn.disabled = true;
            toggleFullListBtn.disabled = true;
        }
    }

    function displayErrorMessage(htmlMessage) {
        if (greekWordEl) greekWordEl.textContent = 'Erro';
        if (transliterationEl) transliterationEl.innerHTML = htmlMessage; // Usar innerHTML para o link
        if (meaningEl) meaningEl.textContent = '';
        if (occurrencesEl) occurrencesEl.hidden = true;
        if (wordCounterEl) wordCounterEl.textContent = "0 / 0";

        flashcardInterfaceEl.classList.add('view-inactive');
        flashcardInterfaceEl.classList.remove('view-active');
        flashcardInterfaceEl.hidden = true;
        
        fullVocabularyListContainerEl.classList.add('view-inactive');
        fullVocabularyListContainerEl.classList.remove('view-active');
        fullVocabularyListContainerEl.hidden = true;
    }

    function disableAllControls() {
        toggleAnswerBtn.disabled = true;
        prevWordBtn.disabled = true;
        nextWordBtn.disabled = true;
        shuffleBtn.disabled = true;
        toggleFullListBtn.disabled = true;
    }

    // --- Funções de Manipulação do Flashcard e Lista (a maioria permanece igual) ---

    /**
     * Carrega e exibe a palavra atual no flashcard.
     */
    function loadWord() {
        if (currentWords.length === 0) {
            displayNoWordsMessage();
            // Garante que os botões de navegação e resposta estejam desabilitados
            // se por algum motivo esta função for chamada com currentWords vazio
            // após a inicialização.
            updateNavigationButtons();
            shuffleBtn.disabled = true;
            toggleFullListBtn.disabled = true;
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
        if (currentWords.length === 0) return;
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
        if (currentWords.length === 0) return;
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
        prevWordBtn.disabled = currentIndex === 0 || currentWords.length === 0;
        nextWordBtn.disabled = currentIndex === currentWords.length - 1 || currentWords.length === 0;
        toggleAnswerBtn.disabled = currentWords.length === 0; // toggleAnswerBtn também depende de haver palavras
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
        if (greekWordEl) greekWordEl.textContent = 'N/A';
        if (transliterationEl) transliterationEl.textContent = 'Nenhum vocabulário para esta lição.';
        if (meaningEl) meaningEl.textContent = '';
        if (occurrencesEl) occurrencesEl.hidden = true;
        
        flashcardInterfaceEl.classList.add('view-inactive');
        flashcardInterfaceEl.classList.remove('view-active');
        flashcardInterfaceEl.hidden = true;

        // Atualiza a lista completa para mostrar a mensagem também
        if (fullVocabularyTableBodyEl) {
            populateFullVocabularyList(); // Isso irá mostrar "Nenhum vocabulário para exibir"
        }

        updateWordCounter(); // Para mostrar 0/0
        updateNavigationButtons(); // Desabilita botões de navegação/resposta
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

            wordDetailCell.append(greekSpan, translitSpan);

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
        // Se não há palavras e o usuário tenta ver a lista,
        // populateFullVocabularyList() (chamado se !isFullListPopulated)
        // já mostrará a mensagem "Nenhum vocabulário para exibir."
        if (currentWords.length === 0 && !fullVocabularyListContainerEl.classList.contains('view-active')) {
             if (!isFullListPopulated) {
                populateFullVocabularyList();
            }
        }
        const isListCurrentlyVisible = fullVocabularyListContainerEl.classList.contains('view-active');

        if (isListCurrentlyVisible) {
            // Esconder lista completa, mostrar flashcards
            fullVocabularyListContainerEl.classList.remove('view-active');
            fullVocabularyListContainerEl.classList.add('view-inactive');
            fullVocabularyListContainerEl.hidden = true; // Para acessibilidade

            // Só mostra flashcards se houver palavras
            if (currentWords.length > 0) {
                flashcardInterfaceEl.classList.remove('view-inactive');
                flashcardInterfaceEl.classList.add('view-active');
                flashcardInterfaceEl.hidden = false;
            } else { // Se não houver palavras, a interface de flashcard deve permanecer escondida
                 flashcardInterfaceEl.classList.add('view-inactive');
                 flashcardInterfaceEl.classList.remove('view-active');
                 flashcardInterfaceEl.hidden = true;            }
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
    if (toggleAnswerBtn) toggleAnswerBtn.addEventListener('click', toggleAnswer);
    if (nextWordBtn) nextWordBtn.addEventListener('click', nextWord);
    if (prevWordBtn) prevWordBtn.addEventListener('click', prevWord);
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleWords);
    if (toggleFullListBtn) toggleFullListBtn.addEventListener('click', toggleFullVocabularyView);

    // --- Inicialização da Aplicação ---
    initializeApp();

});