const board = document.getElementById('board');
const ctx = board.getContext('2d');

board.width = window.innerWidth;
board.height = window.innerHeight;

/* ===========================
   GLOBAL STATE
=========================== */

window.provinces = {}; // single source of truth

let camera = { x: 0, y: 0, zoom: 100 };

camera.x = isNaN(camera.x) ? 0 : camera.x;
camera.y = isNaN(camera.y) ? 0 : camera.y;
camera.zoom = isNaN(camera.zoom) ? 100 : camera.zoom;


/* ===========================
   SAFE NATION LOOKUP
=========================== */

function getNationData(name) {
  if (!window.nations) return null;
  return window.nations.find(
    n => n.name.toLowerCase() === name.toLowerCase()
  );
}


/* ===========================
   LOAD PROVINCES (ONCE)
=========================== */

fetch('provinces.json')
  .then(res => res.json())
  .then(data => {

    for (const p of data) {
      window.provinces[p.name] = {
        pathData: p.svg_path,
        path: new Path2D(p.svg_path),
        owner: p.owner
      };
    }

    fitCameraToPaths();
    drawMap();
  })
  .catch(err => console.error(err));


/* ===========================
   CAMERA AUTO-FIT
=========================== */

function fitCameraToPaths() {

  const names = Object.keys(window.provinces);
  if (names.length === 0) return;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const name of names) {
    const p = window.provinces[name];

    if (!p.pathData) continue;

    const nums = p.pathData.match(/-?\d+(\.\d+)?/g)?.map(Number);
    if (!nums) continue;

    for (let i = 0; i < nums.length; i += 2) {
      minX = Math.min(minX, nums[i]);
      maxX = Math.max(maxX, nums[i]);
      minY = Math.min(minY, nums[i + 1]);
      maxY = Math.max(maxY, nums[i + 1]);
    }
  }

  camera.x = (minX + maxX) / 2;
  camera.y = (minY + maxY) / 2;

  const scaleX = board.width / (maxX - minX);
  const scaleY = board.height / (maxY - minY);

  camera.zoom = Math.min(scaleX, scaleY) * 0.9;
}


/* ===========================
   DRAW MAP
=========================== */

function drawMap() {

  ctx.clearRect(0, 0, board.width, board.height);

  ctx.save();

  ctx.translate(
    board.width / 2 - camera.x * camera.zoom,
    board.height / 2 - camera.y * camera.zoom
  );

  ctx.scale(camera.zoom, camera.zoom);

  for (const name in window.provinces) {

    const province = window.provinces[name];

    const nation = getNationData(province.owner);
    const color = nation?.color || 'darkgray';

    ctx.fillStyle = color;
    ctx.fill(province.path);

    ctx.lineWidth = 0.5 / camera.zoom;
    ctx.strokeStyle = 'white';
    ctx.stroke(province.path);
  }

  ctx.restore();
}



/* ===========================
   CAMERA CONTROLS
=========================== */

document.addEventListener('keydown', e => {

  const speed = 20 / camera.zoom;

  if (e.key === 'ArrowUp') camera.y -= speed;
  if (e.key === 'ArrowDown') camera.y += speed;
  if (e.key === 'ArrowLeft') camera.x -= speed;
  if (e.key === 'ArrowRight') camera.x += speed;

  drawMap();
});

document.addEventListener('wheel', e => {

  const zoomFactor = 1 - e.deltaY * 0.001;

  camera.zoom *= zoomFactor;
  camera.zoom = Math.min(Math.max(camera.zoom, 0.05), 10);

  drawMap();
});


camera.y = -50;
camera.zoom = 100;