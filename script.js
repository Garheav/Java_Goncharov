// ========== ПРОГРЕСС ОБУЧЕНИЯ ==========
let openedDocs = JSON.parse(localStorage.getItem("openedJavaDocs") || "[]");
const allDocs = [...lectures.map(l => ({ id: `lec_${l.id}` })), ...labsList.map(l => ({ id: `lab_${l.name}` }))];

function markDocOpened(docId) {
    if (!openedDocs.includes(docId)) {
        openedDocs.push(docId);
        localStorage.setItem("openedJavaDocs", JSON.stringify(openedDocs));
        updateGlobalProgress();
    }
}

function updateGlobalProgress() {
    const progress = Math.round((openedDocs.length / allDocs.length) * 100);
    const fill = document.getElementById("globalProgressFill");
    const text = document.getElementById("globalProgressText");
    if (fill) fill.style.width = progress + "%";
    if (text) text.innerText = `Открыто ${openedDocs.length} из ${allDocs.length} документов (${progress}%)`;
}

// ========== ОТРИСОВКА ЛЕКЦИЙ И ЛАБ ==========
function renderLecturesGrid(filtered = lectures) {
    const container = document.getElementById("lecturesGrid");
    if (!container) return;
    container.innerHTML = filtered.map((lec) => `
        <div class="card" onclick="openLecture(${lectures.findIndex(l => l.id === lec.id)}, false)">
            <div class="card-title">${escapeHtml(lec.name)} <small>PDF</small></div>
        </div>
    `).join('');
}

function renderLabsGrid() {
    const container = document.getElementById("labsGrid");
    if (!container) return;
    container.innerHTML = labsList.map((lab, idx) => `
        <div class="card" onclick="openLab(${idx})">
            <div class="card-title">${escapeHtml(lab.name)} <small>PDF</small></div>
        </div>
    `).join('');
}

// ========== ЛЕКЦИИ ==========
function openLecture(index, showLab) {
    const lec = lectures[index];
    if (!lec) return;
    markDocOpened(`lec_${lec.id}`);
    window.currentLectureIndex = index;
    window.currentLectureLabMode = showLab;
    const file = showLab ? lec.labFile : lec.file;
    const title = showLab ? `Лабораторная работа к ${lec.name}` : lec.name;
    document.getElementById("lectureFrame").src = file;
    document.getElementById("currentLectureTitle").innerText = `${title} (лекция ${index+1} из ${lectures.length})`;
    document.getElementById("openLabFromLecture").innerHTML = showLab ? '<i class="fas fa-book"></i> Вернуться к лекции' : '<i class="fas fa-flask"></i> Лабораторная';
    document.getElementById("lecturesList").style.display = "none";
    document.getElementById("lectureViewer").style.display = "block";
}
function closeLectureViewer() { document.getElementById("lecturesList").style.display = "block"; document.getElementById("lectureViewer").style.display = "none"; document.getElementById("lectureFrame").src = ""; }
function prevLecture() { if (window.currentLectureIndex > 0) openLecture(window.currentLectureIndex-1, false); else alert("Первая лекция"); }
function nextLecture() { if (window.currentLectureIndex+1 < lectures.length) openLecture(window.currentLectureIndex+1, false); else alert("Последняя лекция"); }
function toggleLab() { openLecture(window.currentLectureIndex, !window.currentLectureLabMode); }

// ========== ЛАБОРАТОРНЫЕ ==========
function openLab(index) {
    const lab = labsList[index];
    markDocOpened(`lab_${lab.name}`);
    window.currentLabIndex = index;
    document.getElementById("labFrame").src = lab.file;
    document.getElementById("currentLabTitle").innerText = `${lab.name} (${index+1} из ${labsList.length})`;
    document.getElementById("labsList").style.display = "none";
    document.getElementById("labViewer").style.display = "block";
}
function closeLabViewer() { document.getElementById("labsList").style.display = "block"; document.getElementById("labViewer").style.display = "none"; document.getElementById("labFrame").src = ""; }
function prevLab() { if (window.currentLabIndex > 0) openLab(window.currentLabIndex-1); else alert("Первая работа"); }
function nextLab() { if (window.currentLabIndex+1 < labsList.length) openLab(window.currentLabIndex+1); else alert("Последняя работа"); }
function enterFullscreen(elementId) {
    const el = document.getElementById(elementId);
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

// ========== ТЕСТ JAVA ==========
let testActive = false;
let timerInterval = null;
let remainingSeconds = TEST_DURATION_SECONDS;
let currentQuestionIndex = 0;
let userAnswers = [];

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const timerSpan = document.getElementById("timerSpan");
    if (timerSpan) {
        timerSpan.innerText = formatTime(remainingSeconds);
        if (remainingSeconds <= 60) timerSpan.classList.add("timer-danger");
        else timerSpan.classList.remove("timer-danger");
    }
}

