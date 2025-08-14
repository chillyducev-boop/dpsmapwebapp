const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const map = L.map('map');
const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
});
tiles.addTo(map);

map.setView([55.751244, 37.618423], 11);

const markersLayer = L.layerGroup().addTo(map);

let lastFetchTs = 0;
let liveEnabled = false;

const dpsIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
<path d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" fill="#1f6feb" stroke="white"/>
<circle cx="12" cy="11" r="3.5" fill="white"/>
</svg>`),
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

function addMarker(p) {
  const m = L.marker([p.lat, p.lng], { icon: dpsIcon })
    .bindPopup(`Пост ДПС (${p.type === 'temporary' ? 'временный' : 'стационарный'})<br><small>${new Date(p.created_at).toLocaleString()}</small>`);
  markersLayer.addLayer(m);
}

async function loadPoints() {
  const url = `/api/points?since=${lastFetchTs}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.ok) {
    data.points.forEach(addMarker);
    if (data.points.length) lastFetchTs = Math.max(lastFetchTs, ...data.points.map(p => p.created_at));
  }
}
loadPoints();
setInterval(loadPoints, 15000);

const socket = io();
socket.on('point:new', (p) => { if (liveEnabled) addMarker(p); });
document.getElementById('live').addEventListener('change', (e) => liveEnabled = e.target.checked);

let addMode = false;
document.getElementById('btn-add').addEventListener('click', () => {
  addMode = !addMode;
  alert(addMode ? 'Тапните по карте, чтобы добавить точку ДПС.' : 'Режим добавления выключен.');
});

map.on('click', async (e) => {
  if (!addMode) return;
  const confirmAdd = confirm('Добавить пост ДПС в этой точке?');
  if (!confirmAdd) return;
  const type = prompt('Введите тип: "s" — стационарный, "t" — временный', 's');
  const normalizedType = (type && type.toLowerCase() === 't') ? 'temporary' : 'stationary';
  const p = { lat: e.latlng.lat, lng: e.latlng.lng, type: normalizedType, created_at: Date.now(), source: 'webapp' };
  const res = await fetch('/api/points', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p) });
  const data = await res.json();
  if (data.ok) addMarker(p); else alert('Не удалось сохранить точку');
});

document.getElementById('btn-my-location').addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Геолокация не поддерживается.');
  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;
    map.setView([latitude, longitude], 14);
  }, () => alert('Нет доступа к геолокации. Разрешите доступ в настройках.'));
});
