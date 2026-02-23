window.language = 'en';

window.player = {
    ID: "Prussia",
    diplomacy: {}
}

window.nations = null;

diplomacymenu = `
<div class="diplomacymenu" style="position:fixed;top:0;left:0;background:rgba(90,90,90,1);color:white;padding:10px;border-radius:2px;">
    <img id="Flag" src="Assets/Sprites/Flags/Starting Nations/${name}/Nonaligned.svg" alt="Flag of ${name}" style="width:20%;height:20%;border:4px ridge #505050;">
    <p id="diplomacyName">${name}</p>
    <button id="warBtn">war</button>
    <button id="peaceBtn">peace</button>
</div>`;


let epoch = new Date(-3471289200 * 1000); // Sunday, January 1, 1860 1:00:00 AM

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
fetch('nations.json')
  .then(r => r.json())
  .then(nations => {
    window.nations = nations;   // SAVE the fetched data to global
  })
  .catch(err => console.error(err));

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
    if (!window.nation) return null;
    return window.nation.find(n => n.name.toLowerCase() === name.toLowerCase());
}

activeDiplomacyMenu = document.createElement('div');


function diplomacy(nationName) {
    if (!activeDiplomacyMenu) return;

    let data = getNationData(nationName);

    nameP.textContent = nationName;

    if (data) {
        flagImg.src = `Assets/Sprites/Flags/Starting Nations/${nationName}/${data.ideology}.svg`;
    } else {
        flagImg.src = `Assets/Sprites/Flags/Starting Nations/${nationName}/Nonaligned.svg`;
    }

if (nationName === player.ID) return;
 warBtn.onclick = () => {
    const playerNation = window.nations.find(n => n.id === window.player.ID);
    const targetNation = window.nations.find(n => n.name === nationName);

    if (!playerNation || !targetNation) return;

    const playerKey = playerNation.name.toLowerCase();
    const targetKey = targetNation.name.toLowerCase();

    // Declare war both ways
    playerNation.diplomacy[targetKey] = "war";
    targetNation.diplomacy[playerKey] = "war";

    console.log(playerNation.name + " declared war on " + targetNation.name);
};


peaceBtn.onclick = () => {
    const playerNation = window.nations.find(n => n.id === window.player.ID);
    const targetNation = window.nations.find(n => n.name === nationName);

    if (!playerNation || !targetNation) return;

    const playerKey = playerNation.name.toLowerCase();
    const targetKey = targetNation.name.toLowerCase();

    if (playerNation.diplomacy[targetKey] === "war" && Math.random() < 0.5) {
        playerNation.diplomacy[targetKey] = "neutral";
        targetNation.diplomacy[playerKey] = "neutral";
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
    // convert mouse to map coordinates
    const mouseX = (e.offsetX - board.width/2)/camera.zoom + camera.x;
    const mouseY = (e.offsetY - board.height/2)/camera.zoom + camera.y;

    hoveredProvince = null;
    for (const p of paths) {
        if (ctx.isPointInPath(p.path, mouseX, mouseY)) {
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
