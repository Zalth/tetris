// Set tile size and dimensions of the game area
const game = {
    tileDimension: 40,      //Tiles are 60 px wide
    tilesWide: 10,          //10 tiles per row
    tilesHigh: 15,          //15 rows
    gridWidth: 0,           //Will update on setupGame(game)
    gridHeight: 0,          //Will update on setupGame(game)
    gridSelector: "",       //Will update on setupGame(game)
    gameWidth: "",          //Will update on setupGame(game)
    gameHeight: "",         //Will update on setupGame(game)
    tileArr: [],            //Will update on setupGame(game)
    shapeTemplates: [],     //Will store all tetroids and all orientations
    curTemplateId: "",      //The tetroid currently falling   
    fallInterval: 200,     //How long it takes to drop tetroid 1 square in millisec
    filledSqInRow: [],       //Keeps track of how many squares are filled in each row
    gravity: "",
    newShape: true,
    shapesGenerated: 0
}

// Class for each individual tetroid shape and rotational orientation
class Tetroid {
    constructor(templateId, color, orientation0, orientation1, orientation2, orientation3) {
        this.id = templateId;
        this.color = color
        this.vers0 = orientation0;
        this.vers1 = orientation1;
        this.vers2 = orientation2;
        this.vers3 = orientation3;
        this.curPosTiles = this.vers0.slice();
        this.curOrientation = 0;
        this.nextPosTiles = [];
        this.nextRotationTiles = [];
    }
    
    // Checks next position tiles before spawning or moving tetroid
    canMoveTetroid(shiftBy) {
        let canShift = true
        this.nextPosTiles = this.curPosTiles.slice();
        this.curPosTiles.forEach((tilePos, index) => {
            let shiftedTilePos = tilePos + shiftBy;
            if (shiftedTilePos < game.tilesWide * game.tilesHigh) {
                if (game.tileArr[shiftedTilePos].style.backgroundColor != 'gray') {
                    this.nextPosTiles[index] = shiftedTilePos;
                }
                else {
                    this.nextPosTiles = this.curPosTiles.slice()
                    canShift = false;
                }
            }
            else {
                this.nextPosTiles = this.curPosTiles.slice()
                canShift = false;
            }   
        })
        if (canShift) {
            this.curPosTiles.forEach((tilePos, index) => {
                game.tileArr[this.curPosTiles[index]].style.backgroundColor = 'black'
            })
        }
        return canShift;
    }
    
    // Creates each new tetroid
    initialPos() {
        this.curOrientation = 0;
        let shiftBy = 3;
        this.curPosTiles = this.vers0.slice() 
        if(this.canMoveTetroid(shiftBy)) {
            this.curPosTiles = this.vers0.slice();
            this.curPosTiles.forEach((tilePos, index) => {
                this.curPosTiles[index] = tilePos + shiftBy;
                game.tileArr[tilePos + shiftBy].style.backgroundColor = this.color;
            })
            game.newShape = true;
        }
        else {
            this.curPosTiles = this.vers0.slice();
            this.curPosTiles.forEach((tilePos, index) => {
                this.curPosTiles[index] = tilePos + shiftBy;
                game.tileArr[tilePos + shiftBy].style.backgroundColor = this.color;
            })
            clearInterval(game.gravity);
            console.log("Game Over")
        }
    }
    
