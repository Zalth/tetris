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
    curTemplateId: "",
    fallInterval: 1000
}

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
    
    // Creates each new tetroid
    initialPos() {
        this.curOrientation = 0;
        this.curPosTiles = this.vers0.slice();
        this.curPosTiles.forEach((tilePos, index) => {
            this.curPosTiles[index] = tilePos + 3;
            game.tileArr[this.curPosTiles[index]].style.backgroundColor = 'red';
        })
    }
    
    // Updates position of tetroid by arrow keys and gravity
    updatePos(shiftBy) {
        this.curPosTiles.forEach((tilePos, index) => {
            game.tileArr[tilePos].style.backgroundColor = 'black';
            this.curPosTiles[index] = tilePos + shiftBy;
        })

        this.curPosTiles.forEach((tilePos) => {
            game.tileArr[tilePos].style.backgroundColor = 'red';
        })
    }

    // Selects a rotational orientation of the tetroid
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

    // Rotates tetroid around a fixed point
    rotateTetroid() {
        this.curPosTiles.forEach((tilePos) => {
            game.tileArr[tilePos].style.backgroundColor = 'black';
        })

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

const lShape = new Tetroid(1, [1, 2, 12, 22], [11, 12, 13, 21], [1, 11, 21, 22], [3, 11, 12, 13]);
game.shapeTemplates.push(lShape);

const revLShape = new Tetroid(2, [2, 12, 21, 22], [11, 12, 13, 1], [2, 12, 22, 3], [11, 12, 13, 23])
game.shapeTemplates.push(revLShape);

const tShape = new Tetroid(3, [2, 12, 22, 13], [11, 12, 13, 22], [2, 12, 22, 11], [11, 12, 13, 2]);
game.shapeTemplates.push(tShape);

const squareShape = new Tetroid(4, [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12]);
game.shapeTemplates.push(squareShape);

const sShape = new Tetroid(5, [2, 3, 11, 12], [1, 11, 12, 22], [2, 3, 11, 12], [1, 11, 12, 22]);
game.shapeTemplates.push(sShape);

const revSShape = new Tetroid(6, [1, 2, 12, 13], [2, 11, 12, 21], [1, 2, 12, 13], [2, 11, 12, 21]);
game.shapeTemplates.push(revSShape);

// Randomly selects next tetroid to appear
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

// Must call inorder to instantiate the game board
function setupGame(game) {
    // Calculates and sets the width and height of playable area in px, including tile borders using the game object
    game.gridSelector = document.querySelector('#gameGrid');
    game.gridWidth = game.tilesWide * game.tileDimension + 2 * game.tilesWide;
    game.gridHeight = game.tilesHigh * game.tileDimension + 2 * game.tilesHigh;
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
    generateShape()

    /* function endGame() {
        game.fallInterval = 0;
    } */

    function playGame() {
        let canShift = true;
        let curTetroid = game.shapeTemplates[game.curTemplateId];
        curTetroid.curPosTiles.forEach((tilePos) => {
            if ((tilePos + 10) > game.tilesWide * game.tilesHigh - 1 || game.tileArr[tilePos + 10].style.backgroundColor == 'gray') {
                canShift = false;
            }
        })
        if (canShift) {
            game.shapeTemplates[game.curTemplateId].updatePos(10);
        }
        else {
            curTetroid.curPosTiles.forEach((tilePos) => {
                game.tileArr[tilePos].style.backgroundColor = 'gray';
            })
            generateShape();
        }
    }
    setInterval(playGame, game.fallInterval);
}

// Called to set up the game
setupGame(game);

document.addEventListener('keydown', (event) => {
    let canShift = true;
    let curTetroid = game.shapeTemplates[game.curTemplateId];
    switch (event.code) {
        // Rotate tetroid if spacebar clicked
        case "Space":
            game.shapeTemplates[game.curTemplateId].rotateTetroid();
            break;
        
        // Press left arrow to move tetroid left
        case "ArrowLeft":
            curTetroid.curPosTiles.forEach((tilePos) => {
                if ((tilePos - 1) % game.tilesWide == game.tilesWide - 1 || game.tileArr[tilePos -1].style.backgroundColor == 'gray') {
                    canShift = false;
                }
            })
            if (canShift) {
                game.shapeTemplates[game.curTemplateId].updatePos(-1);
            }
            break;
        
        // Press right arrow to move tetroid right
        case "ArrowRight":
            curTetroid.curPosTiles.forEach((tilePos) => {
                if ((tilePos + 1) % game.tilesWide == 0 || game.tileArr[tilePos + 1].style.backgroundColor == 'gray') {
                    canShift = false;
                }
            })
            if (canShift) {
                game.shapeTemplates[game.curTemplateId].updatePos(1);
            }
            break;
        
        // Press down arrow to drop tetroid
        case "ArrowDown":
            curTetroid.curPosTiles.forEach((tilePos) => {
                if ((tilePos + 10) > game.tilesWide * game.tilesHigh - 1 || game.tileArr[tilePos + 10].style.backgroundColor == 'gray') {
                    canShift = false;
                }
            })
            if (canShift) {
                game.shapeTemplates[game.curTemplateId].updatePos(10);
            }
            else {
                curTetroid.curPosTiles.forEach((tilePos) => {
                    game.tileArr[tilePos].style.backgroundColor = 'gray'
                })
            }
            break;
    }
}) 



//game.shapeTemplates[game.curTemplateId = 3].initialPos()