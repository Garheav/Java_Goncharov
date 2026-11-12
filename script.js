/* ============ ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ ============ */
function showJavaApp() {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('javaApp').style.display = 'block';
    document.getElementById('accountingApp').style.display = 'none';
    document.getElementById('backToLandingBtn').style.display = 'block';
    window.scrollTo(0, 0);
    initJavaTest();
}

function showAccountingApp() {
    document.getElementById('landingScreen').style.display = 'none';
    document.getElementById('javaApp').style.display = 'none';
    document.getElementById('accountingApp').style.display = 'block';
    document.getElementById('backToLandingBtn').style.display = 'block';
    window.scrollTo(0, 0);
    initAccounting();
}

function backToLanding() {
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;
    document.getElementById('landingScreen').style.display = 'flex';
    document.getElementById('javaApp').style.display = 'none';
    document.getElementById('accountingApp').style.display = 'none';
    document.getElementById('backToLandingBtn').style.display = 'none';
    window.scrollTo(0, 0);
}

/* ============ JAVA: простой тест (замени своим) ============ */
let javaInitDone = false;
let javaIdx = 0;
let javaAnswers = [];

function initJavaTest() {
    if (javaInitDone) return;
    javaInitDone = true;
    renderJavaStart();
}

function renderJavaStart() {
    const c = document.getElementById('javaTestContainer');
    if (!c) return;
    c.innerHTML = `<div class="acc-test-card">
        <p>Вопросов: ${javaQuestions.length}</p>
        <button class="acc-btn" onclick="startJavaTest()">Начать тест</button>
    </div>`;
}

function startJavaTest() {
    javaIdx = 0;
    javaAnswers = new Array(javaQuestions.length).fill(null);
    renderJavaQuestion();
}

function renderJavaQuestion() {
    const q = javaQuestions[javaIdx];
    const c = document.getElementById('javaTestContainer');
    let html = `<div class="acc-test-card"><h3>Вопрос ${javaIdx + 1} из ${javaQuestions.length}</h3><p>${q.text}</p>`;
    q.options.forEach((opt, i) => {
        const checked = javaAnswers[javaIdx] === i;
        html += `<label class="acc-option ${checked ? 'selected' : ''}">
            <input type="radio" name="jq" ${checked ? 'checked' : ''} onchange="saveJavaAnswer(${i})">
            <span>${opt}</span></label>`;
    });
    html += `<div style="display:flex; gap:8px; margin-top:14px;">
        <button class="acc-btn acc-btn-secondary" onclick="navJava(-1)" ${javaIdx === 0 ? 'disabled' : ''}>← Назад</button>
        ${javaIdx === javaQuestions.length - 1
            ? `<button class="acc-btn" onclick="finishJavaTest()">Завершить</button>`
            : `<button class="acc-btn" onclick="navJava(1)">Далее →</button>`}
    </div></div>`;
    c.innerHTML = html;
}

function saveJavaAnswer(i) {
    javaAnswers[javaIdx] = i;
    document.querySelectorAll('#javaTestContainer .acc-option').forEach((l, idx) => {
        l.classList.toggle('selected', idx === i);
    });
}

function navJava(d) {
    const n = javaIdx + d;
    if (n >= 0 && n < javaQuestions.length) { javaIdx = n; renderJavaQuestion(); }
}

function finishJavaTest() {
    let ok = 0;
    javaQuestions.forEach((q, i) => { if (javaAnswers[i] === q.correct) ok++; });
    const total = javaQuestions.length;
    const score = total ? Math.round(ok / total * 100) : 0;
    document.getElementById('javaTestContainer').innerHTML = `<div class="acc-test-card">
        <h2>Результат</h2>
        <p>Правильных: <strong>${ok} из ${total}</strong></p>
        <p class="acc-score">${score}%</p>
        <button class="acc-btn" onclick="renderJavaStart()">Пройти заново</button>
    </div>`;
}

/* ============ УЧЁТ ЗАТРАТ ============ */
let accInitDone = false;

function initAccounting() {
    if (accInitDone) return;
    accInitDone = true;
    document.querySelectorAll('#accountingApp .acc-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#accountingApp .acc-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#accountingApp .acc-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const pane = document.getElementById(btn.dataset.accTab);
            if (pane) pane.classList.add('active');
            if (btn.dataset.accTab === 'acc-test') renderAccStart();
            if (btn.dataset.accTab === 'acc-tasks') renderAccTasks();
        });
    });
    renderAccTheory();
    renderAccStart();
}

