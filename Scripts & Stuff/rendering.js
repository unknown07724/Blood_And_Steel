window.board = document.getElementById('board');
window.ctx = window.board.getContext('2d'); 

window.board.width = window.innerWidth;
window.board.height = window.innerHeight;

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
      if (!province.svg_path) {
        console.warn("No Path for " + province.name + ", it won't be shown or interacted with.");
      }
    });
  })
  .catch(error => {
    console.error('Request failed:', error);
  });

function Render(pathData) {
  const path = new Path2D(pathData);
  ctx.fillStyle = 'darkgray';
  ctx.strokeStyle = 'white';
  ctx.fill(path);
  ctx.stroke(path);
}
