const map = L.map('map').setView([48.3794, 31.1656], 6); // Центр України

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

let markers = [];
let tempMarker = null;

// Додати мітку до мапи
function addMarkerToMap(lat, lng, title, description, category) {
    const popupContent = `
        <div class="marker-popup">
            <b>${title}</b>
            <p>${description}</p>
            <p><i>Категорія: ${category}</i></p>
            <button onclick="editMarker(${lat}, ${lng})">Оновити</button>
            <button onclick="deleteSingleMarker(${lat}, ${lng})">Видалити</button>
        </div>
    `;
    const marker = L.marker([lat, lng]).addTo(map).bindPopup(popupContent);
    marker.meta = { lat, lng, title, description, category };
    markers.push(marker);
}

// Зберегти всі мітки
function saveMarkersToLocalStorage() {
    const data = markers.map(marker => marker.meta);
    localStorage.setItem('travelMarkers', JSON.stringify(data));
}

// Видалення окремої мітки
function deleteSingleMarker(lat, lng) {
    markers = markers.filter(marker => {
        const isSame = marker.meta.lat === lat && marker.meta.lng === lng;
        if (isSame) {
            map.removeLayer(marker);
        }
        return !isSame;
    });
    saveMarkersToLocalStorage();
}

// Редагування мітки
function editMarker(lat, lng) {
    const marker = markers.find(m => m.meta.lat === lat && m.meta.lng === lng);
    if (!marker) return;

    const form = document.getElementById('markerForm');
    form.dataset.lat = lat;
    form.dataset.lng = lng;
    document.getElementById('title').value = marker.meta.title;
    document.getElementById('description').value = marker.meta.description;
    document.getElementById('category').value = marker.meta.category;

    map.removeLayer(marker);
    markers = markers.filter(m => m !== marker);
    saveMarkersToLocalStorage();
}

// Завантаження збережених міток
if (localStorage.getItem('travelMarkers')) {
    const savedMarkers = JSON.parse(localStorage.getItem('travelMarkers'));
    savedMarkers.forEach(m => {
        addMarkerToMap(m.lat, m.lng, m.title, m.description, m.category);
    });
}

// Клік по карті — додається тимчасова мітка
map.on('click', function (e) {
    const { lat, lng } = e.latlng;

    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }

    tempMarker = L.marker([lat, lng]).addTo(map).bindPopup("Заповніть форму").openPopup();

    const form = document.getElementById('markerForm');
    form.dataset.lat = lat;
    form.dataset.lng = lng;
});

// Обробка форми
document.getElementById('markerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const lat = parseFloat(this.dataset.lat);
    const lng = parseFloat(this.dataset.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }

        addMarkerToMap(lat, lng, title, description, category);
        saveMarkersToLocalStorage();

        this.reset();
        delete this.dataset.lat;
        delete this.dataset.lng;
    }
});

// Очистка форми
document.getElementById('deleteBtn')?.addEventListener('click', () => {
    const form = document.getElementById('markerForm');
    form.reset();
    delete form.dataset.lat;
    delete form.dataset.lng;

    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
});

// Видалити всі мітки
document.getElementById('clear').addEventListener('click', function (e) {
    e.preventDefault();

    // Видалити всі маркери з карти
    markers.forEach(marker => {
        map.removeLayer(marker);
    });

    // Очистити масив та localStorage
    markers = [];
    localStorage.removeItem('travelMarkers');
});
