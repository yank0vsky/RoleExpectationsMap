// Пример списка ролей
const roles = ['Developer', 'Sales', 'Product Manager'];

// Ожидания будут храниться в localStorage
let expectations = JSON.parse(localStorage.getItem('expectations')) || {};

// Инициализация вкладок
const tabs = document.querySelectorAll('.tab');
const containers = document.querySelectorAll('.container');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Переключаем активную вкладку
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Переключаем активный контейнер
        const targetTab = tab.getAttribute('data-tab');
        containers.forEach(container => {
            if (container.id === targetTab) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        });

        // Обновляем содержимое вкладок при переключении
        const selectedRole = roleSelectShare.value;
        if (targetTab === 'share') {
            renderAddExpectations(selectedRole); // Исправленный вызов функции
        } else if (targetTab === 'received') {
            renderViewExpectations(selectedRole);
        } else if (targetTab === 'map') {
            renderExpectationsMap();
        }
    });
});

// Инициализация выпадающего списка ролей для вкладки "Поделиться ожиданием"
const roleSelectShare = document.getElementById('roleSelectShare');
roles.forEach(role => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    roleSelectShare.appendChild(option);
});

const addExpectationsContainer = document.getElementById('addExpectationsContainer');
const viewExpectationsContainer = document.getElementById('viewExpectationsContainer');
const expectationsMap = document.getElementById('expectationsMap');

// Функция для нормализации ID ролей (заменяем пробелы дефисами)
function normalizeRoleId(role) {
    return role.toLowerCase().replace(/\s+/g, '-');
}

// Функция для создания раздела добавления ожиданий на основе выбранной роли
function renderAddExpectations(selectedRole) {
    if (!addExpectationsContainer) return; // Проверка на наличие контейнера
    addExpectationsContainer.innerHTML = ''; // Очищаем старый контент

    roles.forEach(toRole => {
        const cell = document.createElement('div');
        cell.className = 'cell';

        const title = document.createElement('h4');
        title.textContent = `${selectedRole} → ${toRole}`;
        cell.appendChild(title);

        // Добавить новое ожидание
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Введите новое ожидание';

        const addBtn = document.createElement('button');
        addBtn.textContent = 'Добавить ожидание';
        addBtn.onclick = () => {
            addExpectation(selectedRole, toRole, input.value);
            renderAddExpectations(selectedRole); // Перерисовываем раздел добавления
        };

        cell.appendChild(input);
        cell.appendChild(addBtn);

        // Отображение уже добавленных ожиданий для этой пары ролей
        const expectationList = expectations[selectedRole]?.[toRole] || [];

        expectationList.forEach((expectation, index) => {
            const expectationDiv = document.createElement('div');
            expectationDiv.classList.add('expectation-item');

            const expectationText = document.createElement('input');
            expectationText.type = 'text';
            expectationText.value = expectation.text;
            expectationText.onblur = () => editExpectation(selectedRole, toRole, index, expectationText.value);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.onclick = () => {
                deleteExpectation(selectedRole, toRole, index);
                renderAddExpectations(selectedRole); // Перерисовываем раздел добавления
            };

            expectationDiv.appendChild(expectationText);
            expectationDiv.appendChild(deleteBtn);
            cell.appendChild(expectationDiv);
        });

        addExpectationsContainer.appendChild(cell);
    });
}

