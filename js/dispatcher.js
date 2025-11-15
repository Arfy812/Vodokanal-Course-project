// Функции для диспетчера

// Загрузка данных для диспетчера
function loadDispatcherData() {
    loadIncomingApplications();
    loadCriticalApplications();
    loadBrigadeStatuses();
    loadAllApplications();
}

// Загрузка входящих заявок
function loadIncomingApplications() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const incomingApps = applications.filter(app => app.status === 'new');
    
    let incomingHTML = '';
    
    if (incomingApps.length === 0) {
        incomingHTML = '<p>Нет новых заявок</p>';
    } else {
        incomingApps.forEach(app => {
            let priorityClass = '';
            switch(app.priority) {
                case 'high': priorityClass = 'priority-high'; break;
                case 'medium': priorityClass = 'priority-medium'; break;
                case 'low': priorityClass = 'priority-low'; break;
            }
            
            incomingHTML += `
                <div class="card" style="margin-bottom: 10px; padding: 15px;">
                    <p><strong>Заявка №${app.id}</strong></p>
                    <p>${app.type} - <span class="${priorityClass}">${app.priority === 'high' ? 'Высокий' : app.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет</span></p>
                    <p>${app.address}</p>
                    <p>${new Date(app.createdAt).toLocaleString()}</p>
                    <button class="btn" onclick="assignBrigade(${app.id})" style="margin-top: 10px;">Назначить бригаду</button>
                </div>
            `;
        });
    }
    
    document.getElementById('incoming-applications').innerHTML = incomingHTML;
}

// Загрузка критических заявок
function loadCriticalApplications() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const criticalApps = applications.filter(app => {
        // Исключаем выполненные заявки
        if (app.status === 'completed') return false;
        if (app.priority !== 'high') return false;
        
        // Проверяем, прошло ли более 1.5 часов с момента создания (для демо)
        const created = new Date(app.createdAt);
        const now = new Date();
        const diffHours = (now - created) / (1000 * 60 * 60);
        
        return diffHours > 1.5; // Более 1.5 часов
    });
    
    let criticalHTML = '';
    
    if (criticalApps.length === 0) {
        criticalHTML = '<p>Нет критических заявок</p>';
    } else {
        criticalApps.forEach(app => {
            criticalHTML += `
                <div class="card" style="margin-bottom: 10px; padding: 15px; border-left: 4px solid var(--danger-color);">
                    <p><strong>Заявка №${app.id}</strong> <span class="status-badge status-critical">КРИТИЧЕСКАЯ</span></p>
                    <p>${app.type}</p>
                    <p>${app.address}</p>
                    <p>Подана: ${new Date(app.createdAt).toLocaleString()}</p>
                    <button class="btn btn-danger" onclick="assignBrigade(${app.id})" style="margin-top: 10px;">СРОЧНО НАЗНАЧИТЬ</button>
                </div>
            `;
        });
    }
    
    document.getElementById('critical-applications').innerHTML = criticalHTML;
}

// Загрузка статусов бригад
function loadBrigadeStatuses() {
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    
    let brigadeHTML = '';
    
    if (brigades.length === 0) {
        brigadeHTML = '<p>Нет созданных бригад</p>';
    } else {
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
            
            brigadeHTML += `
                <div class="card" style="margin-bottom: 10px; padding: 15px;">
                    <p><strong>${brigade.name}</strong></p>
                    <p>Статус: <span class="status-badge ${statusClass}">${statusText}</span></p>
                    <p>Состав: ${brigade.members.join(', ')}</p>
                    <p>Контакты: ${brigade.contacts}</p>
                    ${brigade.currentApplicationId ? `<p>Заявка: №${brigade.currentApplicationId}</p>` : ''}
                    <div style="margin-top: 10px;">
                        <button class="btn" onclick="editBrigade(${brigade.id})">Редактировать</button>
                        <button class="btn btn-danger" onclick="deleteBrigade(${brigade.id})">Удалить</button>
                    </div>
                </div>
            `;
        });
    }
    
    document.getElementById('brigade-statuses').innerHTML = brigadeHTML;
}

// Загрузка всех заявок
function loadAllApplications() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    
    let allAppsHTML = '';
    
    if (applications.length === 0) {
        allAppsHTML = '<p>Нет заявок</p>';
    } else {
        allAppsHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Тип</th>
                            <th>Адрес</th>
                            <th>Приоритет</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th>Бригада</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        applications.forEach(app => {
            let statusBadge = '';
            switch(app.status) {
                case 'new':
                    statusBadge = '<span class="status-badge status-new">Новая</span>';
                    break;
                case 'in-progress':
                    statusBadge = '<span class="status-badge status-in-progress">В работе</span>';
                    break;
                case 'completed':
                    statusBadge = '<span class="status-badge status-completed">Выполнена</span>';
                    break;
            }
            
            let priorityClass = '';
            switch(app.priority) {
                case 'high': priorityClass = 'priority-high'; break;
                case 'medium': priorityClass = 'priority-medium'; break;
                case 'low': priorityClass = 'priority-low'; break;
            }
            
            allAppsHTML += `
                <tr>
                    <td>${app.id}</td>
                    <td>${app.type}</td>
                    <td>${app.address}</td>
                    <td class="${priorityClass}">${app.priority === 'high' ? 'Высокий' : app.priority === 'medium' ? 'Средний' : 'Низкий'}</td>
                    <td>${statusBadge}</td>
                    <td>${new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>${app.brigadeId ? `Бригада №${app.brigadeId}` : 'Не назначена'}</td>
                    <td>
                        <button class="btn" onclick="viewApplicationDetails(${app.id})">Подробнее</button>
                        ${app.status === 'new' ? `<button class="btn" onclick="assignBrigade(${app.id})">Назначить</button>` : ''}
                    </td>
                </tr>
            `;
        });
        
        allAppsHTML += '</tbody></table></div>';
    }
    
    document.getElementById('all-applications').innerHTML = allAppsHTML;
}

