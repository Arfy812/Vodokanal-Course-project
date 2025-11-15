// Основные функции приложения

// Функция для открытия детальной формы заявки
function viewApplicationDetails(appId) {
    const applications = JSON.parse(localStorage.getItem('applications'));
    const brigades = JSON.parse(localStorage.getItem('brigades'));
    const chats = JSON.parse(localStorage.getItem('chats'));
    const application = applications.find(app => app.id === appId);
    
    if (!application) {
        alert('Заявка не найдена');
        return;
    }

    // Сохраняем данные заявки для модального окна
    sessionStorage.setItem('viewingApplicationId', appId);
    sessionStorage.setItem('viewingApplicationData', JSON.stringify(application));
    
    // Открываем модальное окно
    document.getElementById('application-detail-modal').style.display = 'block';
    
    // Заполняем данные в модальном окне
    document.getElementById('detail-application-id').textContent = application.id;
    document.getElementById('detail-type').textContent = application.type;
    document.getElementById('detail-priority').textContent = getPriorityText(application.priority);
    document.getElementById('detail-status').textContent = getStatusText(application.status);
    document.getElementById('detail-created').textContent = new Date(application.createdAt).toLocaleString();
    document.getElementById('detail-fio').textContent = application.fio;
    document.getElementById('detail-phone').textContent = application.phone;
    document.getElementById('detail-email').textContent = application.email || 'Не указан';
    document.getElementById('detail-address').textContent = application.address;
    document.getElementById('detail-description').textContent = application.description || 'Описание отсутствует';

    // Отображаем фотографии
    const photosContainer = document.getElementById('detail-photos');
    photosContainer.innerHTML = '';
    if (application.photos && application.photos.length > 0) {
        application.photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            // Используем base64 данные напрямую
            photoItem.innerHTML = `<img src="${photo}" alt="Фото заявки ${index + 1}" onclick="openPhoto('${photo}')">`;
            photosContainer.appendChild(photoItem);
        });
    } else {
        photosContainer.innerHTML = '<p>Фотографии не прикреплены</p>';
    }

    // Остальной код остается без изменений...
    // Информация о бригаде
    if (application.brigadeId) {
        const brigade = brigades.find(b => b.id === application.brigadeId);
        if (brigade) {
            document.getElementById('detail-brigade').textContent = brigade.name;
            document.getElementById('detail-brigade-contacts').textContent = `Контакты: ${brigade.contacts}`;
        }
    }

    // Инициализация карты
    initApplicationMap(application.coordinates);

    // Загружаем чат
    loadApplicationChat(application.id);

    // Обновляем прогресс-бар и шаги
    updateProgressBar(application.status);
    
    // Заполняем временную шкалу
    updateTimeline(application.timeline);
}

// Функция для обновления прогресс-бара
function updateProgressBar(status) {
    let progress = 0;
    const steps = document.querySelectorAll('.step-circle');
    
    // Сбрасываем все шаги
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });

    // Устанавливаем прогресс в зависимости от статуса
    switch(status) {
        case 'new':
            progress = 25;
            steps[0].classList.add('active');
            break;
        case 'assigned':
            progress = 50;
            steps[0].classList.add('completed');
            steps[1].classList.add('active');
            break;
        case 'in-progress':
            progress = 75;
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('active');
            break;
        case 'completed':
            progress = 100;
            steps.forEach(step => step.classList.add('completed'));
            break;
    }

    // Обновляем прогресс-бар
    const progressBar = document.getElementById('application-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
    }
}

