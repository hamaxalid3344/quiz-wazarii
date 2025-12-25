// ========== Initialize ==========
let currentQuestion = 0;
let userAnswers = [];
let quizData = [];
let stats = { correct: 0, wrong: 0, total: 0 };
let answeredQuestions = new Set();
let settings = {
    darkMode: false,
    sound: true,
    themeColor: '#4F46E5',
    questionsCount: 10,
    autoNextTime: 1500
};

document.addEventListener('DOMContentLoaded', function() {
    // Show splash screen
    showSplashScreen();
    loadSettings();
    loadPDFs();
    setupCustomSelect();
    loadQuiz();
    setupNavigation();
    setupSettings(); // ئەمە هێشتا کار دەکات
    loadStats();

     // Setup install prompt
    setupInstallPrompt();
});

// ========== PWA Install Prompt ==========
let deferredPrompt;

// ========== Splash Screen ==========
function showSplashScreen() {
    const splash = document.getElementById('splash-screen');
    
    setTimeout(() => {
        splash.style.display = 'none';
        
        // Show install prompt after splash
        setTimeout(() => {
            checkInstallPrompt();
        }, 500);
    }, 3000); // 3 چرکە
}

// ========== Install Prompt ==========
function setupInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    const installBtn = document.getElementById('install-btn');
    const laterBtn = document.getElementById('later-btn');
    const closeBtn = document.getElementById('close-prompt');
    
    // Capture install event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('Install prompt ready');
    });
    
    // Install button
    installBtn.addEventListener('click', async () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isAndroid && deferredPrompt) {
            // Android - Native prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                showNotification('✓ ئەپەکە دامەزرا', 'success');
            } else {
                showAndroidInstructions();
            }
            
            deferredPrompt = null;
            hideInstallPrompt();
        } else if (isAndroid && !deferredPrompt) {
            // Android but no prompt
            showAndroidInstructions();
            hideInstallPrompt();
        } else if (isIOS) {
            // iOS - Instructions
            hideInstallPrompt();
            showIOSInstructions();
        } else {
            // Desktop
            showNotification('تکایە لە مۆبایلەکەتەوە بیکە', 'info');
            hideInstallPrompt();
        }
    });
    
    // Later button
    laterBtn.addEventListener('click', () => {
        hideInstallPrompt();
        localStorage.setItem('install-prompt-shown', Date.now());
    });
    
    // Close button
    closeBtn.addEventListener('click', () => {
        hideInstallPrompt();
        localStorage.setItem('install-prompt-shown', Date.now());
    });
}

