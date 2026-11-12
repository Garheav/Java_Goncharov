/* ===== ТЕМА ===== */
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    document.querySelectorAll('.theme-toggle i').forEach(icon => {
        icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    });
}

(function restoreTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.add('light-theme');
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.theme-toggle i').forEach(icon => {
                icon.className = 'fas fa-sun';
            });
        });
    }
})();

/* ===== ПЕРЕКЛЮЧЕНИЕ НАПРАВЛЕНИЙ ===== */
function selectDirection(direction) {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('javaApp').style.display = 'none';
    document.getElementById('accountingApp').style.display = 'none';

    if (direction === 'java') {
        document.getElementById('javaApp').style.display = 'block';
        initJavaApp();
    } else if (direction === 'accounting') {
        document.getElementById('accountingApp').style.display = 'block';
        initAccountingApp();
    }
    window.scrollTo(0, 0);
}

function backToLanding() {
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;

    document.getElementById('javaApp').style.display = 'none';
    document.getElementById('accountingApp').style.display = 'none';
    document.getElementById('landingScreen').style.display = 'flex';
    window.scrollTo(0, 0);
}

/* ===== ВКЛАДКИ ===== */
function setupTabs(tabsContainerId, appContainerId) {
    const tabs = document.querySelectorAll(`#${tabsContainerId} .tab-btn`);
    const panes = document.querySelectorAll(`#${appContainerId} .content-pane`);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            if (target) target.classList.add('active');

            if (tab.dataset.tab === 'java-test') renderJavaTestStart();
            if (tab.dataset.tab === 'acc-test') renderAccTestStartPage();
            if (tab.dataset.tab === 'acc-tasks') renderAccountingTasks();
        });
    });
}

/* ============================================================
   JAVA APP (шаблон)
   ============================================================ */
let javaInitialized = false;

function initJavaApp() {
    if (!javaInitialized) {
        setupTabs('javaTabs', 'javaApp');
        javaInitialized = true;
    }
    renderJavaTestStart();
}

let javaCurrentQuestions = [];
let javaUserAnswers = [];
let javaCurrentIdx = 0;