// Функция для обновления временной шкалы
function updateTimeline(timeline) {
    const timelineContainer = document.getElementById('detail-timeline');
    if (!timelineContainer) return;
    
    timelineContainer.innerHTML = '';

    if (!timeline || timeline.length === 0) {
        timelineContainer.innerHTML = '<p>История статусов отсутствует</p>';
        return;
    }

    timeline.forEach(event => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
            <div class="timeline-date">${new Date(event.timestamp).toLocaleString()}</div>
            <div class="timeline-content">
                <strong>${getStatusText(event.status)}</strong>
                ${event.brigadeId ? `<br><small>Бригада №${event.brigadeId}</small>` : ''}
                ${event.comment ? `<br><small>${event.comment}</small>` : ''}
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
}

// Загрузка чата для заявки
function loadApplicationChat(applicationId) {
    const chats = JSON.parse(localStorage.getItem('chats'));
    const chat = chats.find(c => c.applicationId === applicationId);
    const messagesContainer = document.getElementById('application-chat-messages');
    
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';

    if (chat && chat.messages) {
        chat.messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.sender}`;
            messageDiv.innerHTML = `
                <div>${msg.text}</div>
                <div class="message-time">${new Date(msg.timestamp).toLocaleString()}</div>
            `;
            messagesContainer.appendChild(messageDiv);
        });
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Отправка сообщения из заявки
function sendApplicationMessage() {
    const input = document.getElementById('application-message-input');
    const text = input.value.trim();
    const applicationId = parseInt(document.getElementById('detail-application-id').textContent);
    
    if (!text) return;

    const chats = JSON.parse(localStorage.getItem('chats'));
    let chat = chats.find(c => c.applicationId === applicationId);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!chat) {
        chat = {
            applicationId: applicationId,
            messages: []
        };
        chats.push(chat);
    }

    chat.messages.push({
        text: text,
        sender: currentUser.role === 'dispatcher' ? 'dispatcher' : 'user',
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('chats', JSON.stringify(chats));
    input.value = '';
    loadApplicationChat(applicationId);
}

// Функция обновления статуса заявки
function updateApplicationStatus() {
    const applicationId = parseInt(document.getElementById('detail-application-id').textContent);
    const applications = JSON.parse(localStorage.getItem('applications'));
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) return;

    // Создаем диалог с выбором статуса
    const statusDialog = `
        <div style="padding: 20px;">
            <h4>Выберите новый статус для заявки №${applicationId}</h4>
            <select id="status-select" style="width: 100%; padding: 10px; margin: 10px 0;">
                <option value="new" ${application.status === 'new' ? 'selected' : ''}>Новая</option>
                <option value="assigned" ${application.status === 'assigned' ? 'selected' : ''}>Назначена</option>
                <option value="in-progress" ${application.status === 'in-progress' ? 'selected' : ''}>В работе</option>
                <option value="completed" ${application.status === 'completed' ? 'selected' : ''}>Завершена</option>
            </select>
            <div id="completion-notes" style="display: none; margin: 10px 0;">
                <label>Примечания по завершению:</label>
                <textarea id="completion-comment" style="width: 100%; padding: 10px; margin: 5px 0;" placeholder="Опишите выполненные работы..."></textarea>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn" onclick="saveApplicationStatus(${applicationId})">Сохранить</button>
                <button class="btn" onclick="closeStatusModal()">Отмена</button>
            </div>
        </div>
    `;
    
    // Создаем модальное окно для смены статуса
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 0;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    `;
    modalContent.innerHTML = statusDialog;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Сохраняем ссылку на текущее модальное окно
    currentStatusModal = modal;
    
    // Показываем поле для примечаний при выборе статуса "Завершена"
    document.getElementById('status-select').addEventListener('change', function() {
        const notesDiv = document.getElementById('completion-notes');
        notesDiv.style.display = this.value === 'completed' ? 'block' : 'none';
    });
}

// Функция для закрытия модального окна статуса
function closeStatusModal() {
    if (currentStatusModal) {
        document.body.removeChild(currentStatusModal);
        currentStatusModal = null;
    }
}

function saveApplicationStatus(applicationId) {
    const applications = JSON.parse(localStorage.getItem('applications'));
    const application = applications.find(app => app.id === applicationId);
    const newStatus = document.getElementById('status-select').value;
    const completionComment = document.getElementById('completion-comment').value;
    
    if (!application) return;
    
    // Обновляем статус
    application.status = newStatus;
    
    // Добавляем запись в историю
    application.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        comment: newStatus === 'completed' ? (completionComment || 'Работы завершены') : 'Статус изменен'
    });
    
    // Если статус "Завершена", освобождаем бригаду
    if (newStatus === 'completed' && application.brigadeId) {
        const brigades = JSON.parse(localStorage.getItem('brigades'));
        const brigade = brigades.find(b => b.id === application.brigadeId);
        if (brigade) {
            brigade.status = 'free';
            brigade.currentApplicationId = null;
            localStorage.setItem('brigades', JSON.stringify(brigades));
        }
    }
    
    // Сохраняем изменения
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Закрываем модальное окно
    closeStatusModal();
    
    // Обновляем отображение
    updateProgressBar(newStatus);
    document.getElementById('detail-status').textContent = getStatusText(newStatus);
    updateTimeline(application.timeline);
    
    alert('Статус заявки успешно обновлен!');
    
    // Если это диспетчер, обновляем дашборд
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'dispatcher') {
        // Перезагружаем страницу для обновления данных
        window.location.reload();
    }
}

// Функция для закрытия модального окна
function closeApplicationDetail() {
    document.getElementById('application-detail-modal').style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('application-detail-modal');
    if (event.target === modal) {
        closeApplicationDetail();
    }
    
    // Закрытие модального окна статуса при клике вне его
    if (currentStatusModal && event.target === currentStatusModal) {
        closeStatusModal();
    }
}