// ========== Android Instructions ==========
function showAndroidInstructions() {
    const overlay = document.createElement('div');
    overlay.className = 'install-instructions android-instructions';
    overlay.innerHTML = `
        <div class="instruction-content">
            <button class="close-instruction" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="device-icon">
                <i class="fab fa-android"></i>
            </div>
            <h3>چۆن دایبمەزرێنم لە ئەندرۆید؟</h3>
            <div class="instruction-steps">
                <div class="instruction-step">
                    <div class="step-number">١</div>
                    <div class="step-text">
                        <p>لە مێنیوی بڕاوزەر (⋮) کلیک بکە</p>
                        <i class="fas fa-ellipsis-v step-icon"></i>
                    </div>
                </div>
                <div class="instruction-step">
                    <div class="step-number">٢</div>
                    <div class="step-text">
                        <p>هەڵبژێرە <strong>"Install app"</strong> یان <strong>"Add to Home screen"</strong></p>
                        <i class="fas fa-download step-icon"></i>
                    </div>
                </div>
                <div class="instruction-step">
                    <div class="step-number">٣</div>
                    <div class="step-text">
                        <p>کلیک لە <strong>"Install"</strong> بکە</p>
                        <i class="fas fa-check-circle step-icon"></i>
                    </div>
                </div>
            </div>
            <button class="got-it-btn" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-thumbs-up"></i>
                تێگەیشتم
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// ========== iOS Instructions ==========
function showIOSInstructions() {
    const overlay = document.createElement('div');
    overlay.className = 'install-instructions ios-instructions';
    overlay.innerHTML = `
        <div class="instruction-content">
            <button class="close-instruction" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="device-icon">
                <i class="fab fa-apple"></i>
            </div>
            <h3>چۆن دایبمەزرێنم لە iOS؟</h3>
            <div class="instruction-steps">
                <div class="instruction-step">
                    <div class="step-number">١</div>
                    <div class="step-text">
                        <p>کلیک لە دوگمەی <strong>Share</strong> بکە (لە خوارەوە)</p>
                        <i class="fas fa-share-from-square step-icon"></i>
                    </div>
                </div>
                <div class="instruction-step">
                    <div class="step-number">٢</div>
                    <div class="step-text">
                        <p>هەڵبژێرە <strong>"Add to Home Screen"</strong></p>
                        <i class="fas fa-plus-square step-icon"></i>
                    </div>
                </div>
                <div class="instruction-step">
                    <div class="step-number">٣</div>
                    <div class="step-text">
                        <p>کلیک لە <strong>"Add"</strong> بکە</p>
                        <i class="fas fa-check-circle step-icon"></i>
                    </div>
                </div>
            </div>
            <p class="instruction-note">
                <i class="fas fa-info-circle"></i>
                تێبینی: تەنها لە بڕاوزەری <strong>Safari</strong> کار دەکات
            </p>
            <button class="got-it-btn" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-thumbs-up"></i>
                تێگەیشتم
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function checkInstallPrompt() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App already installed');
        return;
    }
    
    // Check if dismissed recently (7 days)
    const lastShown = localStorage.getItem('install-prompt-shown');
    if (lastShown) {
        const daysSince = (Date.now() - lastShown) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
            console.log('Install prompt shown recently');
            return;
        }
    }
    
    // Show prompt
    setTimeout(() => {
        document.getElementById('install-prompt').classList.add('show');
    }, 1000);
}

function hideInstallPrompt() {
    document.getElementById('install-prompt').classList.remove('show');
}

function showIOSInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
        showNotification('لە Safari، کلیک لە Share بکە و "Add to Home Screen" هەڵبژێرە', 'info');
    } else {
        showNotification('لە مێنیوی بڕاوزەرەکەت "Add to Home Screen" هەڵبژێرە', 'info');
    }
}


// ========== Settings ==========
function loadSettings() {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
        settings = JSON.parse(saved);
    }
    applySettings();
}

function saveSettings() {
    localStorage.setItem('app-settings', JSON.stringify(settings));
}

function applySettings() {
    // Dark Mode
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').checked = true;
    }
    
    // Theme Color
    document.documentElement.style.setProperty('--primary', settings.themeColor);
    
    // Sound
    document.getElementById('sound-toggle').checked = settings.sound;
    
    // Quiz Settings
    // ئەو دوو لاینە کۆنە سڕاونەتەوە
    // Custom dropdown values will be loaded in setupSettingsDropdowns()
}

function setupSettings() {
    // Dark Mode Toggle
    document.getElementById('dark-mode-toggle').addEventListener('change', (e) => {
        settings.darkMode = e.target.checked;
        document.body.classList.toggle('dark-mode', e.target.checked);
        saveSettings();
    });
    
    // Sound Toggle
    document.getElementById('sound-toggle').addEventListener('change', (e) => {
        settings.sound = e.target.checked;
        saveSettings();
        if (e.target.checked) {
            playSound('success');
        }
    });
    
    // Theme Color
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            settings.themeColor = color;
            
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.documentElement.style.setProperty('--primary', color);
            
            saveSettings();
        });
        
        if (btn.getAttribute('data-color') === settings.themeColor) {
            btn.classList.add('active');
        }
    });
    
    // Quiz Settings
    setupSettingsDropdowns();
    
    // Clear Data
    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if (confirm('دڵنیایت دەتەوێت هەموو داتاکان بسڕیتەوە؟\n(ئامار، ڕێکخستنەکان، مێژوو)')) {
            localStorage.clear();
            stats = { correct: 0, wrong: 0, total: 0 };
            answeredQuestions.clear();
            settings = {
                darkMode: false,
                sound: true,
                themeColor: '#4F46E5',
                questionsCount: 10,
                autoNextTime: 1500
            };
            applySettings();
            updateStatsDisplay();
            showNotification('هەموو داتاکان سڕانەوە', 'success');
        }
    });
}