    // Updates position of tetroid by arrow keys and gravity
    updatePos() {
        this.nextPosTiles.forEach((tilePos, index) => {
            this.curPosTiles[index] = tilePos;
            game.tileArr[tilePos].style.backgroundColor = this.color;
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

    // Creates array of next rotation
    nextRotation() {
        let currentVers = this.curOrientation
        let shiftBy = this.curPosTiles[0] - this.getVersion(currentVers)[0];
        currentVers += 1;
        currentVers = currentVers % 4;
        let currentVersTiles = this.getVersion(currentVers);

        currentVersTiles.forEach((tilePos, index) => {
            this.nextRotationTiles[index] = tilePos + shiftBy;
        })
        return this.nextRotationTiles.slice()
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
            game.tileArr[this.curPosTiles[index]].style.backgroundColor = this.color;
        })
    }
}

// Define all playable tetroid shapes and rotational orientations
// Add to the shapes array
const lineShape = new Tetroid(0, 'blue', [0, 1, 2, 3], [2, 12, 22, 32], [0, 1, 2, 3], [2, 12, 22, 32]);
const lShape = new Tetroid(1, 'green', [3, 11, 12, 13], [1, 2, 12, 22], [11, 12, 13, 21], [1, 11, 21, 22]);
const revLShape = new Tetroid(2, 'yellow', [11, 12, 13, 1], [2, 12, 22, 3], [11, 12, 13, 23], [2, 12, 21, 22])
const tShape = new Tetroid(3, 'orange', [11, 12, 13, 2], [2, 12, 22, 13], [11, 12, 13, 22], [2, 12, 22, 11]);
const squareShape = new Tetroid(4, 'greenyellow', [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12]);
const sShape = new Tetroid(5, 'violet', [2, 3, 11, 12], [1, 11, 12, 22], [2, 3, 11, 12], [1, 11, 12, 22]);
const revSShape = new Tetroid(6, 'darksalmon', [1, 2, 12, 13], [2, 11, 12, 21], [1, 2, 12, 13], [2, 11, 12, 21]);
game.shapeTemplates = [lineShape, lShape, revLShape, tShape, squareShape, sShape, revSShape];

// Randomly selects next tetroid to appear
function generateShape() {
    game.curTemplateId = Math.floor(Math.random() * game.shapeTemplates.length);
    game.shapeTemplates[game.curTemplateId].initialPos();
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
        gridTile.style.backgroundColor = 'black';
        gridTile.textContent = i;
        game.gridSelector.append(gridTile);
        game.tileArr.push(gridTile);
    }

    for(let i = 0; i < game.tilesHigh; i++) {
        game.filledSqInRow[i] = 0;
    }

    function playGame() {
        game.shapesGenerated += 1;
        if (game.shapesGenerated == 1) {
            generateShape()
            let curTetroid = game.shapeTemplates[game.curTemplateId];
            curTetroid.updatePos();
        }
        else {
            let curTetroid = game.shapeTemplates[game.curTemplateId];
            let canShift = curTetroid.canMoveTetroid(10)
            if (game.newShape && game.filledSqInRow[2] == 0) {
                curTetroid.curPosTiles = curTetroid.nextPosTiles.slice()
                curTetroid.updatePos();
                game.newShape = false;
            }
            else if(canShift) {
                curTetroid.curPosTiles = curTetroid.nextPosTiles.slice()
                curTetroid.updatePos();
            }
            else {
                curTetroid.curPosTiles.forEach(tilePos => {
                    game.tileArr[tilePos].style.backgroundColor = 'gray';
                })
                generateShape()
            }
        }
    }
    game.gravity = setInterval(playGame, game.fallInterval);
}

// Called to set up the game
setupGame(game);

document.addEventListener('keydown', (event) => {
    let canShift = true;
    let isLeftSide = false;
    let isRightSide = false;
    let isOffBottom = false;
    let isNextTileOccupied = false;
    let curTetroid = game.shapeTemplates[game.curTemplateId];
    switch (event.code) {
        // Rotate tetroid if spacebar clicked
        case "Space":
            let nextRot = curTetroid.nextRotation();

            nextRot.forEach((tilePos) => {
                if ((tilePos) % game.tilesWide == 9) {
                    isRightSide = true;
                }
                else if ((tilePos) % game.tilesWide == 0) {
                    isLeftSide = true;
                }
                
                if ((tilePos) >= (game.tilesWide * game.tilesHigh)) {
                    isOffBottom = true;
                }

                if (isOffBottom == false) {
                    if (game.tileArr[tilePos].style.backgroundColor == 'gray') {
                        isNextTileOccupied = true;
                    }
                }

                if ((isLeftSide && isRightSide) || isNextTileOccupied || isOffBottom) {
                    canShift = false;
                }
            })
            if (canShift) {
                game.shapeTemplates[game.curTemplateId].rotateTetroid();
            }
            break;    
        
        // Press left arrow to move tetroid left
        case "ArrowLeft":
            curTetroid.curPosTiles.forEach((tilePos) => {
                if ((tilePos) % game.tilesWide == 0) {
                    isLeftSide = true;
                }
            })
            if (!isLeftSide) {
                if (curTetroid.canMoveTetroid(-1)) {
                    game.shapeTemplates[game.curTemplateId].updatePos();
                }   
            }
            break;
        
        // Press right arrow to move tetroid right
        case "ArrowRight":
            curTetroid.curPosTiles.forEach((tilePos) => {
                if ((tilePos) % game.tilesWide == 9) {
                    isRightSide = true;
                }
            })
            if (!isRightSide) {
                if (curTetroid.canMoveTetroid(1)) {
                    game.shapeTemplates[game.curTemplateId].updatePos();
                }   
            }
            break;
    }
}) 



//game.shapeTemplates[game.curTemplateId = 3].initialPos()