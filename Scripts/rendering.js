const board = document.getElementById('board');
const ctx = board.getContext('2d');

board.width = window.innerWidth;
board.height = window.innerHeight;

let paths = [];
let camera = { x: 0, y: 0, zoom: 100 };

camera.x = isNaN(camera.x) ? 0 : camera.x;
camera.y = isNaN(camera.y) ? 0 : camera.y;
camera.zoom = isNaN(camera.zoom) ? 100 : camera.zoom;

// ----- getNationData safe check -----
function getNationData(name) {
  if (!window.nations) return null;
  return window.nations.find(n => n.name.toLowerCase() === name.toLowerCase());
}

// ----- try mapping provinces only once nations exist -----
function tryMapColors() {
  if (!window.nations) {
    // nations not loaded yet, try again in 10ms
    setTimeout(tryMapColors, 10);
    return;
  }

  // nations exist, fetch provinces
  fetch('provinces.json')
    .then(res => res.json())
    .then(provinces => {
      paths = provinces.map(p => ({
        pathData: p.svg_path,
        owner: p.owner,
        color: getNationData(p.owner)?.color || 'darkgray'
      }));

      fitCameraToPaths();
      drawMap();
    })
    .catch(err => console.error(err));
}

// start the polling
tryMapColors();

// ----- camera auto-fit -----
function fitCameraToPaths() {
  if (paths.length === 0) return;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  paths.forEach(p => {
    if (!p.pathData) return;
    const nums = p.pathData.match(/-?\d+(\.\d+)?/g).map(Number);
    for (let i = 0; i < nums.length; i += 2) {
      minX = Math.min(minX, nums[i]);
      maxX = Math.max(maxX, nums[i]);
      minY = Math.min(minY, nums[i + 1]);
      maxY = Math.max(maxY, nums[i + 1]);
    }
  });

  camera.x = (minX + maxX) / 2;
  camera.y = (minY + maxY) / 2;

  const scaleX = board.width / (maxX - minX);
  const scaleY = board.height / (maxY - minY);
  camera.zoom = Math.min(scaleX, scaleY) * 0.9;
}

// ----- draw map with camera -----
function drawMap() {
  ctx.clearRect(0, 0, board.width, board.height);

  paths.forEach(p => {
    if (!p.pathData) return;
    ctx.save();

    ctx.translate(
      board.width / 2 - camera.x * camera.zoom,
      board.height / 2 - camera.y * camera.zoom
    );
    ctx.scale(camera.zoom, camera.zoom);

    const path = new Path2D(p.pathData);
    ctx.fillStyle = p.color;
    ctx.fill(path);

    ctx.lineWidth = 0.5 / camera.zoom;
    ctx.strokeStyle = 'white';
    ctx.stroke(path);

    ctx.restore();
  });
}

// ----- pan camera with arrow keys -----
document.addEventListener('keydown', e => {
  const speed = 20 / camera.zoom;

  if (e.key === 'ArrowUp') camera.y -= speed;
  if (e.key === 'ArrowDown') camera.y += speed;
  if (e.key === 'ArrowLeft') camera.x -= speed;
  if (e.key === 'ArrowRight') camera.x += speed;

  drawMap();
});

// ----- zoom with mouse wheel -----
document.addEventListener('wheel', e => {
  const zoomFactor = 1 - e.deltaY * 0.001;
  camera.zoom *= zoomFactor;
  camera.zoom = Math.min(Math.max(camera.zoom, 0.05), 10);
  drawMap();
});

camera.x = isNaN(camera.x) ? 0 : camera.x;
camera.y = isNaN(camera.y) ? 0 : camera.y;
camera.zoom = isNaN(camera.zoom) ? 100 : camera.zoom;