function finishTest() {
    if (timerInterval) clearInterval(timerInterval);
    if (testActive) {
        testActive = false;
        finalizeTest();
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!testActive) return;
        if (remainingSeconds <= 1) {
            remainingSeconds = 0;
            updateTimerDisplay();
            finishTest();
        } else {
            remainingSeconds--;
            updateTimerDisplay();
        }
    }, 1000);
}

function renderTestStartPage() {
    const container = document.getElementById("testContainer");
    if (!container) return;
    container.innerHTML = `
        <div class="test-start">
            <h2>📝 Итоговый тест по курсу Java</h2>
            <p>Перед прохождением теста рекомендуется полностью изучить курс: лекции, лабораторные работы и проект «Аграрный калькулятор».</p>
            <p><strong>Правила:</strong></p>
            <ul>
                <li>Тест состоит из 33 вопросов (открытые, одиночный выбор, множественный выбор, сопоставления).</li>
                <li>На выполнение отводится <strong>45 минут</strong>.</li>
                <li>После истечения времени тест завершится автоматически, будут показаны результаты.</li>
                <li>Вы можете сохранить результат в файл и посмотреть правильные ответы.</li>
                <li>Отвеченные вопросы отмечаются зелёным цветом.</li>
            </ul>
            <button class="start-test-btn" id="startTestBtn"><i class="fas fa-play"></i> Начать тестирование</button>
        </div>
    `;
    document.getElementById("startTestBtn")?.addEventListener("click", () => { startTest(); });
}

function startTest() {
    testActive = true;
    remainingSeconds = TEST_DURATION_SECONDS;
    userAnswers = [];
    currentQuestionIndex = 0;
    renderTestQuestions();
    startTimer();
}

function renderTestQuestions() {
    const container = document.getElementById("testContainer");
    container.innerHTML = `
        <div class="test-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div class="timer-area">
                    <i class="fas fa-hourglass-half"></i> Осталось: <span id="timerSpan">${formatTime(remainingSeconds)}</span>
                </div>
                <button id="abortTestBtn" class="btn-secondary" style="background: #6c757d;">❌ Прервать тест</button>
            </div>
            <div class="test-questions-bar">
                <div class="question-list-horizontal" id="questionListHorizontal"></div>
            </div>
            <div class="q-main">
                <div id="qContent"></div>
                <div class="test-nav">
                    <button id="prevQBtn" class="nav-btn"><i class="fas fa-arrow-left"></i> Назад</button>
                    <button id="nextQBtn" class="nav-btn">Далее <i class="fas fa-arrow-right"></i></button>
                </div>
                <div id="testResultArea"></div>
            </div>
        </div>
    `;
    renderQuestionBar();
    loadQuestion(currentQuestionIndex);
    document.getElementById("prevQBtn").addEventListener("click", () => navigateQuestion(-1));
    document.getElementById("nextQBtn").addEventListener("click", () => navigateQuestion(1));
    document.getElementById("abortTestBtn").addEventListener("click", () => {
        if (confirm("Вы уверены, что хотите прервать тест? Прогресс не сохранится.")) {
            if (timerInterval) clearInterval(timerInterval);
            testActive = false;
            renderTestStartPage();
        }
    });
}

function isQuestionAnswered(idx) {
    const q = testQuestions[idx];
    const ans = userAnswers[idx]?.answer;
    if (!ans) return false;
    if (q.type === "open") return ans.trim() !== "";
    if (q.type === "single") return ans !== undefined;
    if (q.type === "multi") return Array.isArray(ans) && ans.length > 0;
    if (q.type === "matching" || q.type === "matching2") return Array.isArray(ans) && ans.length === q.pairs.length && ans.every(v => v !== "");
    return false;
}

