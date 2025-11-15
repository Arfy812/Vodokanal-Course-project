// Функции для чата
// Убедитесь, что переменная объявлена только один раз
if (typeof currentChatApplicationId === 'undefined') {
    let currentChatApplicationId = null;
}

// Загрузка списка чатов
function loadChatList() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const chatList = document.getElementById('chat-list');
    
    if (!chatList) {
        console.error('Элемент chat-list не найден');
        return;
    }
    
    chatList.innerHTML = '';

    if (applications.length === 0) {
        chatList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Нет активных заявок</div>';
        return;
    }

    applications.forEach(app => {
        const chat = chats.find(c => c.applicationId === app.id);
        const lastMessage = chat && chat.messages && chat.messages.length > 0 ? 
            chat.messages[chat.messages.length - 1] : null;

        const div = document.createElement('div');
        div.className = 'chat-list-item';
        div.style.padding = '10px';
        div.style.borderBottom = '1px solid #eee';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        div.innerHTML = `
            <div>
                <strong>Заявка №${app.id}</strong>
                <div style="font-size: 12px; color: #666;">${app.fio}</div>
                ${lastMessage ? `<div style="font-size: 12px; margin-top: 5px;">${lastMessage.text.substring(0, 30)}...</div>` : ''}
            </div>
            ${lastMessage ? `<div style="font-size: 11px; color: #999;">${new Date(lastMessage.timestamp).toLocaleTimeString()}</div>` : ''}
        `;

        div.onclick = () => openChat(app.id);
        chatList.appendChild(div);
    });
}

// Открыть чат
function openChat(applicationId) {
    currentChatApplicationId = applicationId;
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const app = applications.find(a => a.id === applicationId);
    
    if (!app) {
        console.error('Заявка не найдена:', applicationId);
        return;
    }

    const chatHeader = document.getElementById('current-chat-header');
    if (chatHeader) {
        chatHeader.innerHTML = `
            <h4>Чат по заявке №${app.id}</h4>
            <div style="font-size: 14px; color: #666;">${app.fio} - ${app.address}</div>
        `;
    }

    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message');
    
    if (messageInput) messageInput.disabled = false;
    if (sendButton) sendButton.disabled = false;

    loadChatMessages(applicationId);
}

// Загрузка сообщений чата
function loadChatMessages(applicationId) {
    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    const chat = chats.find(c => c.applicationId === applicationId);
    const messagesContainer = document.getElementById('chat-messages');
    
    if (!messagesContainer) {
        console.error('Элемент chat-messages не найден');
        return;
    }
    
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
    } else {
        messagesContainer.innerHTML = '<div class="no-chat-selected">Нет сообщений</div>';
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Отправка сообщения
function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    
    if (!text || !currentChatApplicationId) {
        console.log('Нельзя отправить пустое сообщение или чат не выбран');
        return;
    }

    const chats = JSON.parse(localStorage.getItem('chats')) || [];
    let chat = chats.find(c => c.applicationId === currentChatApplicationId);
    
    if (!chat) {
        chat = {
            applicationId: currentChatApplicationId,
            messages: []
        };
        chats.push(chat);
    }

    // Инициализируем messages если их нет
    if (!chat.messages) {
        chat.messages = [];
    }

    chat.messages.push({
        text: text,
        sender: 'dispatcher',
        timestamp: new Date().toISOString()
    });

    localStorage.setItem('chats', JSON.stringify(chats));
    input.value = '';
    loadChatMessages(currentChatApplicationId);
}

// Инициализация при загрузке страницы чата
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat module loaded');
    // Проверяем авторизацию
    if (typeof checkAuth === 'function') {
        checkAuth();
    }
    loadChatList();
});