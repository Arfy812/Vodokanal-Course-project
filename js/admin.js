// Функции для административной панели

// Загрузка дашборда администратора
function loadAdminDashboard() {
    loadSystemStats();
    loadRecentActions();
    loadSystemOverview();
}

// Загрузка статистики системы
function loadSystemStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    
    const totalUsers = users.length;
    const totalApplications = applications.length;
    const totalBrigades = brigades.length;
    const activeApplications = applications.filter(app => app.status !== 'completed').length;
    
    const statsHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="text-align: center; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #1976d2;">${totalUsers}</div>
                <div>Пользователей</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #388e3c;">${totalApplications}</div>
                <div>Заявок</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #f57c00;">${totalBrigades}</div>
                <div>Бригад</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #ffebee; border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; color: #d32f2f;">${activeApplications}</div>
                <div>Активных заявок</div>
            </div>
        </div>
    `;
    
    document.getElementById('system-stats').innerHTML = statsHTML;
}

// Загрузка последних действий
function loadRecentActions() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const recentApps = applications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    let actionsHTML = '';
    
    if (recentApps.length === 0) {
        actionsHTML = '<p>Нет последних действий</p>';
    } else {
        recentApps.forEach(app => {
            actionsHTML += `
                <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <div><strong>Заявка №${app.id}</strong> - ${app.type}</div>
                    <div style="font-size: 12px; color: #666;">${new Date(app.createdAt).toLocaleString()}</div>
                    <div style="font-size: 12px;">Статус: ${getStatusText(app.status)}</div>
                </div>
            `;
        });
    }
    
    document.getElementById('recent-actions').innerHTML = actionsHTML;
}

// Загрузка обзора системы
function loadSystemOverview() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    
    // Пользователи по ролям
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const dispatcherUsers = users.filter(u => u.role === 'dispatcher').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    document.getElementById('users-overview').innerHTML = `
        <p>Администраторы: ${adminUsers}</p>
        <p>Диспетчеры: ${dispatcherUsers}</p>
        <p>Пользователи: ${regularUsers}</p>
        <p>Всего: ${users.length}</p>
    `;
    
    // Заявки по статусам
    const newApps = applications.filter(app => app.status === 'new').length;
    const inProgressApps = applications.filter(app => app.status === 'in-progress').length;
    const completedApps = applications.filter(app => app.status === 'completed').length;
    
    document.getElementById('applications-overview').innerHTML = `
        <p>Новые: ${newApps}</p>
        <p>В работе: ${inProgressApps}</p>
        <p>Выполненные: ${completedApps}</p>
        <p>Всего: ${applications.length}</p>
    `;
    
    // Бригады по статусам
    const freeBrigades = brigades.filter(b => b.status === 'free').length;
    const busyBrigades = brigades.filter(b => b.status === 'busy').length;
    
    document.getElementById('brigades-overview').innerHTML = `
        <p>Свободные: ${freeBrigades}</p>
        <p>Занятые: ${busyBrigades}</p>
        <p>Всего: ${brigades.length}</p>
    `;
}

// Генерация системного отчета
function generateSystemReport() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const brigades = JSON.parse(localStorage.getItem('brigades')) || [];
    
    const report = {
        generatedAt: new Date().toISOString(),
        summary: {
            totalUsers: users.length,
            totalApplications: applications.length,
            totalBrigades: brigades.length
        },
        usersByRole: {
            admin: users.filter(u => u.role === 'admin').length,
            dispatcher: users.filter(u => u.role === 'dispatcher').length,
            user: users.filter(u => u.role === 'user').length
        },
        applicationsByStatus: {
            new: applications.filter(app => app.status === 'new').length,
            inProgress: applications.filter(app => app.status === 'in-progress').length,
            completed: applications.filter(app => app.status === 'completed').length
        },
        recentApplications: applications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(app => ({
                id: app.id,
                type: app.type,
                status: app.status,
                createdAt: app.createdAt
            }))
    };
    
    // В реальном приложении здесь был бы экспорт в файл
    console.log('Системный отчет:', report);
    alert('Отчет сгенерирован! Проверьте консоль браузера для просмотра.');
}

// Очистка старых данных
function clearOldData() {
    if (confirm('Вы уверены, что хотите очистить старые данные? Это действие нельзя отменить.')) {
        const applications = JSON.parse(localStorage.getItem('applications')) || [];
        
        // Оставляем только заявки за последние 30 дней
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredApplications = applications.filter(app => 
            new Date(app.createdAt) > thirtyDaysAgo
        );
        
        localStorage.setItem('applications', JSON.stringify(filteredApplications));
        alert('Старые данные успешно очищены!');
        loadAdminDashboard();
    }
}

// Управление пользователями
function loadUserManagement() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    displayUsers(users);
}

// Отображение пользователей
function displayUsers(users) {
    let usersHTML = '';
    
    if (users.length === 0) {
        usersHTML = '<p>Нет пользователей</p>';
    } else {
        usersHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ФИО</th>
                            <th>Логин</th>
                            <th>Роль</th>
                            <th>Телефон</th>
                            <th>Email</th>
                            <th>Статус</th>
                            <th>Дата регистрации</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        users.forEach(user => {
            const roleText = {
                'admin': 'Администратор',
                'dispatcher': 'Диспетчер',
                'user': 'Пользователь'
            }[user.role] || user.role;
            
            const statusBadge = user.status === 'active' ? 
                '<span class="status-badge status-completed">Активный</span>' :
                '<span class="status-badge status-new">Неактивный</span>';
            
            usersHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.fio}</td>
                    <td>${user.username}</td>
                    <td>${roleText}</td>
                    <td>${user.phone}</td>
                    <td>${user.email || '-'}</td>
                    <td>${statusBadge}</td>
                    <td>${new Date(user.registrationDate).toLocaleDateString()}</td>
                    <td>
                        <button class="btn" onclick="editUser(${user.id})">Редактировать</button>
                        <button class="btn btn-danger" onclick="deleteUser(${user.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
        
        usersHTML += '</tbody></table></div>';
    }
    
    document.getElementById('user-list').innerHTML = usersHTML;
}

// Фильтрация пользователей
function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fio.toLowerCase().includes(searchTerm) || 
                             user.username.toLowerCase().includes(searchTerm) ||
                             user.phone.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    displayUsers(filteredUsers);
}

// Показать форму добавления пользователя
function showAddUserForm() {
    document.getElementById('user-modal-title').textContent = 'Добавление пользователя';
    document.getElementById('user-id').value = '';
    document.getElementById('user-fio').value = '';
    document.getElementById('user-username').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = 'user';
    document.getElementById('user-phone').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-status').value = 'active';
    
    document.getElementById('user-modal').style.display = 'block';
}

// Редактирование пользователя
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    document.getElementById('user-modal-title').textContent = 'Редактирование пользователя';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-fio').value = user.fio;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-phone').value = user.phone;
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-status').value = user.status || 'active';
    
    document.getElementById('user-modal').style.display = 'block';
}

// Удаление пользователя
function deleteUser(userId) {
    if (confirm('Вы уверены, что хотите удалить пользователя?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        loadUserManagement();
        alert('Пользователь успешно удален!');
    }
}

// Закрытие модального окна пользователя
function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

// Обработка формы пользователя
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('user-form');
    
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userId = document.getElementById('user-id').value;
            const username = document.getElementById('user-username').value;
            
            // Проверка уникальности логина
            if (!userId && users.find(u => u.username === username)) {
                alert('Пользователь с таким логином уже существует');
                return;
            }
            
            const userData = {
                id: userId || (users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1),
                fio: document.getElementById('user-fio').value,
                username: username,
                password: document.getElementById('user-password').value || 
                         (userId ? users.find(u => u.id == userId).password : 'default123'),
                role: document.getElementById('user-role').value,
                phone: document.getElementById('user-phone').value,
                email: document.getElementById('user-email').value,
                status: document.getElementById('user-status').value,
                registrationDate: userId ? 
                    users.find(u => u.id == userId).registrationDate : 
                    new Date().toISOString()
            };

            if (userId) {
                // Редактирование существующего пользователя
                const index = users.findIndex(u => u.id == userId);
                if (index !== -1) {
                    users[index] = userData;
                }
            } else {
                // Добавление нового пользователя
                users.push(userData);
            }

            localStorage.setItem('users', JSON.stringify(users));
            closeUserModal();
            loadUserManagement();
            alert('Пользователь успешно сохранен!');
        });
    }
});

// Настройки системы
function loadSystemSettings() {
    loadEmergencyTypes();
    loadQualifications();
    loadStatuses();
    loadSystemLogs();
}

// Загрузка типов аварий
function loadEmergencyTypes() {
    const emergencyTypes = JSON.parse(localStorage.getItem('emergencyTypes')) || [];
    
    let typesHTML = '';
    emergencyTypes.forEach(type => {
        typesHTML += `
            <div class="reference-item">
                <span>${type.icon} ${type.name} (${getPriorityText(type.priority)})</span>
                <div>
                    <button class="btn btn-small" onclick="editReference('emergency', ${type.id})">Ред.</button>
                    <button class="btn btn-small btn-danger" onclick="deleteReference('emergency', ${type.id})">Уд.</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('emergency-types-list').innerHTML = typesHTML || '<p>Нет типов аварий</p>';
}