// Функция для отображения карты ожиданий в виде матрицы
// Функция для отображения карты ожиданий в виде матрицы
function renderExpectationsMap() {
    console.log("Рендерим карту ожиданий...");
    
    roles.forEach(fromRole => {
        roles.forEach(toRole => {
            const cellId = `${normalizeRoleId(fromRole)}-${normalizeRoleId(toRole)}`;
            const mapCell = document.getElementById(cellId);
            if (!mapCell) {
                console.error(`Ячейка с id ${cellId} не найдена!`);
                return; // Если ячейка не найдена, пропускаем её
            }

            console.log(`Рендер ячейки: ${fromRole} → ${toRole}`);

            mapCell.innerHTML = ''; // Очищаем ячейку перед добавлением карточек

            // Получаем ожидания для текущей пары ролей
            const expectationList = expectations[fromRole]?.[toRole] || [];
            console.log(`Ожидания для ${fromRole} → ${toRole}: `, expectationList);

            if (fromRole === toRole) {
                // Отображаем self expectations по диагонали
                expectationList.forEach(expectation => {
                    const card = document.createElement('div');
                    card.className = `map-card ${expectation.category || 'gray'}`;
                    card.textContent = expectation.text;

                    // Проверяем наличие комментария (отсеиваем пустые строки и пробелы)
                    if (expectation.comment && expectation.comment.trim()) {
                        card.setAttribute('data-comment', expectation.comment); // Добавляем комментарий как атрибут
                        
                        // Добавляем иконку комментария
                        const commentIcon = document.createElement('span');
                        commentIcon.className = 'comment-icon';
                        commentIcon.textContent = '💬'; // Иконка комментария
                        card.appendChild(commentIcon);
                    }

                    mapCell.appendChild(card);
                    console.log(`Добавлена self-expectation карточка: ${expectation.text}`);
                });
            } else {
                // Добавляем карточки ожиданий с цветом и текстом для других ролей
                if (expectationList.length > 0) {
                    expectationList.forEach(expectation => {
                        const card = document.createElement('div');
                        card.className = `map-card ${expectation.category || 'gray'}`;
                        card.textContent = expectation.text;

                        // Проверяем наличие комментария (отсеиваем пустые строки и пробелы)
                        if (expectation.comment && expectation.comment.trim()) {
                            card.setAttribute('data-comment', expectation.comment); // Добавляем комментарий как атрибут
                            
                            // Добавляем иконку комментария
                            const commentIcon = document.createElement('span');
                            commentIcon.className = 'comment-icon';
                            commentIcon.textContent = '💬'; // Иконка комментария
                            card.appendChild(commentIcon);
                        }

                        mapCell.appendChild(card);
                        console.log(`Добавлена карточка: ${expectation.text}`);
                    });
                } else {
                    mapCell.textContent = 'Нет ожиданий'; // Пустые ячейки
                    console.log(`Нет ожиданий для ${fromRole} → ${toRole}`);
                }
            }
        });
    });
}

// Функция для отображения полученных ожиданий
// Функция для отображения полученных ожиданий
function renderViewExpectations(selectedRole) {
    if (!viewExpectationsContainer) return; // Проверка на наличие контейнера
    viewExpectationsContainer.innerHTML = ''; // Очищаем старый контент

    roles.forEach(fromRole => {
        if (fromRole === selectedRole) return; // Пропускаем саму роль

        const cell = document.createElement('div');
        cell.className = 'cell';

        const title = document.createElement('h4');
        title.textContent = `${fromRole} → ${selectedRole}`;
        cell.appendChild(title);

        // Получение списка ожиданий
        const expectationList = expectations[fromRole]?.[selectedRole] || [];

        expectationList.forEach((expectation, index) => {
            const expectationDiv = document.createElement('div');
            expectationDiv.classList.add('expectation-item');

            const expectationText = document.createElement('p');
            expectationText.textContent = `Ожидание: ${expectation.text}`;
            expectationDiv.appendChild(expectationText);

            // Кнопки для классификации ожиданий
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'buttons-div';

            const agreeBtn = document.createElement('button');
            agreeBtn.textContent = 'Agree';
            agreeBtn.className = 'green-btn';
            if (expectation.category === 'green') {
                agreeBtn.classList.add('button-active'); // Подсвечиваем, если уже выбрано
            }
            agreeBtn.onclick = () => {
                setCategory(fromRole, selectedRole, index, 'green');
                highlightSelectedButton(buttonsDiv, agreeBtn);
            };

            const discussBtn = document.createElement('button');
            discussBtn.textContent = 'Discuss';
            discussBtn.className = 'yellow-btn';
            if (expectation.category === 'yellow') {
                discussBtn.classList.add('button-active'); // Подсвечиваем, если уже выбрано
            }
            discussBtn.onclick = () => {
                setCategory(fromRole, selectedRole, index, 'yellow');
                highlightSelectedButton(buttonsDiv, discussBtn);
            };

            const disagreeBtn = document.createElement('button');
            disagreeBtn.textContent = 'Disagree';
            disagreeBtn.className = 'red-btn';
            if (expectation.category === 'red') {
                disagreeBtn.classList.add('button-active'); // Подсвечиваем, если уже выбрано
            }
            disagreeBtn.onclick = () => {
                setCategory(fromRole, selectedRole, index, 'red');
                highlightSelectedButton(buttonsDiv, disagreeBtn);
            };

            buttonsDiv.appendChild(agreeBtn);
            buttonsDiv.appendChild(discussBtn);
            buttonsDiv.appendChild(disagreeBtn);
            expectationDiv.appendChild(buttonsDiv);

            // Поле для комментария, если выбрана категория "Discuss" или "Disagree"
            const commentInput = document.createElement('input');
            commentInput.type = 'text';
            commentInput.placeholder = 'Комментарий';
            commentInput.value = expectation.comment || '';
            commentInput.style.display = ['yellow', 'red'].includes(expectation.category) ? 'block' : 'none';
            commentInput.onblur = () => saveComment(fromRole, selectedRole, index, commentInput.value);
            expectationDiv.appendChild(commentInput);

            cell.appendChild(expectationDiv);
        });

        viewExpectationsContainer.appendChild(cell);
    });
}

