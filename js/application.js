// Функции для работы с заявками
var applicationUploadedFiles = [];

// Выбор типа аварии
function selectEmergencyType(type, element) {
    console.log('selectEmergencyType вызвана с типом:', type);
    
    try {
        // Снимаем выделение со всех элементов
        const allTypes = document.querySelectorAll('.emergency-type');
        allTypes.forEach(el => {
            el.classList.remove('selected');
            el.style.backgroundColor = '';
            el.style.borderColor = '';
        });
        
        // Добавляем выделение к выбранному элементу
        element.classList.add('selected');
        element.style.backgroundColor = '#e3f2fd';
        element.style.borderColor = '#0066cc';
        
        // Сохраняем выбранный тип
        sessionStorage.setItem('selectedEmergencyType', type);
        console.log('Тип сохранен в sessionStorage:', type);
        
    } catch (error) {
        console.error('Ошибка в selectEmergencyType:', error);
    }
}

// Переход к следующему шагу
function nextStep(stepNumber) {
    console.log('nextStep вызван:', stepNumber);
    
    // Проверяем, выбран ли тип аварии на первом шаге
    if (stepNumber === 2) {
        const selectedType = sessionStorage.getItem('selectedEmergencyType');
        console.log('Проверка типа для шага 2:', selectedType);
        
        if (!selectedType) {
            alert('Пожалуйста, выберите тип аварии');
            return;
        }
    }
    
    // Переключаем шаги
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    const nextStepElement = document.getElementById(`step-${stepNumber}`);
    if (nextStepElement) {
        nextStepElement.classList.add('active');
    }
    
    // Обновляем сводку на последнем шаге
    if (stepNumber === 5) {
        updateApplicationSummary();
    }
}

// Переход к предыдущему шагу
function prevStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step-${stepNumber}`).classList.add('active');
}

// Обновление сводки заявки
function updateApplicationSummary() {
    const selectedType = sessionStorage.getItem('selectedEmergencyType');
    const address = document.getElementById('address').value;
    const fio = document.getElementById('contact-fio').value;
    const phone = document.getElementById('contact-phone').value;
    const email = document.getElementById('contact-email').value;
    const description = document.getElementById('problem-description').value;
    
    const emergencyTypes = JSON.parse(localStorage.getItem('emergencyTypes')) || [];
    const type = emergencyTypes.find(t => t.id === selectedType);
    
    let summaryHTML = `
        <p><strong>Тип аварии:</strong> ${type ? type.name : 'Не выбран'}</p>
        <p><strong>Адрес:</strong> ${address || 'Не указан'}</p>
        <p><strong>ФИО:</strong> ${fio || 'Не указано'}</p>
        <p><strong>Телефон:</strong> ${phone || 'Не указан'}</p>
        <p><strong>Email:</strong> ${email || 'Не указан'}</p>
        <p><strong>Описание проблемы:</strong> ${description || 'Не указано'}</p>
    `;
    
    document.getElementById('application-summary').innerHTML = summaryHTML;
    
    const photosSummary = document.getElementById('photos-summary');
    if (applicationUploadedFiles.length > 0) {
        photosSummary.innerHTML = `<p><strong>Прикрепленные файлы:</strong> ${applicationUploadedFiles.length} файл(ов)</p>`;
    } else {
        photosSummary.innerHTML = '';
    }
}

// Отправка заявки
function submitApplication() {
    const selectedType = sessionStorage.getItem('selectedEmergencyType');
    const address = document.getElementById('address').value;
    const fio = document.getElementById('contact-fio').value;
    const phone = document.getElementById('contact-phone').value;
    const email = document.getElementById('contact-email').value;
    const description = document.getElementById('problem-description').value;
    
    if (!selectedType || !address || !fio || !phone) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    const emergencyTypes = JSON.parse(localStorage.getItem('emergencyTypes')) || [];
    const type = emergencyTypes.find(t => t.id === selectedType);
    
    if (!type) {
        alert('Ошибка: выбранный тип аварии не найден');
        return;
    }
    
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Сохраняем фотографии как base64 строки
    const photoUrls = [];
    for (let i = 0; i < Math.min(applicationUploadedFiles.length, 5); i++) {
        photoUrls.push(applicationUploadedFiles[i].data); // Используем base64 данные
    }
    
    const newApplication = {
        id: applications.length > 0 ? Math.max(...applications.map(a => a.id)) + 1 : 1,
        type: type.name,
        priority: type.priority,
        address: address,
        coordinates: [59.9343, 30.3351],
        fio: fio,
        phone: phone,
        email: email,
        description: description,
        status: 'new',
        createdAt: new Date().toISOString(),
        userId: currentUser.id,
        brigadeId: null,
        photos: photoUrls, // Теперь это base64 строки, а не blob URLs
        timeline: [
            { status: 'new', timestamp: new Date().toISOString() }
        ]
    };
    
    applications.push(newApplication);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    sessionStorage.removeItem('selectedEmergencyType');
    applicationUploadedFiles = []; // Очищаем временные файлы
    
    alert(`Заявка №${newApplication.id} успешно создана!`);
    window.location.href = 'user-profile.html';
}

// Предпросмотр файлов
function previewFiles(files) {
    const preview = document.getElementById('file-preview');
    preview.innerHTML = '';
    applicationUploadedFiles = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert(`Файл "${file.name}" слишком большой. Максимальный размер: 5MB`);
            continue;
        }
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Сохраняем файл как base64
                applicationUploadedFiles.push({
                    name: file.name,
                    type: file.type,
                    data: e.target.result // base64 строка
                });
                
                // Создаем превью
                const div = document.createElement('div');
                div.className = 'photo-item';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <div style="position: absolute; top: 5px; right: 5px; background: red; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; cursor: pointer;" onclick="removeFile(${applicationUploadedFiles.length - 1})">×</div>
                `;
                preview.appendChild(div);
            };
            reader.onerror = function() {
                alert(`Ошибка при чтении файла: ${file.name}`);
            };
            reader.readAsDataURL(file);
        } else {
            alert(`Файл "${file.name}" не является изображением. Пожалуйста, выберите изображение.`);
        }
    }
}

