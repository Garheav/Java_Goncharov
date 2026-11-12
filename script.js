/* ================= ТЕМА ================= */
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

/* ================= ПЕРЕКЛЮЧЕНИЕ НАПРАВЛЕНИЙ ================= */
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
    if (typeof accTimerInterval !== 'undefined' && accTimerInterval) {
        clearInterval(accTimerInterval);
        accTimerInterval = null;
    }
    if (typeof accTestActive !== 'undefined') accTestActive = false;

    document.getElementById('javaApp').style.display = 'none';
    document.getElementById('accountingApp').style.display = 'none';
    document.getElementById('landingScreen').style.display = 'flex';
    window.scrollTo(0, 0);
}

/* ================= ВКЛАДКИ (общая логика) ================= */
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

/* ================= JAVA APP (шаблон) ================= */
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
