// Set tile size and dimensions of the game area
const TILE = 60;
const gridWidth = 10 * TILE + 20;
const gridHeight = 15 * TILE + 30;

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
    gridTile.style.border = "1px solid white"
    gridTile.textContent = i;
    gameGrid.append(gridTile);
    gridTileArr.push(gridTile);
}

// Define shapes array
const shapes = [];

const lineShape = [
    [0, 10, 20, 30],
    [0, 1, 2, 3],
    [0, 10, 20, 30],
    [0, 1, 2, 3]
]
shapes.push(lineShape);

const lShape = [
    [0, 10, 20, 21],
    [0, 1, 2, 10],
    [0, 1, 11, 21],
    [2, 10, 11, 12]
]
shapes.push(lShape)

const revLShape = [
    [1, 11, 21, 20],
    [10, 11, 12, 0],
    [0, 10, 20, 1],
    [0, 1, 2, 12]
]
shapes.push(revLShape)

const tShape = [
    [0, 1, 2, 11],
    [10, 1, 11, 21],
    [10, 11, 12, 1],
    [0, 10, 20, 11]
]
shapes.push(tShape)

const squareShape = [
    [0, 1, 10, 11],
    [0, 1, 10, 11],
    [0, 1, 10, 11],
    [0, 1, 10, 11]
]
shapes.push(squareShape)

const sShape = [
    [1, 2, 10, 11],
    [0, 10, 11, 21],
    [1, 2, 10, 11],
    [0, 10, 11, 21]
]
shapes.push(sShape)

const revSShape = [
    [0, 1, 11, 12],
    [1, 10, 11, 20],
    [0, 1, 11, 12],
    [1, 10, 11, 20]
]
shapes.push(revSShape)

let testShapePos = 6
shapes[testShapePos][0].forEach(tilePos => {
    gridTileArr[tilePos].style.backgroundColor = 'red';

})
shapes[testShapePos][1].forEach(tilePos => {
    gridTileArr[tilePos+5].style.backgroundColor = 'red';

})
shapes[testShapePos][2].forEach(tilePos => {
    gridTileArr[tilePos+50].style.backgroundColor = 'red';

})
shapes[testShapePos][3].forEach(tilePos => {
    gridTileArr[tilePos+55].style.backgroundColor = 'red';

})