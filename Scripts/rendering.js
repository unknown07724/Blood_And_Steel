const board = document.getElementById('board');
const ctx = board.getContext('2d');

board.width = window.innerWidth;
board.height = window.innerHeight;

window.provinces = {}; // single source of truth

let camera = { x: 0, y: 0, zoom: 100 };

camera.x = isNaN(camera.x) ? 0 : camera.x;
camera.y = isNaN(camera.y) ? 0 : camera.y;
camera.zoom = isNaN(camera.zoom) ? 100 : camera.zoom;



function getNationData(name) {
  if (!window.nations) return null;
  return window.nations.find(
    n => n.name.toLowerCase() === name.toLowerCase()
  );
}

//loads the provinces

fetch('provinces.json')
  .then(res => res.json())
  .then(data => {

    for (const p of data) {
      window.provinces[p.name] = {
        pathData: p.svg_path,
        path: new Path2D(p.svg_path),
        owner: p.owner,
        center: { x: p.center_x || 0, y: p.center_y || 0 }
      };
    }

    fitCameraToPaths();
    drawMap();
  })
  .catch(err => console.error(err));


// fits the provinces to camera

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

// does what it says in the name.

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
  drawArmies();
}



//let's the player move the camera

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

function resetCamera() {
  camera.y = -50;
  camera.zoom = 100;
}

//renders armies
function drawArmies() {
  if (!window.armies) return;

  for (const army of window.armies) {
    const province = window.provinces[army.location];
    if (!province || !province.center) continue;

    const nation = getNationData(army.owner);
    if (!nation) continue;

    const { x, y } = province.center;
    const size = 15; // scales with zoom
    ctx.fillStyle = shadeColor(nation.color, 20); // slightly darker
    ctx.fillRect(x - size/2, y - size/2, size, size);
  }
}

// helper: darken color by percent
function shadeColor(color, percent) {
  const f=parseInt(color.slice(1),16),t=percent<0?0:255,p=Math.abs(percent)/100,
        R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000+(
    Math.round((t-R)*p)+R)*0x10000+
    (Math.round((t-G)*p)+G)*0x100+
    (Math.round((t-B)*p)+B)
  ).toString(16).slice(1);
}