let dateShower = document.createElement('div');
dateShower.style.position = 'fixed';
dateShower.style.top = '0%';
dateShower.style.left = '50%';
dateShower.style.transform = 'translateX(-50%)';
dateShower.style.backgroundColor = 'rgba(132, 132, 132)';
dateShower.style.padding = '5px';
dateShower.style.borderRadius = '4px';
dateShower.style.borderColor = 'rgba(132, 132, 132) rgba(132, 132, 132)';
dateShower.style.color = 'white';
dateShower.style.borderStyle = 'ridge';

document.body.appendChild(dateShower);


let speed = 180;

function clampSpeed() {
    speed = Math.max(1, Math.min(speed, 3600));
}

function speedUp() {
    speed += 2;
    clampSpeed();
    date_renderer();

}

function slowDown() {
    speed -= 2;
    clampSpeed();
    date_renderer();

}

function advanceTime(minutes) {
    epoch = new Date(epoch.getTime() + minutes * 60 * 1000);
    date_renderer();
}

function date_renderer() {
    dateShower.innerHTML = `
        <div style="font-size:20px;">
            ${epoch.toDateString()}
        </div>
        <div style="margin-top:5px;">
                <button style="height: 36px; cursor: pointer; border: none; background-color: transparent; background-position: center; background-repeat: no-repeat; background-image: url(assets/sprites/GUI/slowdown.svg); color: rgba(0, 0, 0, 0);" onclick="slowDown()">Slow Down</button>
                <button style="height: 36px; cursor: pointer; border: none; background-color: transparent; background-position: center; background-repeat: no-repeat; background-image: url(assets/sprites/GUI/speedup.svg); color: rgba(0, 0, 0, 0);" onclick="speedUp()">Speed Up</button>
            <div>Speed: ${speed} min/sec</div>
        </div>
    `;
}

date_renderer();

setInterval(() => {
    advanceTime(speed);
}, 1000);
