fetch('provinces.json')
  .then(r => r.json())
  .then(provinces => {
    
    const paths = provinces.map(p => ({ 
      name: p.name,
      path: new Path2D(p.svg_path) // convert the path of a province to something readable.
    }));

    board.addEventListener('mousemove', e => {
      const x = e.offsetX;
      const y = e.offsetY;

      for (const p of paths) {
        if (ctx.isPointInPath(p.path, x, y)) {
          console.log('inside:', p.name); // ensure the code works
          break;
        }
      }
    });
  });