function renderAccTheory() {
    const c = document.getElementById('acc-theory');
    if (!c) return;
    c.innerHTML = accountingTheory.map(b =>
        `<div class="acc-block"><h3>${b.title}</h3><p>${b.text}</p></div>`
    ).join('');
}

/* --- ТЕСТ УЧЁТА --- */
let accTestActive = false;
let accCurrentQuestions = [];
let accUserAnswers = [];
let accCurrentIdx = 0;
let accTimerInterval = null;
let accRemainingSeconds = 1800;
const ACC_QUESTION_COUNT = 5;

function accShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function renderAccStart() {
    const c = document.getElementById('accTestContainer');
    if (!c) return;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;
    c.innerHTML = `<div class="acc-test-card">
        <h2>Тест: управленческий учёт затрат</h2>
        <p>Вопросов: ${ACC_QUESTION_COUNT} (случайная выборка). Время: 30 мин.</p>
        <p>Типы: одиночный, множественный выбор, открытый ответ.</p>
        <button class="acc-btn" onclick="startAccTest()" style="margin-top:14px;">Начать тест</button>
    </div>`;
}

function startAccTest() {
    accTestActive = true;
    accRemainingSeconds = 1800;
    accUserAnswers = [];
    accCurrentIdx = 0;
    const sh = accShuffle(accountingTestQuestions);
    accCurrentQuestions = sh.slice(0, Math.min(ACC_QUESTION_COUNT, sh.length));
    renderAccTestUI();
    if (accTimerInterval) clearInterval(accTimerInterval);
    accTimerInterval = setInterval(() => {
        if (!accTestActive) return;
        accRemainingSeconds--;
        updateAccTimer();
        if (accRemainingSeconds <= 0) finishAccTest();
    }, 1000);
}