function saveCurrentAnswer() {
    const q = testQuestions[currentQuestionIndex];
    let answer = null;
    const contentDiv = document.getElementById("qContent");
    if (!contentDiv) return;
    if (q.type === "open") {
        const inp = contentDiv.querySelector("input[type=text]");
        if (inp) answer = inp.value.trim();
    } else if (q.type === "single") {
        const selected = contentDiv.querySelector("input[type=radio]:checked");
        if (selected) answer = selected.value;
    } else if (q.type === "multi") {
        const checks = contentDiv.querySelectorAll("input[type=checkbox]:checked");
        answer = Array.from(checks).map(cb => cb.value);
    } else if (q.type === "matching" || q.type === "matching2") {
        const selects = contentDiv.querySelectorAll("select");
        answer = Array.from(selects).map(s => s.value);
        if (answer.some(v => v === "")) answer = null;
    }
    if (answer !== undefined && answer !== null && (typeof answer !== "string" || answer !== "")) {
        userAnswers[currentQuestionIndex] = { answer, isCorrect: false };
    } else {
        delete userAnswers[currentQuestionIndex];
    }
    renderQuestionBar();
}

function renderQuestionBar() {
    const bar = document.getElementById("questionListHorizontal");
    if (!bar) return;
    bar.innerHTML = testQuestions.map((_, idx) => `
        <div class="q-item-h ${idx === currentQuestionIndex ? 'active' : ''} ${isQuestionAnswered(idx) ? 'answered' : ''}" data-qidx="${idx}">
            ${idx+1}
        </div>
    `).join('');
    document.querySelectorAll(".q-item-h").forEach(el => {
        el.addEventListener("click", () => {
            saveCurrentAnswer();
            currentQuestionIndex = parseInt(el.dataset.qidx);
            loadQuestion(currentQuestionIndex);
            renderQuestionBar();
        });
    });
}

function loadQuestion(idx) {
    const q = testQuestions[idx];
    const contentDiv = document.getElementById("qContent");
    if (!contentDiv) return;
    let html = `<div class="question-text">${idx+1}. ${escapeHtml(q.text)}</div><div class="options">`;
    if (q.type === "open") {
        let val = userAnswers[idx]?.answer || "";
        html += `<input type="text" id="openAns" value="${escapeHtml(val)}" placeholder="Ваш ответ" style="width:100%">`;
    } else if (q.type === "single") {
        q.options.forEach(opt => {
            let checked = (userAnswers[idx]?.answer === opt) ? "checked" : "";
            html += `<label><input type="radio" name="single" value="${escapeHtml(opt)}" ${checked}> ${escapeHtml(opt)}</label>`;
        });
    } else if (q.type === "multi") {
        q.options.forEach(opt => {
            let checked = (userAnswers[idx]?.answer && userAnswers[idx].answer.includes(opt)) ? "checked" : "";
            html += `<label><input type="checkbox" value="${escapeHtml(opt)}" ${checked}> ${escapeHtml(opt)}</label>`;
        });
    } else if (q.type === "matching" || q.type === "matching2") {
        q.pairs.forEach((pair, i) => {
            let selected = (userAnswers[idx]?.answer && userAnswers[idx].answer[i]) || "";
            html += `<div class="matching-row"><div class="matching-left">${pair.left}</div><select data-pairidx="${i}">`;
            html += `<option value="">--выберите--</option>`;
            q.pairs.forEach(p => {
                html += `<option value="${escapeHtml(p.right)}" ${selected === p.right ? "selected" : ""}>${escapeHtml(p.right)}</option>`;
            });
            html += `</select></div>`;
        });
    }
    html += `</div>`;
    contentDiv.innerHTML = html;
    if (q.type === "open") {
        contentDiv.querySelector("input")?.addEventListener("input", () => saveCurrentAnswer());
    } else if (q.type === "single" || q.type === "multi") {
        contentDiv.querySelectorAll("input").forEach(inp => inp.addEventListener("change", () => saveCurrentAnswer()));
    } else if (q.type === "matching" || q.type === "matching2") {
        contentDiv.querySelectorAll("select").forEach(sel => sel.addEventListener("change", () => saveCurrentAnswer()));
    }
}