function renderJavaTestStart() {
    const container = document.getElementById('javaTestContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="test-card">
            <h2>Тест по Java</h2>
            <p>Проверьте базовые знания языка Java.</p>
            <p>Вопросов: ${javaQuestions.length}</p>
            <button class="choice-btn" onclick="startJavaTest()" style="margin-top: 15px;">Начать тест</button>
        </div>
    `;
}

function startJavaTest() {
    javaCurrentQuestions = [...javaQuestions];
    javaUserAnswers = new Array(javaCurrentQuestions.length).fill(null);
    javaCurrentIdx = 0;
    renderJavaQuestion();
}

function renderJavaQuestion() {
    const container = document.getElementById('javaTestContainer');
    const q = javaCurrentQuestions[javaCurrentIdx];
    let html = `<div class="test-card">
        <div class="test-header">
            <span class="timer">Вопрос ${javaCurrentIdx + 1} из ${javaCurrentQuestions.length}</span>
        </div>
        <h3>${q.text}</h3>
        <div style="margin-top: 15px;">`;
    q.options.forEach((opt, i) => {
        const selected = javaUserAnswers[javaCurrentIdx] === i ? 'selected' : '';
        html += `<label class="option-label ${selected}">
            <input type="radio" name="java_q" value="${i}" ${javaUserAnswers[javaCurrentIdx] === i ? 'checked' : ''}
                onchange="saveJavaAnswer(${i})">
            <span>${opt}</span>
        </label>`;
    });
    html += `</div><div class="test-nav">
        <button class="choice-btn" onclick="navigateJava(-1)" ${javaCurrentIdx === 0 ? 'disabled' : ''}
            style="background: var(--card); color: var(--text); border: 1px solid var(--border);">Назад</button>
        ${javaCurrentIdx === javaCurrentQuestions.length - 1
            ? `<button class="choice-btn" onclick="finishJavaTest()">Завершить</button>`
            : `<button class="choice-btn" onclick="navigateJava(1)">Далее</button>`}
    </div></div>`;
    container.innerHTML = html;
}

function saveJavaAnswer(value) {
    javaUserAnswers[javaCurrentIdx] = parseInt(value);
}

function navigateJava(delta) {
    const next = javaCurrentIdx + delta;
    if (next >= 0 && next < javaCurrentQuestions.length) {
        javaCurrentIdx = next;
        renderJavaQuestion();
    }
}

function finishJavaTest() {
    let correct = 0;
    javaCurrentQuestions.forEach((q, i) => {
        if (javaUserAnswers[i] === q.correct) correct++;
    });
    const total = javaCurrentQuestions.length;
    const score = total ? Math.round(correct / total * 100) : 0;
    document.getElementById('javaTestContainer').innerHTML = `
        <div class="test-card">
            <h2>Результат теста по Java</h2>
            <p>Правильных ответов: <strong>${correct} из ${total}</strong></p>
            <p class="score-big">${score}%</p>
            <button class="choice-btn" onclick="renderJavaTestStart()">Пройти заново</button>
        </div>
    `;
}

/* ============================================================
   ACCOUNTING APP (Учёт затрат)
   ============================================================ */
let accountingInitialized = false;

function initAccountingApp() {
    if (!accountingInitialized) {
        setupTabs('accountingTabs', 'accountingApp');
        accountingInitialized = true;
    }
    renderAccTestStartPage();
}

/* ===== УТИЛИТЫ ===== */
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ===== ТЕСТ: СТАРТ ===== */
let accTestActive = false;
let accCurrentQuestions = [];
let accUserAnswers = [];
let accCurrentIdx = 0;
let accTimerInterval = null;
let accRemainingSeconds = 1800;
const ACC_QUESTION_COUNT = 5;

function renderAccTestStartPage() {
    const container = document.getElementById('accTestContainer');
    if (!container) return;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;

    container.innerHTML = `
        <div class="test-card">
            <h2>Тест: Управленческий учёт затрат в растениеводстве</h2>
            <p>Вопросы выбираются случайным образом из базы.</p>
            <ul>
                <li>Типы вопросов: одиночный выбор, множественный выбор, открытый ответ.</li>
                <li>Время на выполнение: 30 минут.</li>
                <li>Количество вопросов: ${ACC_QUESTION_COUNT} (случайная выборка).</li>
            </ul>
            <button class="choice-btn" onclick="startAccTest()">Начать тест</button>
        </div>
    `;
}

/* ===== ТЕСТ: ЗАПУСК ===== */
function startAccTest() {
    accTestActive = true;
    accRemainingSeconds = 1800;
    accUserAnswers = [];
    accCurrentIdx = 0;

    const shuffled = shuffleArray(accountingTestQuestions);
    accCurrentQuestions = shuffled.slice(0, Math.min(ACC_QUESTION_COUNT, shuffled.length));

    renderAccTestUI();
    startAccTimer();
}

function startAccTimer() {
    if (accTimerInterval) clearInterval(accTimerInterval);
    updateAccTimerDisplay();
    accTimerInterval = setInterval(() => {
        if (!accTestActive) return;
        accRemainingSeconds--;
        if (accRemainingSeconds <= 0) {
            accRemainingSeconds = 0;
            updateAccTimerDisplay();
            finishAccTest();
            return;
        }
        updateAccTimerDisplay();
    }, 1000);
}

function updateAccTimerDisplay() {
    const el = document.getElementById('accTimerDisplay');
    if (!el) return;
    const m = Math.floor(accRemainingSeconds / 60);
    const s = accRemainingSeconds % 60;
    el.innerText = `Осталось: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ===== ТЕСТ: РЕНДЕР ===== */
function renderAccTestUI() {
    const container = document.getElementById('accTestContainer');
    container.innerHTML = `
        <div class="test-card">
            <div class="test-header">
                <span id="accTimerDisplay" class="timer">Осталось: 30:00</span>
                <button class="back-to-landing" onclick="abortAccTest()">Прервать тест</button>
            </div>
            <div id="accQuestionNav" class="question-nav"></div>
            <div id="accQuestionContent"></div>
        </div>
    `;
    renderAccQuestionBar();
    loadAccQuestion(0);
}

function renderAccQuestionBar() {
    const bar = document.getElementById('accQuestionNav');
    if (!bar) return;
    bar.innerHTML = accCurrentQuestions.map((_, i) => {
        const answered = isAnswered(accUserAnswers[i]);
        const current = i === accCurrentIdx ? 'current' : '';
        const answeredCls = answered ? 'answered' : '';
        return `<button class="qnav-btn ${answeredCls} ${current}" onclick="loadAccQuestion(${i})">${i + 1}</button>`;
    }).join('');
}

function isAnswered(ans) {
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    return String(ans).trim() !== '';
}

/* ===== ТЕСТ: ВОПРОС ===== */
function loadAccQuestion(idx) {
    if (idx < 0 || idx >= accCurrentQuestions.length) return;
    accCurrentIdx = idx;
    const q = accCurrentQuestions[idx];
    const content = document.getElementById('accQuestionContent');
    if (!content) return;

    let html = `<h3>Вопрос ${idx + 1}. ${q.text}</h3><div style="margin-top: 15px;">`;

    if (q.type === 'single') {
        q.options.forEach(opt => {
            const sel = accUserAnswers[idx] === opt ? 'selected' : '';
            html += `<label class="option-label ${sel}">
                <input type="radio" name="acc_q_${idx}" value="${escapeAttr(opt)}"
                    ${accUserAnswers[idx] === opt ? 'checked' : ''}
                    onchange="saveAccAnswer(${idx}, this.value)">
                <span>${opt}</span>
            </label>`;
        });
    } else if (q.type === 'multi') {
        q.options.forEach(opt => {
            const arr = Array.isArray(accUserAnswers[idx]) ? accUserAnswers[idx] : [];
            const checked = arr.includes(opt);
            const sel = checked ? 'selected' : '';
            html += `<label class="option-label ${sel}">
                <input type="checkbox" name="acc_q_${idx}" value="${escapeAttr(opt)}"
                    ${checked ? 'checked' : ''}
                    onchange="saveAccMultiAnswer(${idx}, this.value, this.checked)">
                <span>${opt}</span>
            </label>`;
        });
    } else if (q.type === 'open') {
        const val = typeof accUserAnswers[idx] === 'string' ? accUserAnswers[idx] : '';
        html += `<input type="text" class="open-input" placeholder="Введите ответ..."
                    value="${escapeAttr(val)}"
                    oninput="saveAccAnswer(${idx}, this.value)">`;
    }

    html += `</div><div class="test-nav">
        <button class="choice-btn" onclick="navigateAccQuestion(-1)" ${idx === 0 ? 'disabled' : ''}
            style="background: var(--card); color: var(--text); border: 1px solid var(--border);">
            <i class="fas fa-arrow-left"></i> Назад</button>
        ${idx === accCurrentQuestions.length - 1
            ? `<button class="choice-btn" onclick="finishAccTest()">Завершить тест</button>`
            : `<button class="choice-btn" onclick="navigateAccQuestion(1)">Далее <i class="fas fa-arrow-right"></i></button>`}
    </div>`;

    content.innerHTML = html;
    renderAccQuestionBar();
    updateAccTimerDisplay();
}

function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ===== ТЕСТ: СОХРАНЕНИЕ ОТВЕТОВ ===== */
function saveAccAnswer(idx, value) {
    accUserAnswers[idx] = value;
    const q = accCurrentQuestions[idx];
    if (q.type === 'single') {
        const labels = document.querySelectorAll(`#accQuestionContent .option-label`);
        labels.forEach(label => {
            const input = label.querySelector('input');
            if (input && input.checked) label.classList.add('selected');
            else label.classList.remove('selected');
        });
    }
    renderAccQuestionBar();
}

function saveAccMultiAnswer(idx, value, isChecked) {
    if (!Array.isArray(accUserAnswers[idx])) accUserAnswers[idx] = [];
    const arr = accUserAnswers[idx];
    if (isChecked) {
        if (!arr.includes(value)) arr.push(value);
    } else {
        const pos = arr.indexOf(value);
        if (pos > -1) arr.splice(pos, 1);
    }
    const labels = document.querySelectorAll(`#accQuestionContent .option-label`);
    labels.forEach(label => {
        const input = label.querySelector('input');
        if (input && input.checked) label.classList.add('selected');
        else label.classList.remove('selected');
    });
    renderAccQuestionBar();
}

/* ===== ТЕСТ: НАВИГАЦИЯ ===== */
function navigateAccQuestion(delta) {
    const next = accCurrentIdx + delta;
    if (next >= 0 && next < accCurrentQuestions.length) loadAccQuestion(next);
}

function abortAccTest() {
    if (!confirm('Прервать тест? Прогресс не сохранится.')) return;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;
    renderAccTestStartPage();
}

/* ===== ТЕСТ: ЗАВЕРШЕНИЕ ===== */
function finishAccTest() {
    if (!accTestActive) return;
    accTestActive = false;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }

    let correctCount = 0;
    const details = accCurrentQuestions.map((q, idx) => {
        const ok = checkAccAnswer(q, accUserAnswers[idx]);
        if (ok) correctCount++;
        return { q, userAns: accUserAnswers[idx], ok };
    });

    const total = accCurrentQuestions.length;
    const score = total ? Math.round(correctCount / total * 100) : 0;

    let html = `
        <div class="test-card">
            <h2>Результат теста</h2>
            <p>Правильных ответов: <strong>${correctCount} из ${total}</strong></p>
            <p class="score-big">${score}%</p>
            <button class="choice-btn" onclick="renderAccTestStartPage()">Пройти заново</button>
        </div>
        <div class="test-card">
            <h3>Разбор ответов</h3>
    `;

    details.forEach((d, idx) => {
        const cls = d.ok ? 'result-correct' : 'result-wrong';
        const userStr = Array.isArray(d.userAns)
            ? (d.userAns.length ? d.userAns.join(', ') : '—')
            : (d.userAns && String(d.userAns).trim() !== '' ? d.userAns : '—');
        html += `
            <div class="result-item ${cls}">
                <p><strong>${idx + 1}. ${d.q.text}</strong></p>
                <p>Ваш ответ: ${userStr}</p>
                <p>Правильный ответ: ${d.q.correctDisplay}</p>
            </div>
        `;
    });

    html += `</div>`;
    document.getElementById('accTestContainer').innerHTML = html;
}

function checkAccAnswer(q, userAnswer) {
    if (userAnswer === undefined || userAnswer === null) return false;
    if (q.type === 'single') {
        return String(userAnswer).trim() === String(q.correct).trim();
    }
    if (q.type === 'multi') {
        if (!Array.isArray(userAnswer)) return false;
        const correctArr = q.correct;
        if (userAnswer.length !== correctArr.length) return false;
        return correctArr.every(item => userAnswer.includes(item));
    }
    if (q.type === 'open') {
        if (!Array.isArray(q.correct)) return false;
        const normalized = String(userAnswer).trim().toLowerCase();
        return q.correct.some(c => normalized === c.toLowerCase().trim());
    }
    return false;
}

/* ===== ЗАДАЧИ ===== */
function renderAccountingTasks() {
    const container = document.getElementById('accTasksContainer');
    if (!container) return;

    let html = `<h2 style="margin-bottom: 20px;">Практические задачи по учёту затрат</h2>`;
    accountingTasks.forEach((task, i) => {
        html += `
            <div class="task-card">
                <h3>${task.title}</h3>
                <p>${task.condition.replace(/\n/g, '<br>')}</p>
                <button class="choice-btn" style="margin-top: 15px; padding: 10px 20px;"
                    onclick="toggleTaskSolution(${i})">
                    <i class="fas fa-eye"></i> Показать / скрыть решение
                </button>
                <div id="task-solution-${i}" class="task-solution">
                    <p><strong>Решение:</strong></p>
                    <p>${task.solution.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function toggleTaskSolution(i) {
    const el = document.getElementById(`task-solution-${i}`);
    if (el) el.classList.toggle('visible');
}
