/** * Правильные ответы для вопросов * @type Object */
const ANSWERS = {
    q1: "1703",
    q2: "Швеция",
    q3: ["Екатерина II", "Елизавета Петровна", "Павел I"],
    q4: ["Крестьянская реформа", "Земская реформа", "Судебная реформа"],
    q5: "Бородинское сражение",
    q6: "Поражение России",
    q7: "1861",
    q8: "Кутузов",
    q9: "1825",
    q10: "Государственный деятель"
};

/** * Краткие описания вопросов для таблицы * @type Array */
const QUESTIONS = [
    "Основание Санкт-Петербурга",
    "Северная война",
    "Правители XVIII века",
    "Великие реформы Александра II",
    "Сражение 1812 года",
    "Итог Крымской войны",
    "Отмена крепостного права",
    "Командующий при Бородино",
    "Восстание декабристов",
    "М. М. Сперанский"
];

/** * Текущее оставшееся время в секундах (изначально 10 минут)
 * @type Number 
*/
let timeLeft = 600; 

/** * Идентификатор интервала для управления таймером * @type Number */
let timerId;

/** * Начальное количество баллов * @type Number */
const ZERO = 0;

/** * Количество секунд в одной минуте * @type Number */
const SECOND = 60;

/** * Число для сравнения при форматировании нулей * @type Number */
const MATCH = 10;

/** * Интервал обновления (1 секунда) * @type Number */
const TICK_RATE = 1000;

/** * Общее количество вопросов в тесте * @type Number */
const QUIZ_SIZE = Object.keys(ANSWERS).length;

/** * Индексы вопросов Checkbox * @type Array */
const CHECKBOX_IDS = [3, 4];

/** * Индексы вопросов Text Box * @type Array */
const TEXTBOX_IDS = [7, 8];

/**
 * Запускает тест: скрывает приветствие,
 * отображает вопросы и включает таймер.
 * @returns {void}
 * @throws {TypeError} Если элементы start-screen, quiz-container или
 * timer не найдены в DOM.
*/
function startQuiz() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    timerId = setInterval(tickTimer, TICK_RATE);
}

/**
 * Обрабатывает один такт таймера: уменьшает оставшееся время,
 * обновляет индикатор на странице и завершает тест по истечении времени.
 * @returns {void}
 * @throws {TypeError} Если элемент с id="timer" не найден в DOM.
 */
function tickTimer() {
    timeLeft--;
    let mins = Math.floor(timeLeft / SECOND);
    let secs = timeLeft % SECOND;
    document.getElementById('timer').innerText =
            `${mins}:${secs < MATCH ? '0' : ''}${secs}`;

    if (timeLeft <= 0) {
        finishQuiz();
    }
}

/**
 * Завершает тест: останавливает таймер, переключает экраны,
 * собирает ответы пользователя, проверяет их и выводит результаты.
 * @returns {void}
 * @throws {TypeError} Если элементы quiz-container, result-area,
 * quiz-form или total-score не найдены в DOM.
*/
function finishQuiz() {
    clearInterval(timerId);
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result-area').style.display = 'block';

    let form = document.getElementById('quiz-form');
    let formData = new FormData(form);
    let totalPoints = ZERO;
    let resultsData = [];

    for (let i = 1; i <= QUIZ_SIZE; i++) {
        let evaluation = checkUserAnswer(i, formData);
        if (evaluation.isCorrect) totalPoints++;
        resultsData.push(evaluation);
    }

    fillResultTable(resultsData);
    document.getElementById('total-score').innerText =
            `Итого: ${totalPoints} из ${QUIZ_SIZE}`;
}

/**
 * Проверяет правильность ответа на один вопрос.
 * @param {number} index - Порядковый номер вопроса (от 1 до QUIZ_SIZE).
 * @param {FormData} formData - Объект данных формы, содержащий
 * ответы пользователя.
 * @returns {Object} Объект с данными проверки: номер, текст вопроса,
 * ответ пользователя, правильный ответ и статус верности (isCorrect).
 * @throws {ReferenceError} Если ключ q{index} отсутствует в объекте ANSWERS.
 */
function checkUserAnswer(index, formData) {
    let key = `q${index}`;
    let userAns = "";
    let isCorrect = false;

    if (CHECKBOX_IDS.includes(index)) {
        let checked = formData.getAll(key);
        userAns = checked.join(", ");
        isCorrect = JSON.stringify(checked.sort()) ===
                JSON.stringify(ANSWERS[key].sort());
    } 
    else if (TEXTBOX_IDS.includes(index)) {
        userAns = (formData.get(key) || "").trim();
        isCorrect = userAns.toLowerCase() === ANSWERS[key].toLowerCase();
    } 
    else {
        userAns = formData.get(key);
        isCorrect = userAns === ANSWERS[key];
    }

    return {
        number: index,
        question: QUESTIONS[index - 1],
        answer: userAns || "Нет ответа",
        correct: Array.isArray(ANSWERS[key]) ? ANSWERS[key].join(", ") : ANSWERS[key],
        isCorrect: isCorrect
    };
}

/**
 * Заполняет таблицу результатов данными из массива проверок.
 * Перед заполнением полностью очищает тело таблицы, чтобы
 * исключить дубликаты строк.
 * @param {Array<Object>} results - Массив объектов, полученных из функции
 * checkUserAnswer.
 * @returns {void}
 * @throws {TypeError} Если элемент с id="table-body" не найден в DOM.
*/
function fillResultTable(results) {
    let tableBody = document.getElementById('table-body');
    tableBody.innerHTML = ""; 

    results.forEach(item => {
        let row = tableBody.insertRow();
        row.className = item.isCorrect ? 'correct' : 'incorrect';
        
        row.innerHTML = `
            <td>${item.number}</td>
            <td>${item.question}</td>
            <td>${item.answer}</td>
            <td>${item.correct}</td>
            <td>${item.isCorrect ? 1 : 0}</td>
        `;
    });
}

/** * Назначение обработчиков клика кнопкам управления */
document.getElementById('start-btn').onclick = startQuiz;
document.getElementById('submit-btn').onclick = finishQuiz;