function navigateQuestion(delta) {
    saveCurrentAnswer();
    const newIdx = currentQuestionIndex + delta;
    if (newIdx >= 0 && newIdx < testQuestions.length) {
        currentQuestionIndex = newIdx;
        loadQuestion(currentQuestionIndex);
        renderQuestionBar();
    } else if (newIdx === testQuestions.length) {
        finishTest();
    }
}

function finalizeTest() {
    if (timerInterval) clearInterval(timerInterval);
    testActive = false;
    saveCurrentAnswer();
    let correctCount = 0;
    for (let i = 0; i < testQuestions.length; i++) {
        const q = testQuestions[i];
        const userAns = userAnswers[i]?.answer;
        if (!userAns) continue;
        let isCor = false;
        if (q.type === "open") {
            if (q.correct.some(c => normalize(userAns) === normalize(c))) isCor = true;
        } else if (q.type === "single") {
            if (userAns === q.correct) isCor = true;
        } else if (q.type === "multi") {
            if (Array.isArray(userAns) && userAns.length === q.correct.length && q.correct.every(v => userAns.includes(v))) isCor = true;
        } else if (q.type === "matching" || q.type === "matching2") {
            let ok = true;
            for (let j = 0; j < q.pairs.length; j++) {
                if (userAns[j] !== q.pairs[j].right) ok = false;
            }
            if (ok) isCor = true;
        }
        if (isCor) {
            if (userAnswers[i]) userAnswers[i].isCorrect = true;
            correctCount++;
        } else if (userAnswers[i]) {
            userAnswers[i].isCorrect = false;
        }
    }
    const percent = Math.round(correctCount / testQuestions.length * 100);
    let grade = percent >= 75 ? "5 (отлично)" : percent >= 65 ? "4 (хорошо)" : percent >= 51 ? "3 (удовлетворительно)" : "2 (неудовлетворительно)";
    const container = document.getElementById("testContainer");
    container.innerHTML = `
        <div class="test-wrapper">
            <div class="q-main">
                <div class="result-area">
                    <div class="score">${correctCount} из ${testQuestions.length}</div>
                    <div>Процент: ${percent}%</div>
                    <div>Оценка: ${grade}</div>
                    <button id="showAnswersBtn" class="btn-primary"><i class="fas fa-list"></i> Показать правильные ответы</button>
                    <button id="saveResultBtn" class="btn-secondary"><i class="fas fa-save"></i> Сохранить результат</button>
                    <button id="restartTestBtn" class="btn-secondary"><i class="fas fa-redo-alt"></i> Пройти тест заново</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById("showAnswersBtn")?.addEventListener("click", () => showAnswersModal());
    document.getElementById("saveResultBtn")?.addEventListener("click", () => saveTestResult(correctCount, percent, grade));
    document.getElementById("restartTestBtn")?.addEventListener("click", () => {
        if (timerInterval) clearInterval(timerInterval);
        renderTestStartPage();
    });
}

function normalize(s) { return s.trim().toLowerCase().replace(/[^a-zа-я0-9]/g, ''); }

function showAnswersModal() {
    const answersDiv = document.getElementById("answersList");
    answersDiv.innerHTML = testQuestions.map((q, i) => {
        const userAns = userAnswers[i]?.answer;
        const userStr = userAns ? (Array.isArray(userAns) ? userAns.join(", ") : userAns) : "(не отвечено)";
        const correctStr = q.correctDisplay || (q.correct ? (Array.isArray(q.correct) ? q.correct.join(", ") : q.correct) : "");
        const isCor = userAnswers[i]?.isCorrect || false;
        return `<div class="answer-item">
            <strong>${i+1}. ${escapeHtml(q.text)}</strong><br>
            <span>Ваш ответ: ${escapeHtml(userStr)}</span><br>
            <span class="${isCor ? 'answer-correct' : 'answer-wrong'}">Правильный ответ: ${escapeHtml(correctStr)}</span><br>
            <span>${isCor ? "✓ Верно" : "✗ Неверно"}</span>
        </div>`;
    }).join('');
    document.getElementById("answersModal").style.display = "flex";
}

function saveTestResult(correctCount, percent, grade) {
    const content = `Результат теста по Java\n${correctCount} из ${testQuestions.length}\nПроцент: ${percent}%\nОценка: ${grade}\nДата: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], {type: "text/plain"});
    saveAs(blob, "результат_теста_java.txt");
}