// Удаление файла из предпросмотра
function removeFile(index) {
    applicationUploadedFiles.splice(index, 1);
    // Перерисовываем превью
    const preview = document.getElementById('file-preview');
    preview.innerHTML = '';
    
    applicationUploadedFiles.forEach((file, i) => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        div.innerHTML = `
            <img src="${file.data}" alt="Preview">
            <div style="position: absolute; top: 5px; right: 5px; background: red; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; cursor: pointer;" onclick="removeFile(${i})">×</div>
        `;
        preview.appendChild(div);
    });
}

// Загрузка заявок пользователя
function loadUserApplications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    
    const userApplications = applications.filter(app => app.userId === currentUser.id);
    
    let applicationsHTML = '';
    
    if (userApplications.length === 0) {
        applicationsHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                <h3>У вас пока нет заявок</h3>
                <p>Нажмите кнопку "Подать заявку" чтобы создать первую заявку</p>
                <a href="application.html" class="btn" style="margin-top: 20px;">Подать заявку</a>
            </div>
        `;
    } else {
        applicationsHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Тип</th>
                            <th>Адрес</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        userApplications.forEach(app => {
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
            
            applicationsHTML += `
                <tr>
                    <td>${app.id}</td>
                    <td>${app.type}</td>
                    <td>${app.address}</td>
                    <td>${new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn" onclick="viewApplicationDetails(${app.id})">👁️ Подробнее</button>
                    </td>
                </tr>
            `;
        });
        
        applicationsHTML += '</tbody></table></div>';
    }
    
    document.getElementById('user-applications').innerHTML = applicationsHTML;
}

// Инициализация при загрузке страницы заявки
if (document.getElementById('step-1')) {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('application.js загружен для страницы подачи заявки');
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Заполняем контактные данные
        if (document.getElementById('contact-fio')) {
            document.getElementById('contact-fio').value = currentUser.fio || '';
            document.getElementById('contact-phone').value = currentUser.phone || '';
            document.getElementById('contact-email').value = currentUser.email || '';
        }
        
        // Очищаем предыдущий выбор
        sessionStorage.removeItem('selectedEmergencyType');
        document.querySelectorAll('.emergency-type').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Добавляем обработчики для типов аварий
        const emergencyTypes = document.querySelectorAll('.emergency-type');
        console.log('Найдено типов аварий:', emergencyTypes.length);
        
        emergencyTypes.forEach(type => {
            type.addEventListener('click', function() {
                const typeId = this.getAttribute('data-type');
                console.log('Клик на тип:', typeId);
                selectEmergencyType(typeId, this);
            });
        });
    });
}