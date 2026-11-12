// ========== ЛЕКЦИИ ==========
const lectures = [
    { id: 1, name: "Лекция 1. Основные понятия, принципы и особенности Java", file: "Лекция 1.pdf", labFile: "Лаба 1.pdf" },
    { id: 2, name: "Лекция 2. Написание простых программ с логическими конструкциями", file: "Лекция 2.pdf", labFile: "Лаба 2.pdf" },
    { id: 3, name: "Лекция 3. Изучение ветвления (if, switch, тернарный)", file: "Лекция 3.pdf", labFile: "Лаба 3.pdf" },
    { id: 4, name: "Лекция 4. Изучение циклов (for, while, do-while)", file: "Лекция 4.pdf", labFile: "Лаба 4.pdf" },
    { id: 5, name: "Лекция 5. Одномерные и двумерные массивы", file: "Лекция 5.pdf", labFile: "Лаба 5.pdf" },
    { id: 6, name: "Лекция 6. Строки (String, StringBuilder)", file: "Лекция 6.pdf", labFile: "Лаба 6.pdf" },
    { id: 7, name: "Лекция 7. Файлы (чтение и запись)", file: "Лекция 7.pdf", labFile: "Лаба 7.pdf" },
    { id: 8, name: "Лекция 8. Методы (подпрограммы)", file: "Лекция 8.pdf", labFile: "Лаба 8.pdf" }
];

// ========== ЛАБОРАТОРНЫЕ РАБОТЫ (без учебного плана) ==========
const labsList = [
    { name: "Лабораторная работа 1", file: "Лаба 1.pdf", type: "lab", num: 1 },
    { name: "Лабораторная работа 2", file: "Лаба 2.pdf", type: "lab", num: 2 },
    { name: "Лабораторная работа 3", file: "Лаба 3.pdf", type: "lab", num: 3 },
    { name: "Лабораторная работа 4", file: "Лаба 4.pdf", type: "lab", num: 4 },
    { name: "Лабораторная работа 5", file: "Лаба 5.pdf", type: "lab", num: 5 },
    { name: "Лабораторная работа 6", file: "Лаба 6.pdf", type: "lab", num: 6 },
    { name: "Лабораторная работа 7", file: "Лаба 7.pdf", type: "lab", num: 7 },
    { name: "Лабораторная работа 8", file: "Лаба 8.pdf", type: "lab", num: 8 },
    { name: "Аграрный калькулятор – Занятие 1", file: "Аграрный калькулятор занятие 1.pdf", type: "project", num: 1 },
    { name: "Аграрный калькулятор – Занятие 2", file: "Аграрный калькулятор занятие 2.pdf", type: "project", num: 2 },
    { name: "Аграрный калькулятор – Занятие 3", file: "Аграрный калькулятор занятие 3.pdf", type: "project", num: 3 },
    { name: "Вопросы для самопроверки", file: "Вопросы.pdf", type: "theory" }
];

// ========== ПАРАМЕТРЫ ТЕСТА ==========
const TEST_DURATION_SECONDS = 2700; // 45 минут

