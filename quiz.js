// ========== Quiz Variables ==========
let currentQuestionIndex = 0;
let userAnswers = [];

// ========== Load Quiz ==========
function loadQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    
    const questions = window.filteredQuestions || quizQuestions;
    
    questions.forEach((q, index) => {
        const questionCard = createQuestionCard(q, index);
        container.appendChild(questionCard);
    });
    
    if (questions.length > 0) {
        showQuestion(0);
        setupNavigation(questions.length);
    }
}

function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `question-${index}`;
    
    const optionsHTML = question.options.map((option, i) => `
        <div class="option" data-index="${i}">
            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
            <span>${option}</span>
        </div>
    `).join('');
    
    card.innerHTML = `
        <div class="question-header">
            <div class="question-text">${index + 1}. ${question.question}</div>
        </div>
        <div class="options">
            ${optionsHTML}
        </div>
        <button class="show-answer-btn">
            <i class="fas fa-eye"></i> پیشاندانی وەڵامی ڕاست
        </button>
    `;
    
    // گوێگرتن بۆ هەڵبژاردنی وەڵام
    const options = card.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', () => selectOption(option, options, question, index));
    });
    
    // گوێگرتن بۆ پیشاندانی وەڵام
    const showBtn = card.querySelector('.show-answer-btn');
    showBtn.addEventListener('click', () => showAnswer(options, question, index));
    
    return card;
}

function selectOption(selectedOption, allOptions, question, questionIndex) {
    // لابردنی selected لە هەموویان
    allOptions.forEach(opt => opt.classList.remove('selected'));
    
    // زیادکردنی selected بۆ هەڵبژاردراوەکە
    selectedOption.classList.add('selected');
    
    // پاشەکەوتکردنی وەڵامەکە
    userAnswers[questionIndex] = parseInt(selectedOption.getAttribute('data-index'));
}

function showAnswer(options, question, questionIndex) {
    const correctIndex = question.correct;
    const userAnswer = userAnswers[questionIndex];
    
    // پیشاندانی وەڵامی ڕاست
    options[correctIndex].classList.add('correct');
    
    // ئەگەر هەڵبژاردنی کردبێت
    if (userAnswer !== undefined) {
        if (userAnswer !== correctIndex) {
            options[userAnswer].classList.add('wrong');
            
            // زیادکردنی هەڵە
            if (!window.quizProgress.answered.includes(questionIndex)) {
                window.quizProgress.wrong++;
                window.quizProgress.answered.push(questionIndex);
            }
        } else {
            // زیادکردنی ڕاست
            if (!window.quizProgress.answered.includes(questionIndex)) {
                window.quizProgress.correct++;
                window.quizProgress.answered.push(questionIndex);
            }
        }
        
        saveProgress();
        updateStats();
    }
}

function showQuestion(index) {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((q, i) => {
        if (i === index) {
            q.classList.add('active');
        } else {
            q.classList.remove('active');
        }
    });
    
    currentQuestionIndex = index;
    updateCounter();
    updateNavigationButtons();
}

function setupNavigation(totalQuestions) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.onclick = () => {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    };
    
    nextBtn.onclick = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            showQuestion(currentQuestionIndex + 1);
        }
    };
}

function updateCounter() {
    const total = window.filteredQuestions ? window.filteredQuestions.length : quizQuestions.length;
    document.getElementById('question-counter').textContent = `${currentQuestionIndex + 1} لە ${total}`;
}

function updateNavigationButtons() {
    const total = window.filteredQuestions ? window.filteredQuestions.length : quizQuestions.length;
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === total - 1;
}
