window.language = 'en';

window.player = {
    ID: "Prussia",
    diplomacy: {}
}

window.nation = [
{
    name: "Bavaria",
    ideology: "Monarchist",
    color: "#2fc4b0",
    diplomacy: {}
},
{
    name: "Saxony",
    ideology: "Monarchist",
    color: "#40b45b",
    diplomacy: {}
}
]

diplomacymenu = `
<div class="diplomacy_menu" style="position:fixed; top:0; left:0; background:rgba(90,90,90,1); color:white; padding:10px; border-radius:2px;">
    <img src="Assets/Sprites/Flags/Starting Nations/{$name}/Nonaligned.svg" alt="Flag of {$name}" style="width: 20%; height: 20%; border: 4px ridge #505050;">
    <p>{$name}</p>
    <button onclick="alert('Declared War on {$name}')">war</button>
    <button onclick="">peace</button>
</div>`;

let activeDiplomacyMenu = null;
let hoveredProvince = null;
let langDict = {}; // holds translations

let flagImg, nameP, warBtn, peaceBtn;

// --- Parses Languages ---
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

// --- Load the language and create menu ---
fetch(`languages/${window.language}.lang`)
  .then(r => r.text())
  .then(text => {
    langDict = parseLang(text);
    if (langDict['title']) {
        document.title = langDict['title'];
    }


    // Create menu AFTER translations are ready
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = translateString(diplomacymenu, langDict);
    activeDiplomacyMenu = tempDiv.firstElementChild;
    document.body.appendChild(activeDiplomacyMenu);
    activeDiplomacyMenu.style.display = 'none'; // hide by default
    activeDiplomacyMenu.innerHeight = window.innerHeight;

    // grab elements inside for easy updates
    flagImg = activeDiplomacyMenu.querySelector('img');
    nameP = activeDiplomacyMenu.querySelector('p');
    warBtn = activeDiplomacyMenu.querySelectorAll('button')[0];
    peaceBtn = activeDiplomacyMenu.querySelectorAll('button')[1];
  });

  function getNationData(name) {
    return window.nation.find(n => n.name.toLowerCase() === name.toLowerCase());
}


function diplomacy(nationName) {
    if (!activeDiplomacyMenu) return;

    let data = getNationData(nationName);

    nameP.textContent = nationName;

    if (data) {
        flagImg.src = `Assets/Sprites/Flags/Starting Nations/${nationName}/${data.ideology}.svg`;
    } else {
        flagImg.src = `Assets/Sprites/Flags/Starting Nations/${nationName}/Nonaligned.svg`;
    }

    warBtn.onclick = () => {
        window.player.diplomacy[nationName.toLowerCase()] = "war";
        console.log(window.player.ID + " declared war on " + nationName);
    };

    peaceBtn.onclick = () => {
        if (Math.random() < 0.5 && window.player.diplomacy[nationName.toLowerCase()] === "war") {
            window.player.diplomacy[nationName.toLowerCase()] = "neutral";
        }
    };

    activeDiplomacyMenu.style.display = "block";
}


window.diplomacy = diplomacy;

// --- Provinces + hover logic ---
fetch('provinces.json')
  .then(r => r.json())
  .then(provinces => {
    const paths = provinces.map(p => ({
        name: p.name,
        owner: p.owner,
        path: new Path2D(p.svg_path),
        color: getNationData(p.owner)?.color || 'darkgray'
    }));

    board.addEventListener('mousemove', e => {
        const x = e.offsetX;
        const y = e.offsetY;
        hoveredProvince = null;
        for (const p of paths) {
            if (ctx.isPointInPath(p.path, x, y)) {
                hoveredProvince = p.owner;
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

// --- Math ---
function square(x){
    return x * x;
}
