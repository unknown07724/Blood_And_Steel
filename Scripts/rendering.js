const board = document.getElementById('board');
const ctx = board.getContext('2d');

board.width = window.innerWidth;
board.height = window.innerHeight;

let paths = [];
let camera = { x: 0, y: 0, zoom: 100 };



// fetch provinces JSON
fetch('provinces.json')
  .then(res => res.json())
  .then(provinces => {
    // store pathData + color
    
    paths = provinces.map(p => ({
      pathData: p.svg_path,
      color: getNationData(p.owner)?.color || 'darkgray'
    }));

    // auto-fit camera at start
    fitCameraToPaths();
    drawMap();
  })
  .catch(err => console.error(err));

  camera.x = Number(camera.x) || 0;
  camera.y = Number(camera.y) || 0;
  camera.zoom = Number(camera.zoom) || 100;
  
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
      minY = Math.min(minY, nums[i+1]);
      maxY = Math.max(maxY, nums[i+1]);
    }
  });

  // center camera
  camera.x = (minX + maxX) / 2;
  camera.y = (minY + maxY) / 2;

  // zoom to fit
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

    // apply camera: move to center and adjust for pan/zoom
    ctx.translate(board.width / 2 - camera.x * camera.zoom, board.height / 2 - camera.y * camera.zoom);
    ctx.scale(camera.zoom, camera.zoom);

    const path = new Path2D(p.pathData);
    ctx.fillStyle = p.color;
    ctx.fill(path);
    ctx.lineWidth = 0.5 / camera.zoom; // keep stroke width consistent
    ctx.strokeStyle = 'white';
    ctx.stroke(path);

    ctx.restore();
  });
}

// ----- pan camera with arrow keys -----
document.addEventListener('keydown', e => {
  const speed = 20 / camera.zoom; // adjust speed to zoom level

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
  camera.zoom = Math.min(Math.max(camera.zoom, 0.05), 10); // clamp to safe range
  drawMap();
});

