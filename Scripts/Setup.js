playid = 'Prussia';
window.player = {
    ID: playid,
    diplomacy: {}
}

let epoch = new Date(-3471298200 * 1000); // Sunday, January 1, 1860 1:00:00 AM

let activeDiplomacyMenu = null;
let hoveredProvince = null;
let langDict = {}; // holds translations

let flagImg, nameP, warBtn, peaceBtn;

const canvas = document.createElement("canvas");
canvas.id = "board";
document.body.appendChild(canvas);

const scripts = [
  "Scripts/logic.js",
  "Scripts/Rendering.js",
  "Scripts/Date.js",
  "Scripts/Armies.js",
  "Scripts/Soundtrack.js"
];

scripts.forEach(src => {
  const s = document.createElement("script");
  s.src = src;
  document.body.appendChild(s);
});