// ←←← لێرە ئەم فانکشنە نوێیە زیاد بکە ←←←
function setupSettingsDropdowns() {
    const questionsSelect = document.getElementById('questions-count-select');
    const autoNextSelect = document.getElementById('auto-next-select');
    
    // ئەگەر elements نەدۆزرانەوە، return بکە
    if (!questionsSelect || !autoNextSelect) {
        console.log('Settings dropdowns not found');
        return;
    }
    
    // Questions Count setup
    const questionsOptions = questionsSelect.querySelectorAll('.option-setting');
    
    questionsSelect.querySelector('.select-trigger-setting').addEventListener('click', () => {
        questionsSelect.classList.toggle('open');
        autoNextSelect.classList.remove('open');
    });
    
    questionsOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.querySelector('span').textContent;
            
            questionsSelect.querySelector('.select-value').textContent = text;
            questionsOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            settings.questionsCount = value === 'all' ? 'all' : parseInt(value);
            saveSettings();
            showNotification('✓ ژمارەی پرسیار گۆڕدرا', 'success');
            questionsSelect.classList.remove('open');
        });
    });
    
    // Auto Next Time setup
    const autoNextOptions = autoNextSelect.querySelectorAll('.option-setting');
    
    autoNextSelect.querySelector('.select-trigger-setting').addEventListener('click', () => {
        autoNextSelect.classList.toggle('open');
        questionsSelect.classList.remove('open');
    });
    
    autoNextOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.querySelector('span').textContent;
            
            autoNextSelect.querySelector('.select-value').textContent = text;
            autoNextOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            settings.autoNextTime = parseInt(value);
            saveSettings();
            showNotification('✓ کاتی ئۆتۆماتیک گۆڕدرا', 'success');
            autoNextSelect.classList.remove('open');
        });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-setting')) {
            questionsSelect.classList.remove('open');
            autoNextSelect.classList.remove('open');
        }
    });
}

// ========== Sound Effects ==========
function playSound(type) {
    if (!settings.sound) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'success') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    } else if (type === 'error') {
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// ========== Navigation ==========
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const screens = document.querySelectorAll('.screen');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetScreen = item.getAttribute('data-screen');
            switchScreen(targetScreen);
        });
    });
}

function switchScreen(targetScreen) {
    const navItems = document.querySelectorAll('.nav-item');
    const screens = document.querySelectorAll('.screen');
    
    navItems.forEach(nav => nav.classList.remove('active'));
    screens.forEach(screen => screen.classList.remove('active'));
    
    document.querySelector(`.nav-item[data-screen="${targetScreen}"]`)?.classList.add('active');
    document.getElementById(`${targetScreen}-screen`).classList.add('active');
    
    if (targetScreen === 'stats') {
        updateStatsDisplay();
    }
}

function setupMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const statsBtn = document.getElementById('stats-btn');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    
    menuBtn.addEventListener('click', () => {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
    });
    
    statsBtn.addEventListener('click', () => {
        switchScreen('stats');
    });
    
    overlay.addEventListener('click', closeSideMenu);
}

