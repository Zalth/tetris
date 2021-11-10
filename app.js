// Set tile size and dimensions of the game area
const game = {
    tileDimension: 40,      //Tiles are 60 px wide
    tilesWide: 10,          //10 tiles per row
    tilesHigh: 15,          //15 rows
    gridWidth: 0,           //Will update on setupGame(game)
    gridHeight: 0,          //Will update on setupGame(game)
    gridSelector: "",       //Will update on setupGame(game)
    tileArr: [],            //Will update on setupGame(game)
    shapeTemplates: [],     //Will store all tetroids and all orientations
    curTemplateId: "",      //The tetroid currently falling   
    fallInterval: 900,     //How long it takes to drop tetroid 1 square in millisec
    filledSqInRow: [],       //Keeps track of how many squares are filled in each row
    scoreArr: [],
    gravity: "",
    newShape: true,
    shapesGenerated: 0,
    currentScore: 0,
    highestScore: 0,
    totLinesCleared: 0,
    lineStats: {
        single: 0,
        double: 0,
        triple: 0,
        tetris: 0,
        total: 0,
    },
    statSelectors: {
        currentScore: "",
        highestScore: "",
        single: "",
        double: "",
        triple: "",
        tetris: "",
        total: "",
        level: ""
    },
    level: 1,
    pauseFlag: true

}
// Class to hold information used in calculating the score
class Score {
    constructor(htmlId, initValue) {
        this.htmlId = '#' + htmlId;
        this.initValue = initValue;
        this.displaySelector = document.querySelector(this.htmlId);
        this.stat = initValue;
    }
    update(adjustedBy) {
        this.stat += adjustedBy;
        this.displaySelector.textContent = this.stat;
    }
    reset() {
        this.stat = this.initValue;
        this.update(this.initValue);
    }
}

// Instantiate all members of Score class and add to game.scoreArr
const oneRowCleared = new Score('oneRow', 0);
const twoRowsCleared = new Score('twoRow', 0);
const threeRowsCleared = new Score('threeRow', 0);
const fourRowsCleared = new Score('tetris', 0);
const level = new Score('level', 1);
const curScore = new Score('currentScore', 0);
const highScore = new Score('highScore', 0);

game.scoreArr = [oneRowCleared, twoRowsCleared, threeRowsCleared, fourRowsCleared, level, curScore, highScore];
game.scoreArr.forEach(item => {item.reset()});


// Class for each individual tetroid shape and rotational orientation
class Tetroid {
    constructor(templateId, templateName, color, orientation0, orientation1, orientation2, orientation3, asideTemplate) {
        this.id = templateId;
        this.name = templateName;
        this.color = color;
        this.vers0 = orientation0;
        this.vers1 = orientation1;
        this.vers2 = orientation2;
        this.vers3 = orientation3;
        this.asideTemplate = asideTemplate;
        this.asideShapeSelector = ''
        this.numGenerated = 0;
        this.curOrientation = 0;
        this.curPosTiles = this.vers0.slice();
        this.nextPosTiles = [];
        this.nextRotationTiles = [];
    }
    
    // Checks next position tiles before spawning or moving tetroid
    canMoveTetroid(shiftBy) {
        let canShift = true;
        this.nextPosTiles = this.curPosTiles.slice();
        this.curPosTiles.forEach((tilePos, index) => {
            let shiftedTilePos = tilePos + shiftBy;
            if (shiftedTilePos < game.tilesWide * game.tilesHigh) {
                if (game.tileArr[shiftedTilePos].style.backgroundColor != 'gray') {
                    this.nextPosTiles[index] = shiftedTilePos;
                }
                else {
                    this.nextPosTiles = this.curPosTiles.slice();
                    canShift = false;
                }
            }
            else {
                this.nextPosTiles = this.curPosTiles.slice();
                canShift = false;
            }   
        })
        if (canShift) {
            this.curPosTiles.forEach((tilePos, index) => {
                game.tileArr[this.curPosTiles[index]].style.backgroundColor = 'black';
            })
        }
        return canShift;
    }
    