// Функция для подсветки выбранной кнопки с соответствующим цветом
function highlightSelectedButton(buttonsDiv, selectedBtn) {
    // Убираем подсветку со всех кнопок
    buttonsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('button-active'));

    // Подсвечиваем выбранную кнопку
    selectedBtn.classList.add('button-active');
}

// Добавление нового ожидания
function addExpectation(fromRole, toRole, value) {
    if (!expectations[fromRole]) {
        expectations[fromRole] = {};
    }
    if (!expectations[fromRole][toRole]) {
        expectations[fromRole][toRole] = [];
    }
    expectations[fromRole][toRole].push({ text: value, category: '', comment: '' });
    localStorage.setItem('expectations', JSON.stringify(expectations));
    renderExpectationsMap(); // Перерисовываем карту после добавления ожидания
}

// Редактирование ожидания
function editExpectation(fromRole, toRole, index, newValue) {
    expectations[fromRole][toRole][index].text = newValue;
    localStorage.setItem('expectations', JSON.stringify(expectations));
}

// Удаление ожидания
function deleteExpectation(fromRole, toRole, index) {
    expectations[fromRole][toRole].splice(index, 1);
    localStorage.setItem('expectations', JSON.stringify(expectations));
}

// Функция для установки категории (Agree, Discuss, Disagree)
function setCategory(fromRole, toRole, index, category) {
    if (!expectations[fromRole][toRole][index]) {
        return;
    }

    expectations[fromRole][toRole][index].category = category;
    localStorage.setItem('expectations', JSON.stringify(expectations));

    // Перерисовываем раздел просмотра ожиданий
    const selectedRole = roleSelectShare.value;
    renderViewExpectations(selectedRole);
}


// Функция для сохранения комментария
function saveComment(fromRole, toRole, index, comment) {
    if (!expectations[fromRole][toRole][index]) {
        return;
    }
    expectations[fromRole][toRole][index].comment = comment;
    localStorage.setItem('expectations', JSON.stringify(expectations));
}

// Очистка всех данных
const clearDataButton = document.getElementById('clearDataButton');
clearDataButton.addEventListener('click', () => {
    localStorage.removeItem('expectations');
    expectations = {}; // Сбрасываем все ожидания
    renderExpectationsMap();
    renderAddExpectations(roleSelectShare.value);
});

// При изменении роли обновляем вкладки
roleSelectShare.addEventListener('change', (e) => {
    const selectedRole = e.target.value;
    renderAddExpectations(selectedRole);
    renderViewExpectations(selectedRole);
    renderExpectationsMap();
});

// Инициализируем интерфейс для первой выбранной роли
renderAddExpectations(roles[0]);
renderViewExpectations(roles[0]);
renderExpectationsMap();
