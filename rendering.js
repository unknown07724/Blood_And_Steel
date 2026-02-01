const board = document.getElementById('board');
const ctx = board.getContext('2d');

board.width = window.innerWidth;
board.height = window.innerHeight;

fetch('provinces.json')
  .then(response => {
    if (!response.ok) throw new Error('Network Error');
    return response.json();
  })
  .then(provinces => {
    provinces.forEach(province => {
      if (province.svg_path) { // only render if path exists
        Render(province.svg_path);
      }
    });
  })
  .catch(error => {
    console.error('Fetch failed:', error);
  });

function Render(pathData) {
  const path = new Path2D(pathData);
  ctx.fillStyle = 'darkgray';
  ctx.strokeStyle = 'white';
  ctx.fill(path);
  ctx.stroke(path);
}
