// Общие утилиты и функции аутентификации

// Глобальные переменные
let currentChatApplicationId = null;
let uploadedFiles = [];
let currentStatusModal = null;
let isMobileMenuOpen = false;

// Функция для переключения мобильного меню
function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
    
    const burgerMenus = document.querySelectorAll('.burger-menu');
    const mobileMenus = document.querySelectorAll('.mobile-menu');
    
    if (isMobileMenuOpen) {
        burgerMenus.forEach(menu => menu.classList.add('active'));
        mobileMenus.forEach(menu => menu.classList.add('active'));
    } else {
        burgerMenus.forEach(menu => menu.classList.remove('active'));
        mobileMenus.forEach(menu => menu.classList.remove('active'));
    }
}

// Закрытие мобильного меню при клике на ссылку
function closeMobileMenu() {
    isMobileMenuOpen = false;
    
    const burgerMenus = document.querySelectorAll('.burger-menu');
    const mobileMenus = document.querySelectorAll('.mobile-menu');
    
    burgerMenus.forEach(menu => menu.classList.remove('active'));
    mobileMenus.forEach(menu => menu.classList.remove('active'));
}

// Закрытие мобильного меню при изменении размера окна
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

// Инициализация данных в LocalStorage при первой загрузке
function initializeData() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                fio: 'Администратор Системы',
                role: 'admin',
                phone: '+7 (999) 123-45-67',
                email: 'admin@spvodokanal.ru',
                registrationDate: new Date().toISOString()
            },
            {
                id: 2,
                username: 'dispatcher',
                password: 'disp123',
                fio: 'Диспетчер Иванов И.И.',
                role: 'dispatcher',
                phone: '+7 (999) 123-45-68',
                email: 'dispatcher@spvodokanal.ru',
                registrationDate: new Date().toISOString()
            },
            {
                id: 3,
                username: 'user',
                password: 'user123',
                fio: 'Петров П.П.',
                role: 'user',
                phone: '+7 (999) 123-45-69',
                email: 'user@example.com',
                registrationDate: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    if (!localStorage.getItem('applications')) {
        localStorage.setItem('applications', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('brigades')) {
        const defaultBrigades = [
            {
                id: 1,
                name: 'Бригада №1',
                members: ['Иванов А.А. (мастер)', 'Петров Б.Б.', 'Сидоров В.В.'],
                contacts: '+7 (999) 111-11-11',
                qualification: 'Высшая категория',
                specialization: 'Все виды работ',
                status: 'free',
                currentApplicationId: null,
                location: 'ул. Центральная, 1',
                coordinates: [59.9343, 30.3351]
            },
            {
                id: 2,
                name: 'Бригада №2',
                members: ['Кузнецов Г.Г. (мастер)', 'Николаев Д.Д.', 'Федоров Е.Е.'],
                contacts: '+7 (999) 222-22-22',
                qualification: 'Первая категория',
                specialization: 'Водопроводные сети',
                status: 'busy',
                currentApplicationId: 1,
                location: 'ул. Ленина, 15',
                coordinates: [59.9311, 30.3609]
            }
        ];
        localStorage.setItem('brigades', JSON.stringify(defaultBrigades));
    }
    
    if (!localStorage.getItem('emergencyTypes')) {
        const emergencyTypes = [
            { id: 'pipe-burst', name: 'Прорыв трубы', priority: 'high', icon: '💥' },
            { id: 'no-water', name: 'Нет воды', priority: 'high', icon: '🚱' },
            { id: 'bad-quality', name: 'Плохое качество воды', priority: 'medium', icon: '🌊' },
            { id: 'clog', name: 'Засор', priority: 'medium', icon: '🚽' },
            { id: 'leak', name: 'Протечка', priority: 'low', icon: '💧' },
            { id: 'other', name: 'Другое', priority: 'low', icon: '❓' }
        ];
        localStorage.setItem('emergencyTypes', JSON.stringify(emergencyTypes));
    }

    if (!localStorage.getItem('chats')) {
        localStorage.setItem('chats', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }

    // Добавляем демо-данные
    addDemoData();
}

// Добавляем тестовые данные для демонстрации
function addDemoData() {
    const applications = JSON.parse(localStorage.getItem('applications'));
    const chats = JSON.parse(localStorage.getItem('chats'));
    
    // Добавляем демо-заявку если их нет
    if (applications.length === 0) {
        // Создаем простые base64 placeholder изображения
        const demoPhoto1 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmYwMDAwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+0J/RgNC+0YbQtdGB0YHQuNC+INGC0YDRg9C00Ys8L3RleHQ+Cjwvc3ZnPg==';
        const demoPhoto2 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwMGZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+0JfQsNGC0LXRh9C40L3QvtC5INC90LDRh9Cw0LvRjNC90YvQuTwvdGV4dD4KPC9zdmc+';
        
        const demoApplication = {
            id: 1,
            type: 'Прорыв трубы',
            priority: 'high',
            address: 'г. Санкт-Петербург, ул. Примерная, д. 10, кв. 5',
            coordinates: [59.9343, 30.3351],
            fio: 'Иванов Иван Иванович',
            phone: '+7 (999) 123-45-67',
            email: 'ivanov@example.com',
            description: 'Сильный прорыв трубы в подвале, вода затапливает помещение. Необходима срочная помощь!',
            status: 'in-progress',
            createdAt: new Date().toISOString(),
            userId: 3,
            brigadeId: 2,
            photos: [demoPhoto1, demoPhoto2],
            timeline: [
                { status: 'new', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
                { status: 'assigned', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), brigadeId: 2 },
                { status: 'in-progress', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), comment: 'Бригада выехала на место' }
            ]
        };
        
        applications.push(demoApplication);

        const demoChat = {
            applicationId: 1,
            messages: [
                {
                    text: 'Здравствуйте! Ваша заявка принята в работе',
                    sender: 'dispatcher',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    text: 'Спасибо! Когда приедет бригада?',
                    sender: 'user',
                    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
                },
                {
                    text: 'Бригада уже в пути, ожидайте в течение 30 минут',
                    sender: 'dispatcher',
                    timestamp: new Date(Date.now() - 1.4 * 60 * 60 * 1000).toISOString()
                }
            ]
        };

        chats.push(demoChat);
        
        localStorage.setItem('applications', JSON.stringify(applications));
        localStorage.setItem('chats', JSON.stringify(chats));
    }
}

// Проверка авторизации при загрузке страницы
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    // Страницы, доступные без авторизации (публичные страницы)
    const publicPages = ['index.html', 'home.html', 'login.html', 'register.html', ''];
    
    // Если пользователь не авторизован и пытается зайти на защищенную страницу
    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Если пользователь авторизован
    if (currentUser) {
        // Главная страница и другие публичные страницы доступны всем авторизованным пользователям
        if (publicPages.includes(currentPage)) {
            return true; // Разрешаем доступ к главной странице
        }
        
        // Проверяем доступ к защищенным страницам по роли
        const rolePages = {
            'admin': ['admin-dashboard.html', 'user-management.html', 'system-settings.html'],
            'dispatcher': ['dispatcher-dashboard.html', 'brigade-management.html', 'brigade-form.html', 'chat.html', 'reports.html'],
            'user': ['user-profile.html', 'application.html', 'user-dashboard.html']
        };
        
        const allowedPages = [...publicPages, ...(rolePages[currentUser.role] || [])];
        
        if (!allowedPages.includes(currentPage)) {
            // У пользователя нет доступа к этой странице
            redirectToDashboard(currentUser.role);
            return false;
        }
    }
    
    return true;
}

