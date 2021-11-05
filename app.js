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
    shapeTemplates: [],          //Will store all tetroids and all orientations
    curTemplateId: ""
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
    constructor(templateId, orientation0, orientation1, orientation2, orientation3) {
        this.id = templateId;
        this.vers0 = orientation0;
        this.vers1 = orientation1;
        this.vers2 = orientation2;
        this.vers3 = orientation3;
        this.curPosTiles = this.vers0.slice();
        this.curOrientation = 0;
    }
    
    initialPos() {
        this.curOrientation = 0;
        this.curPosTiles = this.vers0.slice();
        this.curPosTiles.forEach((tilePos, index) => {
            this.curPosTiles[index] = tilePos + 3;
            game.tileArr[this.curPosTiles[index]].style.backgroundColor = 'red';
        })
    }
    
    updatePos(shiftBy) {
        this.curPosTiles.forEach((tilePos, index) => {
            game.tileArr[tilePos].style.backgroundColor = 'black';
            this.curPosTiles[index] = tilePos + shiftBy;
        })

        this.curPosTiles.forEach((tilePos) => {
            game.tileArr[tilePos].style.backgroundColor = 'red';
        })
    }

    // Method to select a rotational orientation of the tetroid
    getVersion(versionNumber) {
        if (versionNumber == 0) {
            return this.vers0.slice();
        }
        else if (versionNumber == 1) {
            return this.vers1.slice();
        }
        else if (versionNumber == 2) {
            return this.vers2.slice();
        }
        else if (versionNumber == 3) {
            return this.vers3.slice();
        }
        else {
            console.log("Error in retrieving Tetroid Version");
        }
    }

    rotateTetroid() {
        this.curPosTiles.forEach((tilePos) => {
            game.tileArr[tilePos].style.backgroundColor = 'black';
        })
        console.log(this.curPosTiles)
        console.log(this.getVersion(this.curOrientation))
        let shiftBy = this.curPosTiles[0] - this.getVersion(this.curOrientation)[0];
        this.curOrientation += 1;
        this.curOrientation = this.curOrientation % 4;
        this.curPosTiles = this.getVersion(this.curOrientation);

        this.curPosTiles.forEach((tilePos, index) => {
            this.curPosTiles[index] = tilePos + shiftBy;
            game.tileArr[this.curPosTiles[index]].style.backgroundColor = 'red';
        })
    }
}

// Define all playable tetroid shapes and rotational orientations
// Add to the shapes array
const lineShape = new Tetroid(0, [2, 12, 22, 32], [10, 11, 12, 13], [2, 12, 22, 32], [10, 11, 12, 13]);
game.shapeTemplates.push(lineShape);

const lShape = new Tetroid(1, [1, 11, 21, 22], [11, 12, 13, 21], [1, 2, 12, 22], [3, 11, 12, 13]);
game.shapeTemplates.push(lShape);

const revLShape = new Tetroid(2, [1, 11, 21, 20], [10, 11, 12, 0], [1, 11, 21, 2], [0, 1, 2, 12])
game.shapeTemplates.push(revLShape);

const tShape = new Tetroid(3, [10, 11, 12, 21], [10, 1, 11, 21], [10, 11, 12, 1], [0, 10, 20, 11]);
game.shapeTemplates.push(tShape);

const squareShape = new Tetroid(4, [0, 1, 10, 11], [0, 1, 10, 11], [0, 1, 10, 11], [0, 1, 10, 11]);
game.shapeTemplates.push(squareShape);

const sShape = new Tetroid(5, [1, 2, 10, 11], [0, 10, 11, 21], [1, 2, 10, 11], [0, 10, 11, 21]);
game.shapeTemplates.push(sShape);

const revSShape = new Tetroid(6, [0, 1, 11, 12], [1, 10, 11, 20], [0, 1, 11, 12], [1, 10, 11, 20]);
game.shapeTemplates.push(revSShape);

function generateShape() {
    game.curTemplateId = Math.floor(Math.random() * game.shapeTemplates.length);

    switch(game.curTemplateId) {
        case 0:
            game.shapeTemplates[0].initialPos();
            game.curTemplateId = 0;
            break;
        case 1:
            game.shapeTemplates[1].initialPos();
            game.curTemplateId = 1;
            break;
        case 2:
            game.shapeTemplates[2].initialPos();
            game.curTemplateId = 2;
            break;
        case 3:
            game.shapeTemplates[3].initialPos();
            game.curTemplateId = 3;
            break;
        case 4:
            game.shapeTemplates[4].initialPos();
            game.curTemplateId = 4;
            break;
        case 5:
            game.shapeTemplates[5].initialPos();
            game.curTemplateId = 5;
            break;
        case 6:
            game.shapeTemplates[6].initialPos();
            game.curTemplateId = 6;
            break;
    }
}

generateShape()
document.addEventListener('keydown', (event) => {
    //rotate tetroid if spacebar clicked
    switch (event.code) {
        case "Space":
            game.shapeTemplates[game.curTemplateId].rotateTetroid();
            console.log("Spacebar pressed");
            break;
        case "ArrowLeft":
            game.shapeTemplates[game.curTemplateId].updatePos(-1);
            console.log("Left arrow pressed");
            break;
        case "ArrowRight":
            game.shapeTemplates[game.curTemplateId].updatePos(1);
            console.log("Right arrow pressed");
            break;
    }
})


/* testShape = 0

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
}) */