// Назначение бригады на заявку
function assignBrigade(appId) {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    
    const application = applications.find(app => app.id === appId);
    if (!application) return;
    
    // Находим свободную бригаду
    const freeBrigade = brigades.find(brigade => brigade.status === 'free');
    
    if (!freeBrigade) {
        alert('Нет свободных бригад в данный момент');
        return;
    }
    
    // Назначаем бригаду на заявку
    application.brigadeId = freeBrigade.id;
    application.status = 'in-progress';
    
    // Инициализируем timeline если его нет
    if (!application.timeline) {
        application.timeline = [];
    }
    
    application.timeline.push({
        status: 'assigned',
        timestamp: new Date().toISOString(),
        brigadeId: freeBrigade.id
    });
    
    // Обновляем статус бригады
    freeBrigade.status = 'busy';
    freeBrigade.currentApplicationId = appId;
    
    // Сохраняем изменения
    localStorage.setItem('applications', JSON.stringify(applications));
    localStorage.setItem('brigades', JSON.stringify(brigades));
    
    alert(`Бригада №${freeBrigade.id} назначена на заявку №${appId}`);
    loadDispatcherData();
}

// Редактирование бригады
function editBrigade(brigadeId) {
    // Перенаправляем на страницу управления бригадами
    window.location.href = 'brigade-management.html';
}

// Удаление бригады
function deleteBrigade(brigadeId) {
    if (!confirm('Вы уверены, что хотите удалить эту бригаду?')) {
        return;
    }
    
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    const updatedBrigades = brigades.filter(brigade => brigade.id !== brigadeId);
    
    localStorage.setItem('brigades', JSON.stringify(updatedBrigades));
    
    // Обновляем заявки, которые были назначены на эту бригаду
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    applications.forEach(app => {
        if (app.brigadeId === brigadeId) {
            app.brigadeId = null;
            app.status = 'new';
        }
    });
    localStorage.setItem('applications', JSON.stringify(applications));
    
    alert('Бригада удалена');
    loadDispatcherData();
}

// Просмотр деталей заявки
function viewApplicationDetails(appId) {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const application = applications.find(app => app.id === appId);
    
    if (!application) return;
    
    // Заполняем модальное окно данными
    document.getElementById('detail-application-id').textContent = application.id;
    document.getElementById('detail-type').textContent = application.type;
    document.getElementById('detail-priority').textContent = application.priority === 'high' ? 'Высокий' : application.priority === 'medium' ? 'Средний' : 'Низкий';
    document.getElementById('detail-status').textContent = application.status === 'new' ? 'Новая' : application.status === 'in-progress' ? 'В работе' : 'Выполнена';
    document.getElementById('detail-created').textContent = new Date(application.createdAt).toLocaleString();
    document.getElementById('detail-fio').textContent = application.fio;
    document.getElementById('detail-phone').textContent = application.phone;
    document.getElementById('detail-email').textContent = application.email || 'Не указан';
    document.getElementById('detail-address').textContent = application.address;
    document.getElementById('detail-description').textContent = application.description;
    
    // Информация о бригаде
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    const brigade = brigades.find(b => b.id === application.brigadeId);
    if (brigade) {
        document.getElementById('detail-brigade').textContent = brigade.name;
        document.getElementById('detail-brigade-contacts').textContent = `Контакты: ${brigade.contacts}`;
    } else {
        document.getElementById('detail-brigade').textContent = 'Не назначена';
        document.getElementById('detail-brigade-contacts').textContent = '';
    }
    
    // Обновляем прогресс
    updateApplicationProgress(application);
    
    // Показываем модальное окно
    document.getElementById('application-detail-modal').style.display = 'block';
}

// Обновление прогресса заявки
function updateApplicationProgress(application) {
    let progress = 0;
    
    switch(application.status) {
        case 'new':
            progress = 25;
            break;
        case 'in-progress':
            progress = 50;
            break;
        case 'completed':
            progress = 100;
            break;
    }
    
    const progressBar = document.getElementById('application-progress-bar');
    progressBar.style.width = progress + '%';
    progressBar.textContent = progress + '%';
    
    // Обновляем визуальные шаги
    const steps = [1, 2, 3, 4];
    steps.forEach(step => {
        const circle = document.getElementById(`step-${step}-circle`);
        if (circle) {
            if (step * 25 <= progress) {
                circle.classList.add('active');
            } else {
                circle.classList.remove('active');
            }
        }
    });
}

// Закрытие модального окна
function closeApplicationDetail() {
    document.getElementById('application-detail-modal').style.display = 'none';
}

// Отправка сообщения в чате заявки
function sendApplicationMessage() {
    const input = document.getElementById('application-message-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Здесь должна быть логика отправки сообщения
    // Пока просто очищаем поле
    input.value = '';
    alert('Сообщение отправлено (функциональность в разработке)');
}

// Обновление статуса заявки
function updateApplicationStatus() {
    alert('Функция обновления статуса в разработке');
}

// Инициализация при загрузке страницы диспетчера
document.addEventListener('DOMContentLoaded', function() {
    // Авторизация проверяется в utils.js
    if (typeof checkAuth === 'function') {
        checkAuth();
    }
    loadDispatcherData();
});