// ========== ВОПРОСЫ ТЕСТА (33 вопроса) ==========
const testQuestions = [
    { type: "open", text: "Принцип Java, означающий «написал однажды – работает везде», называется ________.", correct: ["WORA", "Write Once Run Anywhere"], correctDisplay: "WORA (Write Once Run Anywhere)" },
    { type: "single", text: "Что входит в JDK, но отсутствует в JRE?", options: ["A) JVM", "B) Компилятор javac", "C) Стандартные библиотеки", "D) Среда выполнения"], correct: "B", correctDisplay: "B) Компилятор javac" },
    { type: "multi", text: "Какие утверждения о методе main верны?", options: ["Может иметь любое имя", "Должен быть public static void", "Может возвращать int", "Параметр – String[] args", "Точка входа"], correct: ["Должен быть public static void","Параметр – String[] args","Точка входа"], correctDisplay: "public static void; String[] args; точка входа" },
    { type: "open", text: "Тип для целых чисел от -128 до 127 – это ________.", correct: ["byte"], correctDisplay: "byte" },
    { type: "single", text: "Значение по умолчанию локальной переменной int?", options: ["A) 0", "B) null", "C) Ошибка компиляции", "D) -1"], correct: "C", correctDisplay: "Ошибка компиляции" },
    { type: "multi", text: "Какие типы ссылочные?", options: ["int", "String", "double", "Массив int[]", "boolean"], correct: ["String","Массив int[]"], correctDisplay: "String, Массив int[]" },
    { type: "open", text: "Оператор остатка от деления – ________.", correct: ["%"], correctDisplay: "%" },
    { type: "single", text: "Результат 10 + 3 * 2?", options: ["A) 26", "B) 16", "C) 26.0", "D) 23"], correct: "B", correctDisplay: "16" },
    { type: "single", text: "Неявное расширение – это:", options: ["A) double → int", "B) int → double", "C) String → int", "D) int → byte"], correct: "B", correctDisplay: "int → double" },
    { type: "open", text: "Логический оператор 'И' – ________.", correct: ["&&"], correctDisplay: "&&" },
    { type: "multi", text: "Операторы сравнения для чисел:", options: ["==", "equals()", ">", "<=", "==="], correct: ["==",">","<="], correctDisplay: "==, >, <=" },
    { type: "open", text: "Конструкция условие ? значение1 : значение2 называется ________ оператором.", correct: ["тернарный"], correctDisplay: "тернарный" },
    { type: "single", text: "Что будет без break в switch?", options: ["Ошибка", "Только свой case", "Провал в следующий case", "Выполнится default"], correct: "Провал в следующий case", correctDisplay: "провал в следующий case" },
    { type: "multi", text: "Типы для switch (до 14):", options: ["int", "double", "char", "String", "boolean"], correct: ["int","char","String"], correctDisplay: "int, char, String" },
    { type: "open", text: "Оператор для выбора из 5+ значений – ________.", correct: ["switch"], correctDisplay: "switch" },
    { type: "single", text: "int x = (5>3)?10:20; чему равно x?", options: ["5","3","10","20"], correct: "10", correctDisplay: "10" },
    { type: "open", text: "Цикл, выполняющийся хотя бы один раз – ________.", correct: ["do-while"], correctDisplay: "do-while" },
    { type: "single", text: "Итераций for(int i=0;i<3;i++)?", options: ["0","1","2","3"], correct: "3", correctDisplay: "3" },
    { type: "multi", text: "Управление циклом:", options: ["break","exit","continue","return","stop"], correct: ["break","continue"], correctDisplay: "break, continue" },
    { type: "open", text: "Ключевое слово пропуска итерации – ________.", correct: ["continue"], correctDisplay: "continue" },
    { type: "single", text: "int i=0; while(i<2){System.out.print(i++);} вывод?", options: ["0","01","012","бесконечно"], correct: "01", correctDisplay: "01" },
    { type: "open", text: "Свойство длины массива – ________.", correct: ["length"], correctDisplay: "length" },
    { type: "single", text: "arr[3]=5 при int[3] arr – что будет?", options: ["Запишет", "Ошибка компиляции", "ArrayIndexOutOfBoundsException", "Расширение"], correct: "ArrayIndexOutOfBoundsException", correctDisplay: "ArrayIndexOutOfBoundsException" },
    { type: "multi", text: "Верные способы объявления массива:", options: ["int[] a = new int[5];","int a[] = new int[5];","int[5] a;","int[] a = {1,2,3};","int a = new int[5];"], correct: ["int[] a = new int[5];","int a[] = new int[5];","int[] a = {1,2,3};"], correctDisplay: "три варианта" },
    { type: "open", text: "Цикл перебора массива без индекса – ________.", correct: ["for-each"], correctDisplay: "for-each" },
    { type: "single", text: "m={{1,2},{3,4,5}}; длина строки 1?", options: ["2","3","4","5"], correct: "3", correctDisplay: "3" },
    { type: "open", text: "Метод сравнения строк без учёта регистра – ________.", correct: ["equalsIgnoreCase"], correctDisplay: "equalsIgnoreCase" },
    { type: "single", text: "Как сравнить строки по содержимому?", options: ["==","equals()","compare()","="], correct: "equals()", correctDisplay: "equals()" },
    { type: "multi", text: "Верно про String:", options: ["Неизменяемы","Меняются через charAt","Примитив","StringBuilder быстрее","Ссылочный тип"], correct: ["Неизменяемы","StringBuilder быстрее","Ссылочный тип"], correctDisplay: "неизменяемы, StringBuilder быстрее, ссылочный" },
    { type: "open", text: "Метод StringBuilder для добавления – ________.", correct: ["append"], correctDisplay: "append" },
    {
        type: "matching",
        text: "Сопоставьте понятие и описание:",
        pairs: [
            { left: "JVM", right: "Виртуальная машина Java" },
            { left: "JDK", right: "Java Development Kit" },
            { left: "JRE", right: "Среда выполнения Java" },
            { left: "WORA", right: "Write Once Run Anywhere" }
        ],
        correctDisplay: "JVM → Виртуальная машина; JDK → Kit; JRE → Среда; WORA → Write Once"
    },
    {
        type: "matching2",
        text: "Сопоставьте тип и размер:",
        pairs: [
            { left: "int", right: "4 байта" },
            { left: "double", right: "8 байт" },
            { left: "char", right: "2 байта" },
            { left: "long", right: "8 байт" },
            { left: "byte", right: "1 байт" }
        ],
        correctDisplay: "int→4; double→8; char→2; long→8; byte→1"
    },
    { type: "open", text: "Конструкция, автоматически закрывающая ресурсы – ________.", correct: ["try-with-resources"], correctDisplay: "try-with-resources" }
];
// ========== ДАННЫЕ ДЛЯ УЧЁТА ЗАТРАТ В РАСТЕНИЕВОДСТВЕ ==========