function initTest() { renderTestStartPage(); }

// ========== ПОИСК ЛЕКЦИЙ ==========
document.getElementById("lectureSearch")?.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = lectures.filter(l => l.name.toLowerCase().includes(val));
    renderLecturesGrid(filtered);
});
document.getElementById("clearLectureSearch")?.addEventListener("click", () => {
    document.getElementById("lectureSearch").value = "";
    renderLecturesGrid(lectures);
});

// ========== ВКЛАДКИ ==========
function showTab(tabId) {
    document.querySelectorAll('.content-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    if (tabId === "test") initTest();
}
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
});

// ========== ТЁМНАЯ/СВЕТЛАЯ ТЕМА ==========
document.getElementById("themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const icon = document.querySelector("#themeToggle i");
    if (document.body.classList.contains("light-theme")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }
});

// ========== ПРОЧИЕ ОБРАБОТЧИКИ ==========
document.getElementById("prevLectureBtn")?.addEventListener("click", prevLecture);
document.getElementById("nextLectureBtn")?.addEventListener("click", nextLecture);
document.getElementById("openLabFromLecture")?.addEventListener("click", toggleLab);
document.getElementById("backToLecturesList")?.addEventListener("click", closeLectureViewer);
document.getElementById("prevLabBtn")?.addEventListener("click", prevLab);
document.getElementById("nextLabBtn")?.addEventListener("click", nextLab);
document.getElementById("backToLabsList")?.addEventListener("click", closeLabViewer);
document.getElementById("lectureFullscreen")?.addEventListener("click", () => enterFullscreen("lectureFrame"));
document.getElementById("labFullscreen")?.addEventListener("click", () => enterFullscreen("labFrame"));

document.getElementById("openPlanBtn")?.addEventListener("click", () => {
    window.open("Учебный план.pdf", "_blank");
});

document.getElementById("downloadAllBtn")?.addEventListener("click", async () => {
    const zip = new JSZip();
    const filesSet = new Set([...lectures.map(l => l.file), ...labsList.map(l => l.file), "Учебный план.pdf"]);
    let loaded = false;
    for (let file of filesSet) {
        try {
            const response = await fetch(file);
            if (response.ok) {
                const blob = await response.blob();
                zip.file(file, blob);
                loaded = true;
            }
        } catch(e) {}
    }
    if (!loaded) {
        alert("Не удалось загрузить ни одного файла. Убедитесь, что PDF-файлы находятся в папке с сайтом.");
        return;
    }
    const content = await zip.generateAsync({type:"blob"});
    saveAs(content, "java_course_materials.zip");
});

document.querySelector(".close-modal-btn")?.addEventListener("click", () => document.getElementById("answersModal").style.display = "none");

// ========== ИНИЦИАЛИЗАЦИЯ ==========
renderLecturesGrid(lectures);
renderLabsGrid();
initTest();
updateGlobalProgress();

window.openLecture = openLecture;
window.openLab = openLab;
window.prevLecture = prevLecture;
window.nextLecture = nextLecture;
window.prevLab = prevLab;
window.nextLab = nextLab;
window.toggleLab = toggleLab;
window.closeLectureViewer = closeLectureViewer;
window.closeLabViewer = closeLabViewer;
window.enterFullscreen = enterFullscreen;

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}


// ============================================================
// ========== ДОБАВЛЕНО: ЭКРАН ВЫБОРА =========================
// ============================================================

function showJavaApp() {
    document.getElementById('landingScreen').classList.remove('visible');
    document.getElementById('javaApp').style.display = 'block';
    document.getElementById('accountingApp').style.display = 'none';
    document.getElementById('backToLandingBtn').classList.add('visible');
    window.scrollTo(0, 0);
}

function showAccountingApp() {
    document.getElementById('landingScreen').classList.remove('visible');
    document.getElementById('javaApp').style.display = 'none';
    document.getElementById('accountingApp').style.display = 'block';
    document.getElementById('backToLandingBtn').classList.add('visible');
    initAccounting();
    window.scrollTo(0, 0);
}