function closeSideMenu() {
    document.getElementById('side-menu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}



function filterPDFs() {
    // وەرگرتنی بەهای هەڵبژێردراو لە هەر فلتەرێک
    const getSelectedValue = (id) => {
        const el = document.getElementById(id);
        if (!el) return '';
        const active = el.querySelector('.select-option.active');
        return active ? active.getAttribute('data-value') : '';
    };

    const yearVal = getSelectedValue('year-filter');
    const termVal = getSelectedValue('term-filter');
    const subjectVal = getSelectedValue('subject-filter');

    const cards = document.querySelectorAll('.pdf-card');

    cards.forEach(card => {
        const cYear = card.getAttribute('data-year');
        const cTerm = card.getAttribute('data-term');
        const cSubject = card.getAttribute('data-subject');

        // مەرج: یان فلتەر بەتاڵە (هەموو)، یان یەکسانە
        const matchYear = (yearVal === '' || cYear === yearVal);
        const matchTerm = (termVal === '' || cTerm === termVal);
        const matchSubject = (subjectVal === '' || cSubject === subjectVal);

        if (matchYear && matchTerm && matchSubject) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}



// ========== Load Quiz ==========
function loadQuiz() {
    let allQuestions = [...quizQuestions];
    
    // Filter by count
    if (settings.questionsCount !== 'all') {
        allQuestions = allQuestions.slice(0, settings.questionsCount);
    }
    
    quizData = allQuestions;
    currentQuestion = 0;
    userAnswers = [];
    displayQuestion();
    
    document.getElementById('show-answer-btn').addEventListener('click', showAnswer);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
}

function displayQuestion() {
    const container = document.getElementById('question-container');
    const question = quizData[currentQuestion];
    
    if (!question) return;
    
    const optionsHTML = question.options.map((option, i) => `
        <div class="option-item" data-index="${i}">
            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
            <span>${option}</span>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="question-header">
            ${currentQuestion + 1}. ${question.question}
        </div>
        <div class="options-list">
            ${optionsHTML}
        </div>
    `;
    
    const options = container.querySelectorAll('.option-item');
    options.forEach(option => {
        option.addEventListener('click', () => selectOption(option, options, question));
    });
    
    updateProgress();
}

// تەنها ئەم فانکشنانە بگۆڕە لە فایلی mobile-app.js

function selectOption(selected, allOptions, question) {
    if (answeredQuestions.has(currentQuestion)) {
        return;
    }
    
    allOptions.forEach(opt => opt.classList.remove('selected'));
    selected.classList.add('selected');
    
    const selectedIndex = parseInt(selected.getAttribute('data-index'));
    userAnswers[currentQuestion] = selectedIndex;
    
    const isCorrect = selectedIndex === question.correct;
    
    setTimeout(() => {
        if (isCorrect) {
            selected.classList.add('correct');
            stats.correct++;
            playSound('success');
            showNotification('وەڵامی ڕاست!', 'success');
        } else {
            selected.classList.add('wrong');
            allOptions[question.correct].classList.add('correct');
            stats.wrong++;
            playSound('error');
            showNotification('وەڵامی هەڵە!', 'error');
        }
        
        stats.total++;
        answeredQuestions.add(currentQuestion);
        saveStats();
        updateStatsDisplay();
        
        setTimeout(() => {
            if (currentQuestion < quizData.length - 1) {
                nextQuestion();
            } else {
                // کاتێک تەواو بوو، پێشتر Review Screen پیشان بدە
                showReviewScreen();
            }
        }, settings.autoNextTime);
        
    }, 300);
}

// ========== Review Screen (پیشاندانی وەڵامە ڕاستەکان) ==========
function showReviewScreen() {
    const container = document.getElementById('question-container');
    
    let reviewHTML = `
        <div class="review-header">
            <h2 style="font-size: 1.3rem; color: var(--primary); margin-bottom: 8px;">
                <i class="fas fa-clipboard-check"></i> پێداچوونەوەی وەڵامەکان
            </h2>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
                سەرجەم پرسیار و وەڵامە ڕاستەکان
            </p>
        </div>
        <div class="review-list">
    `;
    
    quizData.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correct;
        const icon = isCorrect ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';
        const statusClass = isCorrect ? 'correct-item' : 'wrong-item';
        
        reviewHTML += `
            <div class="review-item ${statusClass}">
                <div class="review-question">
                    <span class="review-icon">${icon}</span>
                    <span class="review-number">${index + 1}.</span>
                    <span>${q.question}</span>
                </div>
                <div class="review-answer correct-answer">
                    <i class="fas fa-check-circle"></i>
                    <strong>وەڵامی ڕاست:</strong> ${q.options[q.correct]}
                </div>
                ${!isCorrect && userAnswer !== undefined ? `
                    <div class="review-answer wrong-answer">
                        <i class="fas fa-times-circle"></i>
                        <strong>تۆ هەڵبژاردت:</strong> ${q.options[userAnswer]}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    reviewHTML += `
        </div>
        <div class="review-actions">
            <button onclick="showFinalResults()" class="action-btn primary" style="width: 100%;">
                <span style="font-family: UniSIRWAN Qabas">بینینی ئەنجامی کۆتایی</span> </span><i class="fas fa-arrow-left"></i>
            </button>
        </div>
    `;
    
    container.innerHTML = reviewHTML;
    container.style.maxHeight = 'calc(100vh - 300px)';
    container.style.overflowY = 'auto';
    
    // دوگمەکانی خوارەوە بشارەوە
    document.querySelector('.action-buttons').style.display = 'none';
}

function showFinalResults() {
    const percentage = ((stats.correct / stats.total) * 100).toFixed(0);
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
        message = 'نایاب! تۆ زۆر بەهرەمەندی 🌟';
        emoji = '🏆';
    } else if (percentage >= 70) {
        message = 'زۆر باش! بەردەوام بە 💪';
        emoji = '🎉';
    } else if (percentage >= 50) {
        message = 'باش بوو، بەڵام دەتوانیت باشتر بیت 📚';
        emoji = '👍';
    } else {
        message = 'پێویستە زیاتر مەشق بکەیت 📖';
        emoji = '💪';
    }
    
    const container = document.getElementById('question-container');
    container.style.maxHeight = 'none';
    container.style.overflowY = 'visible';
    
    const resultHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">${emoji}</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 16px; color: var(--primary);">تەواوبوو!</h2>
            <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 24px;">${message}</p>
            <div style="font-size: 3rem; font-weight: bold; color: var(--secondary); margin-bottom: 12px;">${percentage}%</div>
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 24px;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; color: var(--secondary);">✓ ${stats.correct}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">ڕاست</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; color: var(--danger);">✗ ${stats.wrong}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">هەڵە</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button onclick="showReviewScreen()" style="flex: 1; padding: 14px; background: var(--warning); color: white; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer;">
                    <i class="fas fa-eye"></i> وەڵامەکان
                </button>
                <button onclick="restartQuiz()" style="flex: 1; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer;">
                    <i class="fas fa-rotate-right"></i> دووبارە
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = resultHTML;
    document.querySelector('.action-buttons').style.display = 'none';
    playSound('success');
}

function restartQuiz() {
    answeredQuestions.clear();
    userAnswers = [];
    currentQuestion = 0;
    document.querySelector('.action-buttons').style.display = 'flex';
    loadQuiz();
}


function showAnswer() {
    const question = quizData[currentQuestion];
    const options = document.querySelectorAll('.option-item');
    
    if (!answeredQuestions.has(currentQuestion)) {
        options[question.correct].classList.add('correct');
        showNotification('💡 وەڵامی ڕاست پیشاندرا', 'info');
    }
}

function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        displayQuestion();
    }
}

function showFinalResults() {
    const percentage = ((stats.correct / stats.total) * 100).toFixed(0);
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
        message = 'نایاب! تۆ زۆر بەهرەمەندی 🌟';
        emoji = '🏆';
    } else if (percentage >= 70) {
        message = 'زۆر باش! بەردەوام بە 💪';
        emoji = '🎉';
    } else if (percentage >= 50) {
        message = 'باش بوو، بەڵام دەتوانیت باشتر بیت 📚';
        emoji = '👍';
    } else {
        message = 'پێویستە زیاتر مەشق بکەیت 📖';
        emoji = '💪';
    }
    
    const resultHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">${emoji}</div>
            <h2 style="font-size: 1.5rem; margin-bottom: 16px; color: var(--primary);">تەواوبوو!</h2>
            <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 24px;">${message}</p>
            <div style="font-size: 3rem; font-weight: bold; color: var(--secondary); margin-bottom: 12px;">${percentage}%</div>
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 24px;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; color: var(--secondary);">✓ ${stats.correct}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">ڕاست</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; color: var(--danger);">✗ ${stats.wrong}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">هەڵە</div>
                </div>
            </div>
            <button onclick="restartQuiz()" style="margin-top: 30px; padding: 14px 32px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer;">
                <span style="font-family: UniSIRWAN Qabas">دەستپێکردنەوە</span></span> <i class="fas fa-rotate-right"></i>
            </button>
        </div>
    `;
    
    document.getElementById('question-container').innerHTML = resultHTML;
    playSound('success');
}

function restartQuiz() {
    answeredQuestions.clear();
    userAnswers = [];
    currentQuestion = 0;
    loadQuiz();
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${currentQuestion + 1}/${quizData.length}`;
}

// ========== Stats ==========
function loadStats() {
    const saved = localStorage.getItem('quiz-stats');
    if (saved) {
        stats = JSON.parse(saved);
    }
    updateStatsDisplay();
}

function saveStats() {
    localStorage.setItem('quiz-stats', JSON.stringify(stats));
}

function updateStatsDisplay() {
    document.getElementById('correct-stat').textContent = stats.correct;
    document.getElementById('wrong-stat').textContent = stats.wrong;
    document.getElementById('total-stat').textContent = stats.total;
}

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('دڵنیایت دەتەوێت هەموو ئامارەکان بسڕیتەوە؟')) {
        stats = { correct: 0, wrong: 0, total: 0 };
        saveStats();
        updateStatsDisplay();
        showNotification('✅ ئامارەکان سڕانەوە', 'success');
    }
});