// Вопросы для теста (будут рандомизироваться)
const accountingTestQuestions = [
    {
        type: "single",
        text: "Что является объектом учёта затрат в растениеводстве?",
        options: ["A) Бухгалтерская отчётность", "B) Культура, поле, севооборот", "C) Прибыль организации", "D) Налоговая декларация"],
        correct: "B",
        correctDisplay: "B) Культура, поле, севооборот"
    },
    {
        type: "single",
        text: "Какая особенность НЕ характерна для растениеводства?",
        options: ["A) Сезонность", "B) Длительный производственный цикл", "C) Полная независимость от погоды", "D) Наличие незавершённого производства"],
        correct: "C",
        correctDisplay: "C) Полная независимость от погоды"
    },
    {
        type: "multi",
        text: "Какие затраты относятся к прямым в растениеводстве?",
        options: ["Семена", "Удобрения", "Амортизация здания управления", "Оплата труда трактористов"],
        correct: ["Семена", "Удобрения", "Оплата труда трактористов"],
        correctDisplay: "Семена, удобрения, оплата труда трактористов"
    },
    {
        type: "single",
        text: "Что такое калькуляционная единица?",
        options: ["A) Единица измерения продукции для расчёта себестоимости", "B) Единица налогового учёта", "C) Показатель рентабельности", "D) Норма расхода материала"],
        correct: "A",
        correctDisplay: "A) Единица измерения продукции для расчёта себестоимости"
    },
    {
        type: "open",
        text: "Метод учёта затрат, основанный на сравнении фактических затрат с нормативами, называется ________.",
        correct: ["нормативный"],
        correctDisplay: "нормативный"
    },
    {
        type: "single",
        text: "Какая группировка затрат показывает, «что израсходовано»?",
        options: ["A) По статьям калькуляции", "B) По экономическим элементам", "C) По центрам ответственности", "D) По видам продукции"],
        correct: "B",
        correctDisplay: "B) По экономическим элементам"
    },
    {
        type: "multi",
        text: "Выберите методы калькулирования себестоимости:",
        options: ["Простой", "Нормативный", "ABC-метод", "Коэффициентный"],
        correct: ["Простой", "Нормативный", "Коэффициентный"],
        correctDisplay: "Простой, нормативный, коэффициентный"
    },
    {
        type: "open",
        text: "Затраты, которые можно прямо отнести на конкретную культуру, называются ________.",
        correct: ["прямые", "прямыми"],
        correctDisplay: "прямые"
    }
];

// Задачи по теме
const accountingTasks = [
    {
        title: "Задача 1. Расчёт затрат на семена",
        condition: "Площадь посева озимой пшеницы — 200 га. Норма высева — 180 кг/га. Стоимость 1 тонны семян — 25 000 руб. Рассчитайте общую сумму затрат на семена.",
        solution: "1) Общая потребность в семенах: 200 га × 180 кг/га = 36 000 кг = 36 т.\n2) Сумма затрат: 36 т × 25 000 руб. = 900 000 руб.\nОтвет: 900 000 руб."
    },
    {
        title: "Задача 2. Расчёт затрат на ГСМ",
        condition: "Для обработки поля площадью 150 га требуется 12 л дизельного топлива на 1 га. Стоимость 1 литра — 65 руб. Определите общую сумму затрат на ГСМ.",
        solution: "1) Общий расход топлива: 150 га × 12 л/га = 1 800 л.\n2) Сумма затрат: 1 800 л × 65 руб. = 117 000 руб.\nОтвет: 117 000 руб."
    },
    {
        title: "Задача 3. Расчёт оплаты труда",
        condition: "Бригада из 5 человек обслуживает посевы. Средняя месячная зарплата одного работника — 45 000 руб. Начислите затраты на оплату труда за 6 месяцев и страховые взносы (30%).",
        solution: "1) Фонд оплаты труда за 6 мес.: 5 чел. × 45 000 руб. × 6 мес. = 1 350 000 руб.\n2) Страховые взносы (30%): 1 350 000 × 0,30 = 405 000 руб.\n3) Итого затрат: 1 350 000 + 405 000 = 1 755 000 руб.\nОтвет: 1 755 000 руб."
    },
    {
        title: "Задача 4. Распределение косвенных затрат",
        condition: "Общие затраты на управление растениеводческим подразделением составили 300 000 руб. Они распределяются пропорционально площади посевов: пшеница — 400 га, ячмень — 200 га, кукуруза — 400 га. Определите сумму косвенных затрат на каждую культуру.",
        solution: "1) Общая площадь: 400 + 200 + 400 = 1 000 га.\n2) Доля пшеницы: 400/1000 = 0,4; затраты: 300 000 × 0,4 = 120 000 руб.\n3) Доля ячменя: 200/1000 = 0,2; затраты: 300 000 × 0,2 = 60 000 руб.\n4) Доля кукурузы: 400/1000 = 0,4; затраты: 300 000 × 0,4 = 120 000 руб.\nОтвет: пшеница — 120 000, ячмень — 60 000, кукуруза — 120 000 руб."
    }
];