function backToLanding() {
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;
    document.getElementById('landingScreen').classList.add('visible');
    document.getElementById('javaApp').style.display = 'none';
    document.getElementById('accountingApp').style.display = 'none';
    document.getElementById('backToLandingBtn').classList.remove('visible');
    window.scrollTo(0, 0);
}


// ============================================================
// ========== ДОБАВЛЕНО: УЧЁТ ЗАТРАТ ==========================
// ============================================================

let accInitialized = false;

function initAccounting() {
    if (accInitialized) return;
    accInitialized = true;

    // Вкладки
    document.querySelectorAll('.acc-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.acc-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.acc-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const pane = document.getElementById(btn.dataset.accTab);
            if (pane) pane.classList.add('active');
        });
    });

    renderAccTheory();
    renderAccTestStart();
    renderAccTasks();
}

/* ---- Теория ---- */
function renderAccTheory() {
    const c = document.getElementById('acc-theory');
    if (!c) return;
    c.innerHTML = accountingTheory.map(b =>
        `<div class="acc-theory-block"><h3>${b.title}</h3><p>${b.text}</p></div>`
    ).join('');
}

/* ---- Тест ---- */
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

function renderAccTestStart() {
    const c = document.getElementById('accTestContainer');
    if (!c) return;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;
    c.innerHTML = `
        <div class="acc-test-start">
            <h2>📝 Тест: управленческий учёт затрат</h2>
            <p>Проверка знаний теории управленческого учёта в растениеводстве.</p>
            <p><strong>Правила:</strong></p>
            <ul>
                <li>Типы вопросов: одиночный выбор, множественный выбор, открытый ответ.</li>
                <li>Количество вопросов: ${ACC_QUESTION_COUNT} (случайная выборка из базы).</li>
                <li>Время на выполнение: <strong>30 минут</strong>.</li>
                <li>Отвеченные вопросы отмечаются зелёным.</li>
            </ul>
            <button class="start-test-btn" onclick="startAccTest()"><i class="fas fa-play"></i> Начать тест</button>
        </div>
    `;
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
    c.innerHTML = `
        <div class="acc-test-card">
            <div class="acc-test-header">
                <span id="accTimerDisplay" class="acc-timer-area">Осталось: 30:00</span>
                <button class="acc-btn acc-btn-secondary" onclick="abortAccTest()">Прервать</button>
            </div>
            <div class="acc-qnav" id="accQuestionNav"></div>
            <div class="acc-qmain">
                <div id="accQuestionContent"></div>
            </div>
        </div>
    `;
    renderAccQNav();
    loadAccQuestion(0);
}

function renderAccQNav() {
    const nav = document.getElementById('accQuestionNav');
    if (!nav) return;
    nav.innerHTML = accCurrentQuestions.map((_, i) => {
        const ans = accUserAnswers[i];
        const answered = ans !== undefined && ans !== null && (Array.isArray(ans) ? ans.length > 0 : String(ans).trim() !== '');
        const cls = (i === accCurrentIdx ? 'active ' : '') + (answered ? 'answered' : '');
        return `<button class="acc-qnav-btn ${cls}" onclick="loadAccQuestion(${i})">${i + 1}</button>`;
    }).join('');
}

