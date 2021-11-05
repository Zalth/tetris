// Set tile size and dimensions of the game area
const game = {
    tileDimension: 60,  //Tiles are 60 px wide
    tilesWide: 10,      //10 tiles per row
    tilesHigh: 15,      //15 rows
    gridWidth: 0,       //Will update on setupGame(game)
    gridHeight: 0,      //Will update on setupGame(game)
    gridSelector: "",   //Will update on setupGame(game)
    gameWidth: "",         //Will update on setupGame(game)
    gameHeight: "",        //Will update on setupGame(game)
    tileArr: [],           //Will update on setupGame(game)
    shapeTemplates: []          //Will store all tetroids and all orientations
}

// Must call inorder to instantiate the game board
function setupGame(game) {
    // Calculates and sets the width and height of playable area in px, including tile borders using the game object
    game.gridSelector = document.querySelector('#gameGrid');
    game.gridWidth = game.tilesWide * game.tileDimension + 2 * game.tilesWide;
    game.gridHeight = game.tilesHigh * game.tileDimension + 2 * game.tilesWide;
    game.gameWidth = game.gridWidth + "px";
    game.gridSelector.style.width = game.gameWidth;
    game.gameHeight = game.gridHeight + "px";
    game.gridSelector.style.height = game.gameHeight;

    // Instantiates all game tiles with borders and adds to the tileArr
    for(let i = 0; i < game.tilesWide * game.tilesHigh; i++) {
        let gridTile = document.createElement('div');
        gridTile.id = i;
        gridTile.style.width = game.tileDimension + "px";
        gridTile.style.height = game.tileDimension + "px";
        gridTile.style.border = "1px solid white";
        gridTile.textContent = i;
        game.gridSelector.append(gridTile);
        game.tileArr.push(gridTile);
    }
}

// Called to set up the game
setupGame(game);

// Class for each individual tetroid shape and rotational orientation
class Tetroid {
    constructor(orientation0, orientation1, orientation2, orientation3) {
        this.vers0 = orientation0;
        this.vers1 = orientation1;
        this.vers2 = orientation2;
        this.vers3 = orientation3;
        this.curOrientation = 0;
    }
    
    // Method to select a rotational orientation of the tetroid
    getVersion(versionNumber) {
        if (versionNumber == 0) {
            return this.vers0;
        }
        else if (versionNumber == 1) {
            return this.vers1;
        }
        else if (versionNumber == 2) {
            return this.vers2;
        }
        else if (versionNumber == 3) {
            return this.vers3;
        }
        else {
            console.log("Error in retrieving Tetroid Version");
        }
    }
}

// Define all playable tetroid shapes and rotational orientations
// Add to the shapes array
const lineShape = new Tetroid([2, 12, 22, 32], [10, 11, 12, 13], [2, 12, 22, 32], [10, 11, 12, 13]);
game.shapeTemplates.push(lineShape);

const lShape = new Tetroid([2, 12, 22, 23], [11, 12, 13, 21], [1, 2, 12, 22], [3, 11, 12, 13]);
game.shapeTemplates.push(lShape);

const revLShape = new Tetroid([1, 11, 21, 20], [10, 11, 12, 0], [1, 11, 21, 2], [0, 1, 2, 12])
game.shapeTemplates.push(revLShape);

const tShape = new Tetroid([10, 11, 12, 21], [10, 1, 11, 21], [10, 11, 12, 1], [0, 10, 20, 11]);
game.shapeTemplates.push(tShape);

const squareShape = new Tetroid([0, 1, 10, 11], [0, 1, 10, 11], [0, 1, 10, 11], [0, 1, 10, 11]);
game.shapeTemplates.push(squareShape);

const sShape = new Tetroid([1, 2, 10, 11], [0, 10, 11, 21], [1, 2, 10, 11], [0, 10, 11, 21]);
game.shapeTemplates.push(sShape);

const revSShape = new Tetroid([0, 1, 11, 12], [1, 10, 11, 20], [0, 1, 11, 12], [1, 10, 11, 20]);
game.shapeTemplates.push(revSShape);

testShape = 1

game.shapeTemplates[testShape].getVersion(0).forEach(tilePos => {
    game.tileArr[tilePos].style.backgroundColor = 'red';
})
game.shapeTemplates[testShape].getVersion(1).forEach(tilePos => {
    game.tileArr[tilePos + 5].style.backgroundColor = 'red';
})
game.shapeTemplates[testShape].getVersion(2).forEach(tilePos => {
    game.tileArr[tilePos + 50].style.backgroundColor = 'red';
})
game.shapeTemplates[testShape].getVersion(3).forEach(tilePos => {
    game.tileArr[tilePos + 55].style.backgroundColor = 'red';
})