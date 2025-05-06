// Ініціалізація мапи
var map = L.map('map').setView([51.505, -0.09], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Перевірки збережених маркерів у localStorage
loadMarkers();

// Додавання маркеру на мапі
map.on('click', function(e) {
    var latitude = e.latlng.lat;
    var longitude = e.latlng.lng;

    var newMarker = L.marker([latitude, longitude]).addTo(map);

    // Додаємо форму для запису про місце
    var popupContent = `
    <form class="popup-form" onsubmit="saveData(event, ${latitude}, ${longitude}, this, ${newMarker._leaflet_id})">
        <label>Назва місця:</label><br>
        <input type="text" name="placeName" placeholder="Назва"><br><br>
        <label>Опис:</label><br>
        <textarea name="placeDescription" placeholder="Опис"></textarea><br><br>
        <button type="submit">Зберегти</button>
    </form>`;

    newMarker.bindPopup(popupContent).openPopup();
});

// Функція для береження міток у localStorage
function saveData(event, latitude, longitude, form, markerId) {
    event.preventDefault();

    // Отримаємо дані з форми
    var placeName = form.placeName.value;
    var placeDescription = form.placeDescription.value;

    // Створюємо об'єкт маркеру
    var markerData = {
        latitude: latitude,
        longitude: longitude,
        name: placeName,
        description: placeDescription,
        id: markerId
    };

    // Отримаємо поточні маркері з localStorage
    var savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];

    // Додаємо нову мітку до списку
    savedMarkers.push(markerData);

    // Зберігаємо оновлені бармкери в localStorage
    localStorage.setItem('markers', JSON.stringify(savedMarkers));

    // Надаємо можливість мітці для редагування чи видалення
    var marker = map._layers[markerId];
    var popupContent = `
    <div class="marker-popup">
        <b>${placeName}</b><br>${placeDescription}<br>
        <button onclick="deleteMarker(${markerId})">Видалити</button>
        <button onclick="editMarker(${markerId})">Редагувати</button>
    </div>
    `;
    marker.bindPopup(popupContent).openPopup();
}

// Функція для завантаження міток з localStorage
function loadMarkers() {
    var savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];

    savedMarkers.forEach(function(markerData) {
        var marker = L.marker([markerData.latitude, markerData.longitude]).addTo(map);
        var popupContent = `
            <b>${markerData.name}</b><br>${markerData.description}<br>
            <button onclick="deleteMarker(${marker._leaflet_id})">Видалити</button>
            <button onclick="editMarker(${marker._leaflet_id})">Редагувати</button>
        `;
        marker.bindPopup(popupContent);

        markerData.id = marker._leaflet_id;
        localStorage.setItem('markers', JSON.stringify(savedMarkers));
    });
}

// Функція для видалення маркера 
function deleteMarker(markerId) {
    var marker = map._layers[markerId];
    if (marker) {
        map.removeLayer(marker);
    }

    // Видаляемо маркер з localStorage
    var savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    savedMarkers = savedMarkers.filter(function(markerData) {
        return markerData.id !== markerId;
    });

    localStorage.setItem('markers', JSON.stringify(savedMarkers));
}

// Функція для оновлення даних мітки
function editMarker(markerId) {
    var marker = map._layers[markerId];
    if (marker) {
        var savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
        var markerData = savedMarkers.find(function(marker) {
            return marker.id === markerId;
        });

        var popupContent = `
            <form class="popup-form" onsubmit="updateData(event, ${markerData.latitude}, ${markerData.longitude}, this, ${markerId})">
                <label>Назва місця:</label><br>
                <input type="text" name="placeName" value="${markerData.name}" placeholder="Назва"><br><br>
                <label>Опис:</label><br>
                <textarea name="placeDescription" placeholder="Описание">${markerData.description}</textarea><br><br>
                <button type="submit">Оновити</button>
            </form>`;

        marker.bindPopup(popupContent).openPopup();
    }
}

// Функція для оновлення даних в localStorage
function updateData(event, latitude, longitude, form, markerId) {
    event.preventDefault();

    var placeName = form.placeName.value;
    var placeDescription = form.placeDescription.value;

    var savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];

    var markerDataIndex = savedMarkers.findIndex(function(marker) {
        return marker.id === markerId;
    });
    if (markerDataIndex !== -1) {
        savedMarkers[markerDataIndex].name = placeName;
        savedMarkers[markerDataIndex].description = placeDescription;
        localStorage.setItem('markers', JSON.stringify(savedMarkers));
    }

    var marker = map._layers[markerId];
    var popupContent = `
        <div class="marker-popup">
            <b>${placeName}</b><br>${placeDescription}<br>
            <button onclick="deleteMarker(${markerId})">Видалити</button>
            <button onclick="editMarker(${markerId})">Редагувати</button>
        </div>
    `;
    marker.bindPopup(popupContent).openPopup();
}

document.querySelector("#clear").onclick = function() {
    localStorage.clear();
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
};

// Отримання елемента "Увійти" як кнопки для завантаження модульного вікна 
var loginBtn = document.getElementById("loginBtn");
var loginModal = document.getElementById("loginModal");
var closeModal = document.getElementsByClassName("close")[0];

loginBtn.onclick = function() {
    loginModal.style.display = "block";
}

// Закриття модульного вікна
closeModal.onclick = function() {
    loginModal.style.display = "none";
}

// Закриття модульного вікна при натисканні за його межами
window.onclick = function(event) {
    if (event.target === loginModal) {
        loginModal.style.display = "none";
    }
}




