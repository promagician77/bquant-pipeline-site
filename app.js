// Chart interaction: toggles, and a crosshair with the month's values for the lines shown.
const D = JSON.parse(document.getElementById('chart-data').textContent);
const svg = document.getElementById('curves'), tip = document.getElementById('tip'), cross = document.getElementById('cross'), hit = document.getElementById('hit');
const color = k => svg.querySelector(`.line[data-k="${k}"]`).style.stroke;
const shown = k => !svg.querySelector(`.line[data-k="${k}"]`).classList.contains('off');
document.querySelectorAll('.toggles input').forEach(cb => cb.addEventListener('change', () => {
  svg.querySelectorAll(`[data-k="${cb.dataset.k}"]`).forEach(el => el.classList.toggle('off', !cb.checked));
}));
function show(clientX) {
  const box = svg.getBoundingClientRect(), scale = D.W / box.width;
  const x = (clientX - box.left) * scale;
  const i = Math.max(0, Math.min(D.dates.length - 1, Math.round((x - D.L) / (D.R - D.L) * (D.dates.length - 1))));
  const cx = D.L + (D.R - D.L) * i / (D.dates.length - 1);
  cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('visibility', 'visible');
  const keys = Object.keys(D.series).filter(shown);
  tip.innerHTML = `<b>${D.dates[i]}</b><br>` + keys.map(k => `<i style="background:${color(k)}"></i>${D.names[k]}: ${D.series[k][i].toFixed(2)}`).join('<br>');
  tip.hidden = false;
  const px = cx / scale;
  tip.style.left = (px > box.width * 0.6 ? px - tip.offsetWidth - 12 : px + 12) + 'px';
}
hit.addEventListener('pointermove', ev => show(ev.clientX));
hit.addEventListener('pointerleave', () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); });
