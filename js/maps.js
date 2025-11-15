// Глобальные переменные для карт
let addressMap, applicationMap, brigadeMap;

// Инициализация Яндекс.Карт для адреса
function initAddressMap() {
    if (typeof ymaps === 'undefined') {
        console.log('Yandex Maps API не загружена');
        return;
    }
    
    ymaps.ready(function() {
        addressMap = new ymaps.Map('address-map', {
            center: [59.9343, 30.3351],
            zoom: 13
        });
        
        // Добавляем поиск
        const searchControl = new ymaps.control.SearchControl({
            options: {
                provider: 'yandex#search',
                noPlacemark: true
            }
        });
        addressMap.controls.add(searchControl);
        
        // Обработка выбора результата поиска
        searchControl.events.add('resultselect', function (e) {
            const results = searchControl.getResultsArray();
            const selected = results[e.get('index')];
            document.getElementById('address').value = selected.properties.get('name');
            
            // Добавляем метку
            addressMap.geoObjects.removeAll();
            const placemark = new ymaps.Placemark(selected.geometry.getCoordinates(), {
                balloonContent: selected.properties.get('name')
            });
            addressMap.geoObjects.add(placemark);
            addressMap.setCenter(selected.geometry.getCoordinates(), 16);
        });
    });
}

// Поиск адреса
function searchAddress(query) {
    if (query.length < 3) {
        document.getElementById('address-suggestions').style.display = 'none';
        return;
    }

    // Эмуляция поиска адреса (в реальном приложении использовать API геокодера)
    const suggestions = [
        'г. Санкт-Петербург, ул. Примерная, д. 10',
        'г. Санкт-Петербург, ул. Примерная, д. 15',
        'г. Санкт-Петербург, ул. Примерная, д. 20'
    ];

    const suggestionsDiv = document.getElementById('address-suggestions');
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'block';

    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.style.padding = '8px';
        div.style.cursor = 'pointer';
        div.style.borderBottom = '1px solid #eee';
        div.textContent = suggestion;
        div.onclick = function() {
            document.getElementById('address').value = suggestion;
            suggestionsDiv.style.display = 'none';
            
            // Устанавливаем маркер на карте
            const coordinates = [59.9343 + Math.random() * 0.01, 30.3351 + Math.random() * 0.01];
            if (addressMap) {
                addressMap.setCenter(coordinates, 16);
                addressMap.geoObjects.removeAll();
                const placemark = new ymaps.Placemark(coordinates, {
                    balloonContent: suggestion
                });
                addressMap.geoObjects.add(placemark);
            }
        };
        suggestionsDiv.appendChild(div);
    });
}

// Инициализация Яндекс.Карт для заявки
function initApplicationMap(coordinates) {
    if (typeof ymaps === 'undefined') {
        console.log('Yandex Maps API не загружена');
        return;
    }
    
    ymaps.ready(function() {
        if (applicationMap) {
            applicationMap.destroy();
        }
        
        applicationMap = new ymaps.Map('application-map', {
            center: coordinates || [59.9343, 30.3351],
            zoom: 15
        });
        
        if (coordinates) {
            const placemark = new ymaps.Placemark(coordinates, {
                balloonContent: document.getElementById('detail-address').textContent
            });
            applicationMap.geoObjects.add(placemark);
            applicationMap.setCenter(coordinates, 15);
        }
    });
}