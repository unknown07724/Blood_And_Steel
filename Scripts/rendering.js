window.board = document.getElementById('board');
window.ctx = window.board.getContext('2d');

window.board.width = window.innerWidth;
window.board.height = window.innerHeight;
board.focus();

  fetch('provinces.json')
    .then(response => {
      if (!response.ok) throw new Error('Network Error');
      return response.json();
    })
    .then(provinces => {
      // build paths array with Path2D objects
      window.paths = provinces
        .filter(p => p.svg_path) // only provinces with paths
        .map(p => ({
          name: p.name,
          owner: p.owner,
          color: getNationData(p.owner)?.color || 'darkgray',
          path: Render(p.svg_path, getNationData(p.owner)?.color || 'darkgray')
        }));

      // warn for missing paths
      provinces.forEach(p => {
        if (!p.svg_path) {
          console.warn("No Path for " + p.name + ", it won't be shown or interacted with.");
        }
      });
    })
    .catch(error => console.error('Request failed:', error));

function Render(pathData, color) {
  const path = new Path2D(pathData);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'white';
  ctx.fill(path);
  ctx.stroke(path);
  return path; // return for paths array
}
