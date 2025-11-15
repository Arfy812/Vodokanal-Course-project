// Обработка формы авторизации
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Успешный вход - редирект на соответствующую страницу
                setTimeout(() => {
                    switch(user.role) {
                        case 'admin':
                            window.location.href = 'admin-dashboard.html';
                            break;
                        case 'dispatcher':
                            window.location.href = 'dispatcher-dashboard.html';
                            break;
                        case 'user':
                            window.location.href = 'user-profile.html';
                            break;
                    }
                }, 100);
            } else {
                alert('Неверный логин или пароль');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fio = document.getElementById('register-fio').value;
            const phone = document.getElementById('register-phone').value;
            const email = document.getElementById('register-email').value;
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            
            const users = JSON.parse(localStorage.getItem('users'));
            
            // Проверяем, существует ли пользователь с таким логином
            if (users.find(u => u.username === username)) {
                alert('Пользователь с таким логином уже существует');
                return;
            }
            
            const newUser = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                username: username,
                password: password,
                fio: fio,
                role: 'user',
                phone: phone,
                email: email,
                registrationDate: new Date().toISOString(),
                status: 'active'
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            alert('Регистрация прошла успешно! Теперь вы можете войти в систему.');
            window.location.href = 'login.html';
        });
    }
});