function updateAccTimer() {
    const el = document.getElementById('accTimerDisplay');
    if (!el) return;
    const m = Math.floor(accRemainingSeconds / 60);
    const s = accRemainingSeconds % 60;
    el.innerText = `Осталось: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderAccTestUI() {
    const c = document.getElementById('accTestContainer');
    c.innerHTML = `<div class="acc-test-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <span id="accTimerDisplay" class="acc-timer">Осталось: 30:00</span>
            <button class="acc-btn acc-btn-secondary" onclick="abortAccTest()">Прервать</button>
        </div>
        <div class="acc-qnav" id="accQuestionNav"></div>
        <div id="accQuestionContent"></div>
    </div>`;
    renderAccQNav();
    loadAccQuestion(0);
}

function renderAccQNav() {
    const nav = document.getElementById('accQuestionNav');
    if (!nav) return;
    nav.innerHTML = accCurrentQuestions.map((_, i) => {
        const ans = accUserAnswers[i];
        const answered = ans !== undefined && ans !== null && (Array.isArray(ans) ? ans.length > 0 : String(ans).trim() !== '');
        const cls = (i === accCurrentIdx ? 'current ' : '') + (answered ? 'answered' : '');
        return `<button class="acc-qnav-btn ${cls}" onclick="loadAccQuestion(${i})">${i + 1}</button>`;
    }).join('');
}

function loadAccQuestion(idx) {
    if (idx < 0 || idx >= accCurrentQuestions.length) return;
    accCurrentIdx = idx;
    const q = accCurrentQuestions[idx];
    const c = document.getElementById('accQuestionContent');
    let html = `<h3>Вопрос ${idx + 1}. ${q.text}</h3><div style="margin-top:12px;">`;
    if (q.type === 'single') {
        q.options.forEach(opt => {
            const checked = accUserAnswers[idx] === opt;
            html += `<label class="acc-option ${checked ? 'selected' : ''}">
                <input type="radio" name="accq" ${checked ? 'checked' : ''} onchange="saveAccAnswer(${idx}, this.value)" value="${esc(opt)}">
                <span>${opt}</span></label>`;
        });
    } else if (q.type === 'multi') {
        const arr = Array.isArray(accUserAnswers[idx]) ? accUserAnswers[idx] : [];
        q.options.forEach(opt => {
            const checked = arr.includes(opt);
            html += `<label class="acc-option ${checked ? 'selected' : ''}">
                <input type="checkbox" ${checked ? 'checked' : ''} onchange="saveAccMulti(${idx}, this.value, this.checked)" value="${esc(opt)}">
                <span>${opt}</span></label>`;
        });
    } else {
        const v = typeof accUserAnswers[idx] === 'string' ? accUserAnswers[idx] : '';
        html += `<input type="text" class="acc-input" placeholder="Введите ответ..." value="${esc(v)}" oninput="saveAccAnswer(${idx}, this.value)">`;
    }
    html += `</div><div style="display:flex; gap:8px; margin-top:16px; flex-wrap:wrap;">
        <button class="acc-btn acc-btn-secondary" onclick="navAcc(-1)" ${idx === 0 ? 'disabled' : ''}>← Назад</button>
        ${idx === accCurrentQuestions.length - 1
            ? `<button class="acc-btn" onclick="finishAccTest()">Завершить</button>`
            : `<button class="acc-btn" onclick="navAcc(1)">Далее →</button>`}
    </div>`;
    c.innerHTML = html;
    renderAccQNav();
    updateAccTimer();
}

function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function saveAccAnswer(idx, val) {
    accUserAnswers[idx] = val;
    document.querySelectorAll('#accQuestionContent .acc-option').forEach(l => {
        const inp = l.querySelector('input');
        l.classList.toggle('selected', inp && inp.checked);
    });
    renderAccQNav();
}

function saveAccMulti(idx, val, checked) {
    if (!Array.isArray(accUserAnswers[idx])) accUserAnswers[idx] = [];
    const arr = accUserAnswers[idx];
    if (checked) { if (!arr.includes(val)) arr.push(val); }
    else { const p = arr.indexOf(val); if (p > -1) arr.splice(p, 1); }
    document.querySelectorAll('#accQuestionContent .acc-option').forEach(l => {
        const inp = l.querySelector('input');
        l.classList.toggle('selected', inp && inp.checked);
    });
    renderAccQNav();
}

function navAcc(d) {
    const n = accCurrentIdx + d;
    if (n >= 0 && n < accCurrentQuestions.length) loadAccQuestion(n);
}

function abortAccTest() {
    if (!confirm('Прервать тест?')) return;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;
    renderAccStart();
}

function finishAccTest() {
    if (!accTestActive) return;
    accTestActive = false;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    let correct = 0;
    const details = accCurrentQuestions.map((q, i) => {
        const ok = checkAcc(q, accUserAnswers[i]);
        if (ok) correct++;
        return { q, ua: accUserAnswers[i], ok };
    });
    const total = accCurrentQuestions.length;
    const score = total ? Math.round(correct / total * 100) : 0;
    let html = `<div class="acc-test-card">
        <h2>Результат</h2>
        <p>Правильных: <strong>${correct} из ${total}</strong></p>
        <p class="acc-score">${score}%</p>
        <button class="acc-btn" onclick="renderAccStart()">Пройти заново</button>
    </div><div class="acc-test-card"><h3>Разбор</h3>`;
    details.forEach((d, i) => {
        const cls = d.ok ? 'acc-result-ok' : 'acc-result-fail';
        const ua = Array.isArray(d.ua) ? (d.ua.length ? d.ua.join(', ') : '—')
                 : (d.ua && String(d.ua).trim() !== '' ? d.ua : '—');
        html += `<div class="acc-result-item ${cls}">
            <p><strong>${i + 1}. ${d.q.text}</strong></p>
            <p>Ваш ответ: ${ua}</p>
            <p>Правильный: ${d.q.correctDisplay}</p>
        </div>`;
    });
    html += `</div>`;
    document.getElementById('accTestContainer').innerHTML = html;
}

function checkAcc(q, ua) {
    if (ua === undefined || ua === null) return false;
    if (q.type === 'single') return String(ua).trim() === String(q.correct).trim();
    if (q.type === 'multi') {
        if (!Array.isArray(ua) || ua.length !== q.correct.length) return false;
        return q.correct.every(x => ua.includes(x));
    }
    if (q.type === 'open') {
        const n = String(ua).trim().toLowerCase();
        return q.correct.some(c => n === c.toLowerCase().trim());
    }
    return false;
}

/* --- ЗАДАЧИ --- */
function renderAccTasks() {
    const c = document.getElementById('accTasksContainer');
    if (!c) return;
    c.innerHTML = accountingTasks.map((t, i) => `
        <div class="acc-task">
            <h3>${t.title}</h3>
            <p>${t.condition.replace(/\n/g, '<br>')}</p>
            <button class="acc-btn acc-btn-secondary" style="margin-top:12px;"
                onclick="document.getElementById('acc-sol-${i}').classList.toggle('visible')">
                Показать / скрыть решение
            </button>
            <div id="acc-sol-${i}" class="acc-solution">
                <p><strong>Решение:</strong></p>
                <p>${t.solution.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
    `).join('');
}
