// ---------- Прогресс обучения ----------
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

// ---------- Рендер лекций и лабораторных ----------
function renderLecturesGrid(filtered = lectures) {
    const container = document.getElementById("lecturesGrid");
    container.innerHTML = filtered.map((lec, idx) => `
        <div class="card" onclick="openLecture(${lectures.findIndex(l => l.id === lec.id)}, false)">
            <div class="card-title">${escapeHtml(lec.name)} <small>PDF</small></div>
        </div>
    `).join('');
}

function renderLabsGrid() {
    const container = document.getElementById("labsGrid");
    container.innerHTML = labsList.map((lab, idx) => `
        <div class="card" onclick="openLab(${idx})">
            <div class="card-title">${escapeHtml(lab.name)} <small>PDF</small></div>
        </div>
    `).join('');
}

// ---------- Лекции ----------
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

// ---------- Лабораторные ----------
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

// ---------- Полноэкранный режим ----------
function enterFullscreen(elementId) {
    const el = document.getElementById(elementId);
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

// ---------- Тест (пошаговый, отметка только если ответ не пустой) ----------
let currentQuestionIndex = 0;
let userAnswers = [];

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
    } else if (q.type === "matching") {
        q.pairs.forEach((pair, i) => {
            let selected = (userAnswers[idx]?.answer && userAnswers[idx].answer[i]) || "";
            html += `<div class="matching-row"><div class="matching-left">${pair.left}</div><select data-pairidx="${i}">`;
            html += `<option value="">--выберите--</option>`;
            q.pairs.forEach(p => {
                html += `<option value="${escapeHtml(p.right)}" ${selected === p.right ? "selected" : ""}>${escapeHtml(p.right)}</option>`;
            });
            html += `</select></div>`;
        });
    } else if (q.type === "matching2") {
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
        finalizeTest();
    }
}

function finalizeTest() {
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
        if (isCor) { userAnswers[i].isCorrect = true; correctCount++; }
        else if (userAnswers[i]) userAnswers[i].isCorrect = false;
    }
    const percent = Math.round(correctCount / testQuestions.length * 100);
    let grade = percent>=75 ? "5 (отлично)" : percent>=65 ? "4 (хорошо)" : percent>=51 ? "3 (удовлетворительно)" : "2 (неудовлетворительно)";
    document.getElementById("testResultArea").innerHTML = `
        <div class="result-area">
            <div class="score">${correctCount} из ${testQuestions.length}</div>
            <div>Процент: ${percent}%</div>
            <div>Оценка: ${grade}</div>
            <button id="showAnswersBtn" class="btn-primary"><i class="fas fa-list"></i> Показать правильные ответы</button>
            <button id="saveResultBtn" class="btn-secondary"><i class="fas fa-save"></i> Сохранить результат</button>
        </div>
    `;
    document.getElementById("showAnswersBtn")?.addEventListener("click", showAnswersModal);
    document.getElementById("saveResultBtn")?.addEventListener("click", saveTestResult);
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

function saveTestResult() {
    const scoreDiv = document.querySelector("#testResultArea .score");
    if (!scoreDiv) { alert("Сначала завершите тест!"); return; }
    const scoreText = scoreDiv.innerText;
    const percentDiv = document.querySelector("#testResultArea div:nth-child(2)")?.innerText || "";
    const gradeDiv = document.querySelector("#testResultArea div:nth-child(3)")?.innerText || "";
    const content = `Результат теста по Java\n${scoreText}\n${percentDiv}\n${gradeDiv}\nДата: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], {type: "text/plain"});
    saveAs(blob, "результат_теста_java.txt");
}

function renderTest() {
    const container = document.getElementById("testContainer");
    container.innerHTML = `
        <div class="test-wrapper">
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
    currentQuestionIndex = 0;
    userAnswers = [];
    renderQuestionBar();
    loadQuestion(0);
    document.getElementById("prevQBtn").addEventListener("click", () => navigateQuestion(-1));
    document.getElementById("nextQBtn").addEventListener("click", () => navigateQuestion(1));
}

// ---------- Поиск лекций ----------
document.getElementById("lectureSearch")?.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const filtered = lectures.filter(l => l.name.toLowerCase().includes(val));
    renderLecturesGrid(filtered);
});
document.getElementById("clearLectureSearch")?.addEventListener("click", () => {
    document.getElementById("lectureSearch").value = "";
    renderLecturesGrid(lectures);
});

// ---------- Вкладки ----------
function showTab(tabId) {
    document.querySelectorAll('.content-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
});

// ---------- Тёмная/светлая тема ----------
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

// ---------- Инициализация и обработчики ----------
window.renderTest = renderTest;
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

document.getElementById("prevLectureBtn")?.addEventListener("click", prevLecture);
document.getElementById("nextLectureBtn")?.addEventListener("click", nextLecture);
document.getElementById("openLabFromLecture")?.addEventListener("click", toggleLab);
document.getElementById("backToLecturesList")?.addEventListener("click", closeLectureViewer);
document.getElementById("prevLabBtn")?.addEventListener("click", prevLab);
document.getElementById("nextLabBtn")?.addEventListener("click", nextLab);
document.getElementById("backToLabsList")?.addEventListener("click", closeLabViewer);
document.getElementById("lectureFullscreen")?.addEventListener("click", () => enterFullscreen("lectureFrame"));
document.getElementById("labFullscreen")?.addEventListener("click", () => enterFullscreen("labFrame"));

// Открытие учебного плана с переключением вкладки
document.getElementById("openPlanBtn")?.addEventListener("click", () => {
    const planIndex = labsList.findIndex(l => l.name === "Учебный план курса");
    if (planIndex !== -1) {
        showTab("labs");
        openLab(planIndex);
    } else {
        alert("Учебный план не найден");
    }
});

// Кнопка скачивания всех материалов (ZIP)
document.getElementById("downloadAllBtn")?.addEventListener("click", async () => {
    try {
        const zip = new JSZip();
        const filesSet = new Set([...lectures.map(l => l.file), ...labsList.map(l => l.file), "Учебный план.pdf"]);
        let loaded = 0;
        for (let file of filesSet) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const blob = await response.blob();
                    zip.file(file, blob);
                    loaded++;
                } else {
                    console.warn(`Файл не найден: ${file}`);
                }
            } catch (e) {
                console.warn(`Ошибка загрузки ${file}:`, e);
            }
        }
        if (loaded === 0) {
            alert("Не удалось загрузить ни одного файла. Убедитесь, что PDF-файлы находятся в той же папке, что и index.html.");
            return;
        }
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "java_course_materials.zip");
    } catch (err) {
        console.error(err);
        alert("Ошибка создания архива. Проверьте консоль.");
    }
});

document.querySelector(".close-modal-btn")?.addEventListener("click", () => document.getElementById("answersModal").style.display = "none");

renderLecturesGrid(lectures);
renderLabsGrid();
renderTest();
updateGlobalProgress();

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}