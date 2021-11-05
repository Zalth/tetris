// Set tile size and dimensions of the game area
const TILE = 60;
const gridWidth = 10 * TILE;
const gridHeight = 15 * TILE;

const gameGrid = document.querySelector('#gameGrid');
gameGrid.style.width = gridWidth + "px";
gameGrid.style.height = gridHeight + "px";

// Create individual tiles in the game area
// Store access to the individual tiles in gridTileArr
const gridTileArr = []

for(let i = 0; i < 150; i++) {
    let gridTile = document.createElement('div');
    gridTile.id = i;
    gridTile.style.width = TILE + "px";
    gridTile.style.height = TILE + "px";
    gridTile.textContent = i;
    gameGrid.append(gridTile);
    gridTileArr.push(gridTile);
}