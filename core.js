const CONFIG = {
  CENTER: [5, 115],
  ZOOM: 3.1,
  FEED: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
  BOUNDS: { LAT: [-12, 82], LNG: [26, 180] }
};

const MAP = L.map('map', { zoomControl: false, attributionControl: false })
 .setView(CONFIG.CENTER, CONFIG.ZOOM);

L.tileLayer('https://tiles.openfreemap.org/natural_earth/ne2sr/{z}/{x}/{y}.png', {
  maxZoom: 6
}).addTo(MAP);

const renderMarker = (lat, lng, mag) => {
  const size = mag >= 5.0? 14 : 8;
  return L.marker([lat, lng], {
    icon: L.divIcon({
      className: '',
      html: `<i style="width:${size}px;height:${size}px;background:#FF1A1A;border-radius:50%;display:block;box-shadow:0 0 12px 3px rgba(255,0,0,.8);border:2px solid #FFF"></i>`
    })
  }).addTo(MAP);
};

const fetchIntel = async () => {
  const res = await fetch(CONFIG.FEED);
  const { features } = await res.json();
  return features.filter(f => {
    const [lng, lat] = f.geometry.coordinates;
    return lat >= CONFIG.BOUNDS.LAT[0] && lat <= CONFIG.BOUNDS.LAT[1] &&
           lng >= CONFIG.BOUNDS.LNG[0] && lng <= CONFIG.BOUNDS.LNG[1];
  });
};

fetchIntel().then(data => {
  document.getElementById('feed').innerHTML = data.slice(0, 24).map(f => `
    <div class="card">
      <span class="mag ${f.properties.mag >= 5? 'alert' : ''}">${f.properties.mag.toFixed(1)}</span>
      <div><p>${f.properties.place}</p><small>${new Date(f.properties.time).toLocaleString('id-ID')}</small></div>
    </div>
  `).join('');
  data.forEach(f => {
    const [lng][lat] = f.geometry.coordinates;
    renderMarker(lat, lng, f.properties.mag);
  });
});