// ========== Notification ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 50%;
        transform: translateX(50%);
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F46E5'};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 9999;
        animation: slideDown 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 90%;
        text-align: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translate(50%, -20px); }
        to { opacity: 1; transform: translate(50%, 0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translate(50%, 0); }
        to { opacity: 0; transform: translate(50%, -20px); }
    }
`;
document.head.appendChild(style);


// زیادکردنی ئەم فانکشنە لە فایلی mobile-app.js

// ========== Custom Select Dropdown ==========
function setupCustomSelect() {
    const filters = ['year', 'term', 'subject'];

    filters.forEach(id => {
        const wrapper = document.getElementById(id + '-filter');
        if (!wrapper) return; // ئەگەر نەبوو، وازی لێ بێنە

        const trigger = wrapper.querySelector('.select-trigger');
        const options = wrapper.querySelectorAll('.select-option');
        const textLabel = wrapper.querySelector('.select-text');

        // کردنەوە و داخستن
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // داخستنی ئەوانی تر
            document.querySelectorAll('.custom-select').forEach(el => {
                if (el !== wrapper) el.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });

        // هەڵبژاردن
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // گۆڕینی دەق
                textLabel.textContent = opt.textContent;
                
                // گۆڕینی کلاس
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                // داخستن
                wrapper.classList.remove('open');
                
                // جێبەجێکردنی فلتەر
                filterPDFs();
            });
        });
    });

    // داخستن کاتێک کلیک لە دەرەوە دەکرێت
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('open'));
    });
}


// گۆڕینی فانکشنی filterPDFs
function filterPDFs() {
    // ١. وەرگرتنی بەهاکان
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return '';
        const active = el.querySelector('.select-option.active');
        return active ? active.getAttribute('data-value') : '';
    };

    const yearVal = getVal('year-filter');
    const termVal = getVal('term-filter');
    const subjectVal = getVal('subject-filter'); // ← زیادکراو

    // ٢. پشکنینی کارتەکان
    document.querySelectorAll('.pdf-card').forEach(card => {
        const cYear = card.getAttribute('data-year');
        const cTerm = card.getAttribute('data-term');
        const cSubject = card.getAttribute('data-subject'); // ← زیادکراو

        // مەرجەکان
        const matchYear = (yearVal === '' || cYear === yearVal);
        const matchTerm = (termVal === '' || cTerm === termVal);
        const matchSubject = (subjectVal === '' || cSubject === subjectVal); // ← زیادکراو

        // ٣. نیشاندان یان شاردنەوە
        if (matchYear && matchTerm && matchSubject) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}


// فانکشنی loadPDFs ساکارەوە - دوو لایسەنەرەکە بسڕەوە:
function loadPDFs() {
    const container = document.getElementById('pdf-cards');
    if (!container) return;
    container.innerHTML = '';
    
    // دڵنیابوونەوە لەوەی داتا هەیە
    if (typeof pdfFiles === 'undefined' || !pdfFiles) {
        console.log('pdfFiles not found');
        return;
    }

    pdfFiles.forEach(pdf => {
        const card = document.createElement('div');
        card.className = 'pdf-card';
        
        // =============================================
        // بەشی زیرەک: دۆزینەوەی وانە لە ناونیشانەکەوە
        // =============================================
        let autoSubject = pdf.subject ? pdf.subject.trim() : ''; 
        
        // ئەگەر خۆت نەتنووسیوە، لێرە لە ناونیشانەکە دەیدۆزێتەوە
        if (!autoSubject && pdf.title) {
            const t = pdf.title; 
            if (t.includes('کوردی')) autoSubject = 'کوردی';
            else if (t.includes('عەرەبی')) autoSubject = 'عەرەبی';
            else if (t.includes('ئینگلیزی')) autoSubject = 'ئینگلیزی';
            else if (t.includes('بیرکاری')) autoSubject = 'بیرکاری';
            else if (t.includes('زیندەزانی')) autoSubject = 'زیندەزانی';
            else if (t.includes('فیزیا')) autoSubject = 'فیزیا';
            else if (t.includes('کیمیا')) autoSubject = 'کیمیا';
        }
        // =============================================

        // دانانی داتا بۆ فلتەرکردن
        card.setAttribute('data-year', pdf.year || '');
        card.setAttribute('data-term', pdf.term || '');
        card.setAttribute('data-subject', autoSubject); // ← لێرە وانە دۆزراوەکە دادەنێین
        
        // ناوەڕۆکی کارتەکە
        card.innerHTML = `
            <div class="pdf-card-icon"><i class="fas fa-file-pdf"></i></div>
            <div class="pdf-card-content">
                <div class="pdf-card-title">${pdf.title}</div>
                <div class="pdf-card-meta">
                    <span><i class="fas fa-calendar"></i> ${pdf.year}</span>
                    <span><i class="fas fa-layer-group"></i> ${pdf.term}</span>
                    <span style="color:var(--primary); font-weight:bold;">
                        <i class="fas fa-book"></i> ${autoSubject || 'گشتی'}
                    </span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openPDFViewer(pdf));
        container.appendChild(card);
    });
}



