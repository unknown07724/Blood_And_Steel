Armies = [];



// does what it says on the tin.


function newDivision() {
    let Location = window.provinces[Math.floor(Math.random() * window.provinces.length)]
    return {
        size:   Math.round(Math.random() * 1000 + 500),
        location: Location.name,
        owner: Location.owner
    };
}