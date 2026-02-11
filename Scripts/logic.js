window.language = 'de';

diplomacymenu = `
<div class="diplomacy_menu" style="position:fixed; top:0; left:0; background:rgba(90,90,90,255); color:white; padding:10px; border-radius:2px;">
    <img src="Assets/Sprites/Flags/Starting Nations/Prussia/Nonaligned.svg" alt="Flag of {$name}" style="width: 20%; height: 20%; border: 4px ridge #505050;">
    <p>{$name}</p>
    <button onclick="alert('Declared War on {$name}')">war</button>
    <button onclick="">peace</button>
</div>
`;

let activeDiplomacyMenu = null;
let hoveredProvince = null;
let langDict = {}; // holds translations

// --- Load the language ---
fetch(`languages/${window.language}.lang`)
  .then(r => r.text())
  .then(text => {
    langDict = parseLang(text);
    if (langDict['title']) {
        document.title = langDict['title']; //
    }
  });

// --- Lang parser ---
function parseLang(langString) {
    const dict = {};
    const lines = langString.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('[')) continue;
        const [key, value] = line.split('=').map(s => s.trim());
        if (key && value) dict[key] = value;
    }
    return dict;
}

// --- Translate string using dictionary ---
function translateString(str, dict) {
    let translated = str;
    for (const key in dict) {
        const re = new RegExp(key, 'g');
        translated = translated.replace(re, dict[key]);
    }
    return translated;
}

// --- Diplomacy menu toggle ---
function diplomacy(nation) {
    if (!activeDiplomacyMenu) {
        // first time: create the menu
        const div = document.createElement('div');
        div.innerHTML = translateString(diplomacymenu, langDict);
        activeDiplomacyMenu = div.firstElementChild;
        document.body.appendChild(activeDiplomacyMenu);
    }

    // update the name dynamically per province
    activeDiplomacyMenu.querySelector('p').textContent = nation;
    activeDiplomacyMenu.querySelector('button').onclick = () => {
        alert('Declared War on ' + nation);
    };
}

window.diplomacy = diplomacy;

// --- Provinces + hover logic ---
fetch('provinces.json')
  .then(r => r.json())
  .then(provinces => {
    const paths = provinces.map(p => ({
        name: p.name,
        path: new Path2D(p.svg_path)
    }));

    board.addEventListener('mousemove', e => {
        const x = e.offsetX;
        const y = e.offsetY;
        hoveredProvince = null;
        for (const p of paths) {
            if (ctx.isPointInPath(p.path, x, y)) {
                hoveredProvince = p.name;
                break;
            }
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'e' && hoveredProvince) {
            diplomacy(hoveredProvince);
        }
    });
  });








  // Functions
  function square(x){
    return x * x;
  }