// ========== PDF Viewer (Iframe + Download Button) ==========
function openPDFViewer(pdf) {
    const viewer = document.createElement('div');
    viewer.className = 'pdf-viewer';
    viewer.innerHTML = `
        <div class="pdf-viewer-header">
            <button class="pdf-close-btn" id="pdf-close-btn">
                <i class="fas fa-arrow-right"></i>
                <span style="font-family: UniSIRWAN Qabas">گەڕانەوە</span>
            </button>
            <h3 class="pdf-viewer-title">${pdf.title}</h3>
        </div>
        
        <div class="pdf-viewer-content">
            <iframe 
                src="${pdf.url}" 
                class="pdf-iframe"
                frameborder="0"
            ></iframe>
        </div>

        <div class="pdf-viewer-footer">
            <a href="${pdf.url}" download="${pdf.title}" class="pdf-download-btn" target="_blank">
                <i class="fas fa-download"></i>
                داگرتنی فایل
            </a>
        </div>
    `;
    
    document.body.appendChild(viewer);
    document.body.classList.add('pdf-viewing');

    // داخستن
    document.getElementById('pdf-close-btn').addEventListener('click', closePDFViewer);
}

function closePDFViewer() {
    const viewer = document.querySelector('.pdf-viewer');
    if (viewer) {
        viewer.classList.add('closing');
        setTimeout(() => {
            viewer.remove();
            document.body.classList.remove('pdf-viewing');
        }, 300);
    }
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closePDFViewer();
    }
}