    // Creates each new tetroid
    initialPos() {
        this.curOrientation = 0;
        let shiftBy = 3;
        this.curPosTiles = this.vers0.slice(); 
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
            if (game.currentScore > game.highestScore) {
                game.highestScore = game.currentScore;
                game.statSelectors.highestScore.textContent = game.highestScore;
            }
            clearInterval(game.gravity);
            game.pauseFlag = true;
            console.log("Game Over");
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
        let currentVers = this.curOrientation;
        let shiftBy = this.curPosTiles[0] - this.getVersion(currentVers)[0];
        currentVers += 1;
        currentVers = currentVers % 4;
        let currentVersTiles = this.getVersion(currentVers);

        currentVersTiles.forEach((tilePos, index) => {
            this.nextRotationTiles[index] = tilePos + shiftBy;
        })
        return this.nextRotationTiles.slice();
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
const lShape = new Tetroid(1, 'lShape', 'green', [3, 11, 12, 13], [1, 2, 12, 22], [11, 12, 13, 21], [1, 11, 21, 22], [3, 5, 6, 7]);
const revLShape = new Tetroid(2, 'revLShape', 'yellow', [11, 12, 13, 1], [2, 12, 22, 3], [11, 12, 13, 23], [2, 12, 21, 22], [2, 3, 5, 7])
const tShape = new Tetroid(3, 'tShape', 'orange', [11, 12, 13, 2], [2, 12, 22, 13], [11, 12, 13, 22], [2, 12, 22, 11], [3, 4, 5, 7]);
const squareShape = new Tetroid(4, 'squareShape', 'greenyellow', [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12], [2, 4, 3, 5]);
const sShape = new Tetroid(5, 'sShape', 'violet', [2, 3, 11, 12], [1, 11, 12, 22], [2, 3, 11, 12], [1, 11, 12, 22], [3, 4, 5, 6]);
const revSShape = new Tetroid(6, 'revSShape', 'darksalmon', [1, 2, 12, 13], [2, 11, 12, 21], [1, 2, 12, 13], [2, 11, 12, 21], [2, 4, 5, 7]);
const lineShape = new Tetroid(0, 'lineShape', 'blue', [0, 1, 2, 3], [2, 12, 22, 32], [0, 1, 2, 3], [2, 12, 22, 32], [0, 2, 4, 6]);

game.shapeTemplates = [lShape, revLShape, tShape, squareShape, sShape, revSShape, lineShape];

// Randomly selects next tetroid to appear
function generateShape() {
    game.curTemplateId = Math.floor(Math.random() * game.shapeTemplates.length);
    game.shapeTemplates[game.curTemplateId].initialPos();
    game.shapeTemplates[game.curTemplateId].numGenerated += 1;
    game.shapeTemplates[game.curTemplateId].asideShapeSelector.textContent = game.shapeTemplates[game.curTemplateId].numGenerated
}

// Must call inorder to instantiate the game board
function setupGame(game) {
    // Calculates and sets the width and height of playable area in px, including tile borders using the game object
    game.gridSelector = document.querySelector('#gameGrid');
    game.gridWidth = (game.tilesWide * game.tileDimension + 2 * game.tilesWide) + 'px';
    game.gridHeight = (game.tilesHigh * game.tileDimension + 2 * game.tilesHigh) + 'px';
    game.gridSelector.style.width = game.gridWidth;
    game.gridSelector.style.height = game.gridHeight;

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

    function resetGame() {
        clearInterval(game.gravity);
        game.fallInterval = 900;
        for (let i = 0; i < game.tilesWide * game.tilesHigh; i++) {
            game.tileArr[i].style.backgroundColor = 'black';
        }
        for(let i = 0; i < game.tilesHigh; i++) {
            game.filledSqInRow[i] = 0;
        }
        game.shapesGenerated = 0;
        game.currentScore = 0;
        game.statSelectors.currentScore.textContent = game.currentScore;
        game.lineStats.single = 0;
        game.statSelectors.single.textContent = game.lineStats.single;
        game.lineStats.double = 0;
        game.statSelectors.double.textContent = game.lineStats.double;
        game.lineStats.triple = 0;
        game.statSelectors.triple.textContent = game.lineStats.triple;
        game.lineStats.tetris = 0;
        game.statSelectors.tetris.textContent = game.lineStats.tetris;
        game.lineStats.total = 0;
        game.statSelectors.total.textContent = game.lineStats.total;
        game.level = 1;
        game.statSelectors.level.textContent = game.level;
        game.pauseFlag = false;
    }

    // Display scores and level in score banner
    game.statSelectors.highestScore = document.querySelector('#highScore');
    game.statSelectors.highestScore.textContent = game.highestScore;

    game.statSelectors.currentScore = document.querySelector('#currentScore');
    game.statSelectors.currentScore.textContent = game.currentScore;

    game.statSelectors.level = document.querySelector('#level');
    game.statSelectors.level.textContent = game.level;

    // Create Play and Pause buttons in score banner
    let newGameButton = document.querySelector('#newGame');
    newGameButton.addEventListener('click', () => {
        newGameButton.blur();
        resetGame()
        game.gravity = setInterval(playGame, game.fallInterval);
    })
    let playPauseButton = document.querySelector('#play-pause');
    playPauseButton.addEventListener('click', () => {
        if (game.pauseFlag) {
            playPauseButton.blur();
            game.gravity = setInterval(playGame, game.fallInterval);
            game.pauseFlag = false;
        }
        else {
            clearInterval(game.gravity);
            game.pauseFlag = true;
        }
    })
    // shapes in aside
    shapeDisplay = document.querySelector('#shapeStats');
    for (let i = 0; i < 7; i++) {
        let newDiv = document.createElement('div')
        newDiv.className = "asideShapes"
        newDiv.style.height = '44px'
        let initShapeTemp = game.shapeTemplates[i].asideTemplate;
        for (let j = 0; j < 8; j++) {
            let gridTile = document.createElement('div');
            gridTile.style.width = '20px';
            gridTile.style.height = '20px';
            
            if (j == initShapeTemp[0] || j == initShapeTemp[1] || j == initShapeTemp[2] || j == initShapeTemp[3]) {
                gridTile.style.backgroundColor = "blue"
                gridTile.style.border = "1px solid black";
            }
            newDiv.append(gridTile)
        }
        game.shapeTemplates[i].asideShapeSelector = document.createElement('span')
        let newSpan = game.shapeTemplates[i].asideShapeSelector
        newSpan.id = game.shapeTemplates[i].name
        newSpan.textContent = game.shapeTemplates[i].numGenerated
        shapeDisplay.append(newDiv, newSpan)
    }
    


    // Number of lines completed displayed in the aside
    game.statSelectors.single = document.querySelector('#oneRow');
    game.statSelectors.single.textContent = game.lineStats.single;
    game.statSelectors.double = document.querySelector('#twoRow');
    game.statSelectors.double.textContent = game.lineStats.double;
    game.statSelectors.triple = document.querySelector('#threeRow');
    game.statSelectors.triple.textContent = game.lineStats.triple;
    game.statSelectors.tetris = document.querySelector('#tetris');
    game.statSelectors.tetris.textContent = game.lineStats.tetris;
    game.statSelectors.total = document.querySelector('#total');
    game.statSelectors.total.textContent = game.lineStats.total;

    function playGame() {
        game.shapesGenerated += 1;
        if (game.shapesGenerated == 1) {
            generateShape();
            let curTetroid = game.shapeTemplates[game.curTemplateId];
            curTetroid.updatePos();
        }
        else {
            let curTetroid = game.shapeTemplates[game.curTemplateId];
            let canShift = curTetroid.canMoveTetroid(10);
            if (game.newShape && game.filledSqInRow[2] == 0) {
                curTetroid.curPosTiles = curTetroid.nextPosTiles.slice();
                curTetroid.updatePos();
                game.newShape = false;
            }
            else if(canShift) {
                curTetroid.curPosTiles = curTetroid.nextPosTiles.slice();
                curTetroid.updatePos();
            }
            else {
                let rowsToClear = []
                curTetroid.curPosTiles.forEach(tilePos => {
                    game.tileArr[tilePos].style.backgroundColor = 'gray';
                    let rowNum = Math.floor(tilePos / game.tilesWide);
                    game.filledSqInRow[rowNum] += 1;
                    if (game.filledSqInRow[rowNum] >= game.tilesWide) {
                        rowsToClear.push(rowNum);
                    }
                })
                if (rowsToClear.length > 0) {
                    clearRows(rowsToClear);
                }
                generateShape();
            }
        }
    }
    
    //game.gravity = setInterval(playGame, game.fallInterval);

    function clearRows(rowsToClear) {
        let rowsToClearLen = rowsToClear.length;
        updateScoreStats(rowsToClearLen);
        for (let i = 0; i < rowsToClearLen; i++) {
            let row = rowsToClear.pop();
            moveRowsDown(row, i + 1);
        }
    }
    function moveRowsDown(row, rowsShifted) {
        console.log("sq Arr before: " + game.filledSqInRow)
        let rowStartShift = row + rowsShifted - 1;
        for (let i = rowStartShift; i > 0; i--) {
            for (let j = 0; j < 10; j++) {
                game.tileArr[10 * i + j].style.backgroundColor = game.tileArr[10 * (i - 1) + j].style.backgroundColor;
            }
        }
        for (let k = game.filledSqInRow.length - 1; k > 0; k--) {
            game.filledSqInRow[k] = game.filledSqInRow[k - 1];
        }
    }
    function updateScoreStats(rowsToClearLen) {
        game.currentScore += parseInt(100 * rowsToClearLen * (1 + (rowsToClearLen - 1) * 0.1 + 0.5 * game.level));
        game.statSelectors.currentScore.textContent = game.currentScore;
        game.lineStats.total += rowsToClearLen;
        game.statSelectors.total.textContent = game.lineStats.total;
        game.level = 1 + Math.floor(game.lineStats.total / 10);
        game.statSelectors.level.textContent = game.level;
        game.fallInterval = 900 * 0.9;
        switch(rowsToClearLen) {
            case 1:
                game.lineStats.single += 1;
                game.statSelectors.single.textContent = game.lineStats.single;
                break;
            case 2:
                game.lineStats.double += 1;
                game.statSelectors.double.textContent = game.lineStats.double;
                break;
            case 3:
                game.lineStats.triple += 1;
                game.statSelectors.triple.textContent = game.lineStats.triple;
                break;
            case 4:
                game.lineStats.tetris += 1;
                game.statSelectors.tetris.textContent = game.lineStats.tetris;
                break;
        }
        
    }
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