// Перенаправление на dashboard по роли
function redirectToDashboard(role) {
    switch(role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'dispatcher':
            window.location.href = 'dispatcher-dashboard.html';
            break;
        case 'user':
            window.location.href = 'user-dashboard.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

// Выход из системы
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Функция для получения текста приоритета
function getPriorityText(priority) {
    switch(priority) {
        case 'high': return 'Высокий';
        case 'medium': return 'Средний';
        case 'low': return 'Низкий';
        default: return priority;
    }
}

// Функция для получения текста статуса
function getStatusText(status) {
    switch(status) {
        case 'new': return 'Новая';
        case 'assigned': return 'Назначена бригаде';
        case 'in-progress': return 'В работе';
        case 'completed': return 'Выполнена';
        default: return status;
    }
}

// Функция для открытия фотографии в модальном окне
function openPhoto(url) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
    `;
    
    modal.innerHTML = `
        <img src="${url}" style="max-width: 90%; max-height: 90%; object-fit: contain;" alt="Увеличенное фото">
        <div style="position: absolute; top: 20px; right: 20px; color: white; font-size: 30px; cursor: pointer;">×</div>
    `;
    
    modal.onclick = function(e) {
        if (e.target === modal || e.target.tagName === 'DIV') {
            document.body.removeChild(modal);
        }
    };
    
    document.body.appendChild(modal);
}

// Обработка ошибок инициализации
function handleInitError(error) {
    console.error('Ошибка инициализации:', error);
}

// Обновленная инициализация
window.onload = function() {
    try {
        initializeData();
        checkAuth();
        
        // Закрытие мобильного меню при клике на ссылку
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    } catch (error) {
        handleInitError(error);
    }
};

// Проверка роли пользователя
function checkUserRole(allowedRoles) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
        alert('У вас нет доступа к этой странице');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Получение текущего пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Проверка авторизации для главной страницы (без редиректа)
function checkAuthForHomePage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return !!currentUser;
}

// Обновление навигации для главной страницы
function updateNavigationForAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    
    if (currentUser && authLinks && userLinks) {
        authLinks.style.display = 'none';
        userLinks.style.display = 'inline';
        
        // Обновляем ссылку на личный кабинет в зависимости от роли
        const userDashboardLink = document.getElementById('user-dashboard-link');
        if (userDashboardLink) {
            let dashboardUrl = 'user-dashboard.html';
            if (currentUser.role === 'dispatcher') {
                dashboardUrl = 'dispatcher-dashboard.html';
            } else if (currentUser.role === 'admin') {
                dashboardUrl = 'admin-dashboard.html';
            }
            userDashboardLink.href = dashboardUrl;
        }
    }
}