function loadAccQuestion(idx) {
    if (idx < 0 || idx >= accCurrentQuestions.length) return;
    accCurrentIdx = idx;
    const q = accCurrentQuestions[idx];
    const c = document.getElementById('accQuestionContent');
    let html = `<div class="acc-question-text">Вопрос ${idx + 1}. ${escapeHtml(q.text)}</div><div class="acc-options">`;
    if (q.type === 'single') {
        q.options.forEach(opt => {
            const checked = accUserAnswers[idx] === opt;
            html += `<label class="acc-option ${checked ? 'selected' : ''}">
                <input type="radio" name="accq_${idx}" ${checked ? 'checked' : ''} onchange="saveAccAnswer(${idx}, this.value)" value="${escapeHtml(opt)}">
                <span>${escapeHtml(opt)}</span>
            </label>`;
        });
    } else if (q.type === 'multi') {
        const arr = Array.isArray(accUserAnswers[idx]) ? accUserAnswers[idx] : [];
        q.options.forEach(opt => {
            const checked = arr.includes(opt);
            html += `<label class="acc-option ${checked ? 'selected' : ''}">
                <input type="checkbox" ${checked ? 'checked' : ''} onchange="saveAccMultiAnswer(${idx}, this.value, this.checked)" value="${escapeHtml(opt)}">
                <span>${escapeHtml(opt)}</span>
            </label>`;
        });
    } else {
        const v = typeof accUserAnswers[idx] === 'string' ? accUserAnswers[idx] : '';
        html += `<input type="text" class="acc-open-input" placeholder="Введите ответ..." value="${escapeHtml(v)}" oninput="saveAccAnswer(${idx}, this.value)">`;
    }
    html += `</div><div class="acc-test-nav">
        <button class="acc-btn acc-btn-secondary" onclick="navigateAcc(-1)" ${idx === 0 ? 'disabled' : ''}>← Назад</button>
        ${idx === accCurrentQuestions.length - 1
            ? `<button class="acc-btn" onclick="finishAccTest()">Завершить тест</button>`
            : `<button class="acc-btn" onclick="navigateAcc(1)">Далее →</button>`}
    </div>`;
    c.innerHTML = html;
    renderAccQNav();
    updateAccTimer();
}

function saveAccAnswer(idx, val) {
    accUserAnswers[idx] = val;
    document.querySelectorAll('#accQuestionContent .acc-option').forEach(l => {
        const inp = l.querySelector('input');
        l.classList.toggle('selected', inp && inp.checked);
    });
    renderAccQNav();
}

function saveAccMultiAnswer(idx, val, checked) {
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

function navigateAcc(delta) {
    const n = accCurrentIdx + delta;
    if (n >= 0 && n < accCurrentQuestions.length) loadAccQuestion(n);
}

function abortAccTest() {
    if (!confirm('Прервать тест? Прогресс не сохранится.')) return;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    accTestActive = false;
    renderAccTestStart();
}

function finishAccTest() {
    if (!accTestActive) return;
    accTestActive = false;
    if (accTimerInterval) { clearInterval(accTimerInterval); accTimerInterval = null; }
    let correct = 0;
    const details = accCurrentQuestions.map((q, i) => {
        const ok = checkAccAnswer(q, accUserAnswers[i]);
        if (ok) correct++;
        return { q, ua: accUserAnswers[i], ok };
    });
    const total = accCurrentQuestions.length;
    const score = total ? Math.round(correct / total * 100) : 0;
    let html = `<div class="acc-test-card">
        <div class="acc-result-area">
            <h2>Результат</h2>
            <div class="acc-result-score">${correct} из ${total} (${score}%)</div>
            <button class="acc-btn" onclick="renderAccTestStart()">Пройти заново</button>
        </div>
    </div><div class="acc-test-card"><h3>Разбор ответов</h3>`;
    details.forEach((d, i) => {
        const cls = d.ok ? 'ok' : 'fail';
        const ua = Array.isArray(d.ua) ? (d.ua.length ? d.ua.join(', ') : '—')
                 : (d.ua && String(d.ua).trim() !== '' ? d.ua : '—');
        html += `<div class="acc-result-item ${cls}">
            <p><strong>${i + 1}. ${escapeHtml(d.q.text)}</strong></p>
            <p>Ваш ответ: ${escapeHtml(ua)}</p>
            <p>Правильный: ${escapeHtml(d.q.correctDisplay)}</p>
        </div>`;
    });
    html += `</div>`;
    document.getElementById('accTestContainer').innerHTML = html;
}

function checkAccAnswer(q, ua) {
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

/* ---- Задачи ---- */
function renderAccTasks() {
    const c = document.getElementById('accTasksContainer');
    if (!c) return;
    c.innerHTML = accountingTasks.map((t, i) => `
        <div class="acc-task">
            <h3>${escapeHtml(t.title)}</h3>
            <p>${escapeHtml(t.condition).replace(/\n/g, '<br>')}</p>
            <button class="acc-btn acc-btn-secondary" onclick="document.getElementById('acc-sol-${i}').classList.toggle('visible')">
                Показать / скрыть решение
            </button>
            <div id="acc-sol-${i}" class="acc-solution">
                <p><strong>Решение:</strong></p>
                <p>${escapeHtml(t.solution).replace(/\n/g, '<br>')}</p>
            </div>
        </div>
    `).join('');
}