// Загрузка квалификаций
function loadQualifications() {
    const qualifications = ['Высшая категория', 'Первая категория', 'Вторая категория'];
    
    let qualsHTML = '';
    qualifications.forEach((qual, index) => {
        qualsHTML += `
            <div class="reference-item">
                <span>${qual}</span>
                <div>
                    <button class="btn btn-small" onclick="editReference('qualification', ${index})">Ред.</button>
                    <button class="btn btn-small btn-danger" onclick="deleteReference('qualification', ${index})">Уд.</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('qualifications-list').innerHTML = qualsHTML;
}

// Загрузка статусов
function loadStatuses() {
    const statuses = [
        { id: 'new', name: 'Новая' },
        { id: 'assigned', name: 'Назначена' },
        { id: 'in-progress', name: 'В работе' },
        { id: 'completed', name: 'Выполнена' }
    ];
    
    let statusesHTML = '';
    statuses.forEach(status => {
        statusesHTML += `
            <div class="reference-item">
                <span>${status.name}</span>
                <div>
                    <button class="btn btn-small" onclick="editReference('status', '${status.id}')">Ред.</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('statuses-list').innerHTML = statusesHTML;
}

// Добавление типа аварии
function addEmergencyType() {
    document.getElementById('reference-modal-title').textContent = 'Добавление типа аварии';
    document.getElementById('reference-type').value = 'emergency';
    document.getElementById('reference-id').value = '';
    document.getElementById('reference-name').value = '';
    document.getElementById('reference-description').value = '';
    document.getElementById('reference-priority').value = 'medium';
    document.getElementById('reference-icon').value = '';
    
    document.getElementById('priority-field').style.display = 'block';
    document.getElementById('icon-field').style.display = 'block';
    
    document.getElementById('reference-modal').style.display = 'block';
}

// Добавление квалификации
function addQualification() {
    document.getElementById('reference-modal-title').textContent = 'Добавление квалификации';
    document.getElementById('reference-type').value = 'qualification';
    document.getElementById('reference-id').value = '';
    document.getElementById('reference-name').value = '';
    document.getElementById('reference-description').value = '';
    
    document.getElementById('priority-field').style.display = 'none';
    document.getElementById('icon-field').style.display = 'none';
    
    document.getElementById('reference-modal').style.display = 'block';
}

// Добавление статуса
function addStatus() {
    document.getElementById('reference-modal-title').textContent = 'Добавление статуса';
    document.getElementById('reference-type').value = 'status';
    document.getElementById('reference-id').value = '';
    document.getElementById('reference-name').value = '';
    document.getElementById('reference-description').value = '';
    
    document.getElementById('priority-field').style.display = 'none';
    document.getElementById('icon-field').style.display = 'none';
    
    document.getElementById('reference-modal').style.display = 'block';
}

// Редактирование справочника
function editReference(type, id) {
    // Реализация редактирования
    alert(`Редактирование ${type} с ID ${id}`);
}

// Удаление из справочника
function deleteReference(type, id) {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
        if (type === 'emergency') {
            const emergencyTypes = JSON.parse(localStorage.getItem('emergencyTypes')) || [];
            const filteredTypes = emergencyTypes.filter(t => t.id !== id);
            localStorage.setItem('emergencyTypes', JSON.stringify(filteredTypes));
            loadEmergencyTypes();
        }
        alert('Элемент успешно удален!');
    }
}

// Закрытие модального окна справочника
function closeReferenceModal() {
    document.getElementById('reference-modal').style.display = 'none';
}

// Загрузка системных логов
function loadSystemLogs() {
    const logs = [
        `${new Date().toLocaleString()} - Система запущена`,
        `${new Date(Date.now() - 300000).toLocaleString()} - Создана новая заявка №15`,
        `${new Date(Date.now() - 600000).toLocaleString()} - Пользователь зарегистрирован`,
        `${new Date(Date.now() - 900000).toLocaleString()} - Бригада №2 назначена на заявку №14`
    ];
    
    document.getElementById('system-logs').innerHTML = logs.join('<br>');
}

// Создание резервной копии
function createBackup() {
    const backup = {
        timestamp: new Date().toISOString(),
        users: JSON.parse(localStorage.getItem('users')) || [],
        applications: JSON.parse(localStorage.getItem('applications')) || [],
        brigades: JSON.parse(localStorage.getItem('brigades')) || [],
        emergencyTypes: JSON.parse(localStorage.getItem('emergencyTypes')) || [],
        chats: JSON.parse(localStorage.getItem('chats')) || []
    };
    
    // В реальном приложении здесь был бы экспорт файла
    console.log('Резервная копия:', backup);
    alert('Резервная копия создана! Проверьте консоль браузера.');
}

// Очистка кэша
function clearCache() {
    localStorage.removeItem('tempData');
    alert('Кэш успешно очищен!');
}

// Сброс системы
function resetSystem() {
    if (confirm('ВНИМАНИЕ! Это действие полностью сбросит систему. Все данные будут удалены. Продолжить?')) {
        localStorage.clear();
        initializeData();
        alert('Система сброшена к начальным настройкам!');
        window.location.href = 'index.html';
    }
}

// Обработка формы настроек системы
document.addEventListener('DOMContentLoaded', function() {
    const settingsForm = document.getElementById('system-settings-form');
    
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Настройки системы сохранены!');
        });
    }
    
    const referenceForm = document.getElementById('reference-form');
    
    if (referenceForm) {
        referenceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const type = document.getElementById('reference-type').value;
            const name = document.getElementById('reference-name').value;
            
            if (type === 'emergency') {
                const emergencyTypes = JSON.parse(localStorage.getItem('emergencyTypes')) || [];
                const newType = {
                    id: name.toLowerCase().replace(/\s+/g, '-'),
                    name: name,
                    priority: document.getElementById('reference-priority').value,
                    icon: document.getElementById('reference-icon').value || '❓',
                    description: document.getElementById('reference-description').value
                };
                
                emergencyTypes.push(newType);
                localStorage.setItem('emergencyTypes', JSON.stringify(emergencyTypes));
                loadEmergencyTypes();
            }
            
            closeReferenceModal();
            alert('Элемент справочника успешно добавлен!');
        });
    }
});

// Инициализация при загрузке страницы администратора
document.addEventListener('DOMContentLoaded', function() {
    // Авторизация проверяется в utils.js
    
    // Проверяем, на какой странице находимся и загружаем соответствующие данные
    if (document.getElementById('system-stats')) {
        // Мы на странице admin-dashboard.html
        loadAdminDashboard();
    }
    
    if (document.getElementById('user-list')) {
        // Мы на странице user-management.html
        loadUserManagement();
    }
    
    if (document.getElementById('system-logs')) {
        // Мы на странице system-settings.html
        loadSystemSettings();
    }
});