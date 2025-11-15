// Функции для управления бригадами

let currentEditingBrigadeId = null;

// Загрузка списка бригад
function loadBrigadeList() {
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    
    let brigadeListHTML = '';
    
    if (brigades.length === 0) {
        brigadeListHTML = '<p>Нет бригад</p>';
    } else {
        brigadeListHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Состав</th>
                            <th>Контакты</th>
                            <th>Статус</th>
                            <th>Квалификация</th>
                            <th>Специализация</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        brigades.forEach(brigade => {
            let statusText = '';
            let statusClass = '';
            
            switch(brigade.status) {
                case 'free': 
                    statusText = 'Свободна';
                    statusClass = 'status-free';
                    break;
                case 'busy': 
                    statusText = 'Занята';
                    statusClass = 'status-busy';
                    break;
                case 'on-way': 
                    statusText = 'В пути';
                    statusClass = 'status-in-progress';
                    break;
                case 'on-site': 
                    statusText = 'На объекте';
                    statusClass = 'status-in-progress';
                    break;
            }
            
            brigadeListHTML += `
                <tr>
                    <td>${brigade.id}</td>
                    <td>${brigade.name}</td>
                    <td>${brigade.members ? brigade.members.join(', ') : ''}</td>
                    <td>${brigade.contacts}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${brigade.qualification}</td>
                    <td>${brigade.specialization}</td>
                    <td>
                        <button class="btn" onclick="editBrigade(${brigade.id})">Редактировать</button>
                        <button class="btn btn-danger" onclick="deleteBrigade(${brigade.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
        
        brigadeListHTML += '</tbody></table></div>';
    }
    
    document.getElementById('brigade-list').innerHTML = brigadeListHTML;
}

// Показать форму добавления бригады
function showBrigadeForm() {
    console.log('showBrigadeForm вызвана');
    currentEditingBrigadeId = null;
    document.getElementById('brigade-modal-title').textContent = 'Добавление бригады';
    
    // Сбрасываем форму
    const form = document.getElementById('brigade-form');
    if (form) {
        form.reset();
    }
    
    // Очищаем список членов бригады
    const membersList = document.getElementById('members-list');
    if (membersList) {
        membersList.innerHTML = '';
    }
    
    // Очищаем hidden поле ID
    document.getElementById('brigade-id').value = '';
    
    // Устанавливаем статус по умолчанию
    document.getElementById('brigade-status').value = 'free';
    
    // Показываем модальное окно
    const modal = document.getElementById('brigade-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Модальное окно brigade-modal не найдено');
    }
}

// Закрыть модальное окно
function closeBrigadeModal() {
    const modal = document.getElementById('brigade-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditingBrigadeId = null;
}

// Добавление члена бригады
function addMember() {
    const input = document.getElementById('member-input');
    if (!input) {
        console.error('Поле member-input не найдено');
        return;
    }
    
    const name = input.value.trim();
    
    if (!name) {
        alert('Введите ФИО члена бригады');
        return;
    }

    const membersList = document.getElementById('members-list');
    if (!membersList) {
        console.error('Контейнер members-list не найден');
        return;
    }

    const tag = document.createElement('span');
    tag.className = 'member-tag';
    tag.innerHTML = `${name} <span class="remove" onclick="this.parentElement.remove()">×</span>`;
    membersList.appendChild(tag);
    
    input.value = '';
    input.focus();
}

// Редактирование бригады
function editBrigade(id) {
    console.log('Редактирование бригады с ID:', id);
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    const brigade = brigades.find(b => b.id === id);
    
    if (!brigade) {
        alert('Бригада не найдена');
        return;
    }

    currentEditingBrigadeId = id;
    document.getElementById('brigade-modal-title').textContent = 'Редактирование бригады';
    
    // Заполняем форму данными бригады
    document.getElementById('brigade-id').value = brigade.id;
    document.getElementById('brigade-name').value = brigade.name;
    document.getElementById('brigade-contacts').value = brigade.contacts;
    document.getElementById('brigade-qualification').value = brigade.qualification;
    document.getElementById('brigade-specialization').value = brigade.specialization;
    document.getElementById('brigade-status').value = brigade.status;
    document.getElementById('brigade-location').value = brigade.location || '';
    
    // Заполняем список членов бригады
    const membersList = document.getElementById('members-list');
    membersList.innerHTML = '';
    if (brigade.members) {
        brigade.members.forEach(member => {
            const tag = document.createElement('span');
            tag.className = 'member-tag';
            tag.innerHTML = `${member} <span class="remove" onclick="this.parentElement.remove()">×</span>`;
            membersList.appendChild(tag);
        });
    }

    document.getElementById('brigade-modal').style.display = 'block';
}

// Обработка формы бригады
function setupBrigadeForm() {
    const brigadeForm = document.getElementById('brigade-form');
    
    if (brigadeForm) {
        brigadeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBrigade();
        });
    } else {
        console.error('Форма brigade-form не найдена');
    }
}

// Сохранение бригады
function saveBrigade() {
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    const membersList = document.getElementById('members-list');
    
    if (!membersList) {
        console.error('Контейнер members-list не найден');
        return;
    }
    
    const members = Array.from(membersList.children)
        .map(tag => tag.textContent.replace('×', '').trim());
    
    // Проверяем обязательные поля
    const name = document.getElementById('brigade-name').value;
    const contacts = document.getElementById('brigade-contacts').value;
    const qualification = document.getElementById('brigade-qualification').value;
    const specialization = document.getElementById('brigade-specialization').value;
    const status = document.getElementById('brigade-status').value;
    
    if (!name || !contacts || !qualification || !specialization || !status) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    if (members.length === 0) {
        alert('Добавьте хотя бы одного члена бригады');
        return;
    }
    
    // Генерируем новый ID если добавляем новую бригаду
    let newId;
    if (currentEditingBrigadeId) {
        newId = currentEditingBrigadeId;
    } else {
        newId = brigades.length > 0 ? Math.max(...brigades.map(b => b.id)) + 1 : 1;
    }
    
    const brigadeData = {
        id: newId,
        name: name,
        members: members,
        contacts: contacts,
        qualification: qualification,
        specialization: specialization,
        status: status,
        location: document.getElementById('brigade-location').value,
        coordinates: [55.7558, 37.6173], // Координаты по умолчанию
        currentApplicationId: null
    };

    if (currentEditingBrigadeId) {
        // Редактирование существующей бригады
        const index = brigades.findIndex(b => b.id === currentEditingBrigadeId);
        if (index !== -1) {
            // Сохраняем текущее назначение заявки
            brigadeData.currentApplicationId = brigades[index].currentApplicationId;
            brigades[index] = brigadeData;
        }
    } else {
        // Добавление новой бригады
        brigades.push(brigadeData);
    }

    localStorage.setItem('brigades', JSON.stringify(brigades));
    alert('Бригада успешно сохранена!');
    closeBrigadeModal();
    loadBrigadeList();
}

// Удаление бригады
function deleteBrigade(id) {
    if (!confirm('Вы уверены, что хотите удалить бригаду?')) {
        return;
    }
    
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    const updatedBrigades = brigades.filter(brigade => brigade.id !== id);
    
    localStorage.setItem('brigades', JSON.stringify(updatedBrigades));
    
    // Обновляем заявки, которые были назначены на эту бригаду
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    applications.forEach(app => {
        if (app.brigadeId === id) {
            app.brigadeId = null;
            app.status = 'new';
        }
    });
    localStorage.setItem('applications', JSON.stringify(applications));
    
    alert('Бригада удалена');
    loadBrigadeList();
}

// Инициализация при загрузке страницы управления бригадами
document.addEventListener('DOMContentLoaded', function() {
    console.log('brigade.js загружен');
    
    // Загружаем список бригад если находимся на странице управления
    if (document.getElementById('brigade-list')) {
        console.log('Загружаем список бригад');
        loadBrigadeList();
        setupBrigadeForm();
    }
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('brigade-modal');
        if (event.target === modal) {
            closeBrigadeModal();
        }
    });
    
    // Закрытие модального окна при нажатии ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeBrigadeModal();
        }
    });
});