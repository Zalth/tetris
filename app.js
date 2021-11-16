// Set tile size and dimensions of the game area
const game = {
    tileDimension: 28,      //Tiles are 28 px wide initially
    tilesWide: 10,          //10 tiles per row
    tilesHigh: 15,          //15 rows
    gridWidth: 0,           //Will update on setupGame(game)
    gridHeight: 0,          //Will update on setupGame(game)
    gridSelector: '',       //Will update on setupGame(game)
    tileArr: [],            //Will update on setupGame(game)
    shapeTemplates: [],     //Will store all tetroids and all orientations
    curTemplateId: '',      //The tetroid currently falling   
    fallInterval: {
        initial: 800,
        current: 800
    },     //How long it takes to drop tetroid 1 square in millisec
    filledSqInRow: [],       //Keeps track of how many squares are filled in each row
    scoreArr: [],
    lineArr: [],
    shapeStatArr: [],
    gravity: '',
    shapesGenerated: 1,
    currentScore: '',
    highestScore: '',
    oneRowCleared: '',
    twoRowsCleared: '',
    threeRowsCleared: '',
    fourRowsCleared: '',
    totalRowsCleared: '',
    level: '',
    pauseFlag: true,
    isScreenSmaller: false,
    gameControlSelectors: [],
    modalSelector: '',
    modalContentSelector: '',
    instructionModalSelector: '',
    instructionModalContent: '',
    buttonControlSelectors: [],
    gameOverContentSelector: '',
    gameOverSelector: '',
    gameOver: true
}

// Class to hold information used in calculating the score
class Stats {
    constructor(htmlId) {
        this.htmlId = '#' + htmlId;
        this.displaySelector = document.querySelector(this.htmlId);
        this.stat = 0;
    }
    initialize() {
        this.displaySelector.textContent = this.stat;
    }
    update(adjustedBy) {
        this.stat += adjustedBy;
        this.displaySelector.textContent = this.stat;
    }
    reset() {
        this.stat = 0;
        this.displaySelector.textContent = this.stat;
    }
}

// Extend Stats class for number of lines cleared and current Level
class LineStats extends Stats {
    constructor(htmlId) {
        super(htmlId);
    }
    update(adjustedBy) {
        this.stat += adjustedBy;
        this.displaySelector.textContent = this.stat;
        // The level is equal to 1 plus every 10 rows that have been cleared
        game.level.stat = 1 + Math.floor(game.totalRowsCleared.stat / 10);
        game.level.displaySelector.textContent = game.level.stat;
        // Set the fall rate to the number of ms equal to the the initial value times 85% for each additional level beyond the first
        game.fallInterval.current = game.fallInterval.initial * Math.pow(0.85, (game.level.stat - 1));
    }
}

// Extends Stats class for current and highest score
// Score values will be displayed in the header of the page
class Scores extends Stats {
    constructor(htmlId) {
        super(htmlId);
    }
    updateHighScoreDisplay() {
        game.scoreArr[1].displaySelector.textContent = game.highestScore.stat;
    }
    setHighestScore() {
        if (game.currentScore.stat > game.highestScore.stat) {
            game.highestScore.stat = game.currentScore.stat;
            game.scoreArr[1].displaySelector.textContent = game.highestScore.stat;
        }
    }
    update(rowsClearedThisMove) {
        // The score for rows cleared depends on the number of rows cleared that move, and the level
        // 1 line = 100 + 5 / level
        // 2 lines = 220 + 10 / level
        // 3 lines = 360 + 15 / level
        // 4 lines = 520 + 20 / level
        this.stat += parseInt(100 * rowsClearedThisMove * (1 + (rowsClearedThisMove - 1) * 0.1 + 0.05 * game.level.stat));
        game.currentScore.stat = this.stat;
        this.displaySelector.textContent = this.stat;
        this.setHighestScore();
    }
}

// Extends Stats class for how many of a specific tetroid has been spawned
// The shapes will be displayed in the header of the page
// The number of each specific shape will be updated when the shape is generated
class ShapeStats extends Stats {
    constructor(htmlId, asideTemplate) {
        super(htmlId);
        this.asideTemplate = asideTemplate;
        this.outerDisplaySelector = document.createElement('div');
        this.displaySelector = document.createElement('span');
        this.containerSelector = document.querySelector('#shapeStats');
    }
    initialize() {
        let newDiv = document.createElement('div');
        newDiv.className = "headerShapes";
        newDiv.style.height = '24px';
        for (let i = 0; i < 8; i++) {
            let gridTile = document.createElement('div');
            gridTile.style.width = '9px';
            gridTile.style.height = '9px';
            
            if (i == this.asideTemplate[0] || i == this.asideTemplate[1] || i == this.asideTemplate[2] || i == this.asideTemplate[3]) {
                gridTile.style.backgroundColor = "black";
            }
            newDiv.append(gridTile);
        }
        this.displaySelector.id = this.htmlId;
        this.displaySelector.textContent = this.stat;
        this.outerDisplaySelector.append(newDiv, this.displaySelector);
        this.containerSelector.append(this.outerDisplaySelector)
    }
    update(adjustedBy) {
        this.stat += adjustedBy;
        this.displaySelector.textContent = this.stat;
        game.shapesGenerated += adjustedBy;
    }
}

// Class for each individual tetroid shape and rotational orientation
// There is a maximum of 4 rotational orientations for each shape, so each shape needs 4 versions passed in
class Tetroid {
    constructor(templateId, color, orientation0, orientation1, orientation2, orientation3) {
        this.id = templateId;
        this.color = color;
        this.vers0 = orientation0;
        this.vers1 = orientation1;
        this.vers2 = orientation2;
        this.vers3 = orientation3;
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

    // Creates each new tetroid, shifting the base template to the middle columns
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
        }
        else {
            this.curPosTiles = this.vers0.slice();
            this.curPosTiles.forEach((tilePos, index) => {
                this.curPosTiles[index] = tilePos + shiftBy;
                game.tileArr[tilePos + shiftBy].style.backgroundColor = this.color;
            })
            gameOver();
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
        if (versionNumber == 0) {return this.vers0.slice();}
        else if (versionNumber == 1) {return this.vers1.slice();}
        else if (versionNumber == 2) {return this.vers2.slice();}
        else if (versionNumber == 3) {return this.vers3.slice();}
    }

    // Creates array of next rotation
    nextRotation(direction) {
        let currentVers = this.curOrientation;
        let shiftBy = this.curPosTiles[0] - this.getVersion(currentVers)[0];
        if (direction == "CW") {currentVers += 1;}
        else {
            // Choose previous version so can rotate "CCW"
            currentVers -= 1;
            if (currentVers < 0) {currentVers = 3;}
        }
        
        currentVers = currentVers % 4;
        let currentVersTiles = this.getVersion(currentVers);

        currentVersTiles.forEach((tilePos, index) => {
            this.nextRotationTiles[index] = tilePos + shiftBy;
        })
        return this.nextRotationTiles.slice();
    }

    // Rotates tetroid around a fixed point
    rotateTetroid(direction) {
        this.curPosTiles.forEach((tilePos) => {
            game.tileArr[tilePos].style.backgroundColor = 'black';
        })

        let shiftBy = this.curPosTiles[0] - this.getVersion(this.curOrientation)[0];
        if (direction == "CW") {this.curOrientation += 1;}
        else {
            // Choose previous version so can rotate "CCW"
            this.curOrientation -= 1;
            if (this.curOrientation < 0) {this.curOrientation = 3}
        }
        
        this.curOrientation = this.curOrientation % 4;
        this.curPosTiles = this.getVersion(this.curOrientation);

        this.curPosTiles.forEach((tilePos, index) => {
            this.curPosTiles[index] = tilePos + shiftBy;
            game.tileArr[this.curPosTiles[index]].style.backgroundColor = this.color;
        })
    }
}

// Instantiate all members of Score class
function initializeStats() {
    // Initialize all LineStat class objects
    const oneRowCleared = new LineStats('oneRow');
    game.oneRowCleared = oneRowCleared;
    const twoRowsCleared = new LineStats('twoRow');
    game.twoRowsCleared = twoRowsCleared;
    const threeRowsCleared = new LineStats('threeRow');
    game.threeRowsCleared = threeRowsCleared;
    const fourRowsCleared = new LineStats('tetris');
    game.fourRowsCleared = fourRowsCleared;
    const totalRowsCleared = new LineStats('total');
    game.totalRowsCleared = totalRowsCleared;
    const level = new LineStats('level');
    game.level = level;
    game.level.stat = 1;
    
    game.lineArr = [oneRowCleared, twoRowsCleared, threeRowsCleared, fourRowsCleared, totalRowsCleared, level];
    game.lineArr.forEach(item => {item.initialize()});

    // Initialize all Scores class objects
    const currentScore = new Scores('currentScore');
    game.currentScore = currentScore;
    const highestScore = new Scores('highScore');
    game.highestScore = highestScore;
    
    game.scoreArr = [currentScore, highestScore];
    game.scoreArr.forEach(item => {item.initialize()});
    if (localStorage.getItem("highScore") != null) {
        game.highestScore.stat = localStorage.getItem("highScore");
        game.highestScore.updateHighScoreDisplay();
    }

    // Initialize all ShapeStats class objects
    const lineShapeStats = new ShapeStats('lineShape', [1, 3, 5, 7]);  
    const lShapeStats = new ShapeStats('lShape', [3, 5, 6, 7]);
    const revLShapeStats = new ShapeStats('revLShape', [2, 3, 5, 7])
    const tShapeStats = new ShapeStats('tShape', [3, 4, 5, 7]);
    const sShapeStats = new ShapeStats('sShape', [3, 4, 5, 6]);
    const revSShapeStats = new ShapeStats('revSShape', [2, 4, 5, 7]);
    const squareShapeStats = new ShapeStats('squareShape', [2, 4, 3, 5]);

    game.shapeStatArr = [lineShapeStats, lShapeStats, revLShapeStats, tShapeStats, sShapeStats, revSShapeStats, squareShapeStats];
    game.shapeStatArr.forEach(item => {item.initialize()});
}

// Instantiate all members of Tetroid class
function intializeTetroids() {
    const lineShape = new Tetroid(0, 'blue', [0, 1, 2, 3], [2, 12, 22, 32], [0, 1, 2, 3], [2, 12, 22, 32]);
    const lShape = new Tetroid(1, 'green', [3, 11, 12, 13], [1, 11, 21, 22], [11, 12, 13, 21], [1, 2, 12, 22]);
    const revLShape = new Tetroid(2, 'yellow', [11, 12, 13, 1], [1, 11, 21, 2], [11, 12, 13, 23], [2, 12, 21, 22])
    const tShape = new Tetroid(3, 'orange', [11, 12, 13, 2], [2, 12, 22, 13], [11, 12, 13, 22], [2, 12, 22, 11]);
    const sShape = new Tetroid(4, 'violet', [2, 3, 11, 12], [1, 11, 12, 22], [2, 3, 11, 12], [1, 11, 12, 22]);
    const revSShape = new Tetroid(5, 'darksalmon', [1, 2, 12, 13], [2, 11, 12, 21], [1, 2, 12, 13], [2, 11, 12, 21]);
    const squareShape = new Tetroid(6, 'greenyellow', [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12]);
    

    game.shapeTemplates = [lineShape, lShape, revLShape, tShape, sShape, revSShape, squareShape];
}

// Instantiate play area
function initializePlayArea() {
    game.modalSelector = document.querySelector("#pauseModal");
    game.modalContentSelector = document.querySelector(".modal-content");
    game.instructionModalSelector = document.querySelector("#instructionModal");
    game.instructionModalContent = document.querySelector(".instructionModalContent");
    game.gameOverSelector = document.querySelector("#gameOverModal");
    game.gameOverContentSelector = document.querySelector(".gameOverModalContent");

    // Calculates and sets the width and height of playable area in px, including tile borders using the game object
    function adjustTileSize() {
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        let statsBanner = document.querySelector('.statsBanner');
        let shapeStats = document.querySelector('#shapeStats');
        let adjustTileWidth = 0;

        if (screenWidth < 650) {
            game.isScreenSmaller = true;
            statsBanner.style.flexDirection = "column";
            shapeStats.style.borderRight = "none";
            shapeStats.style.borderBottom = "black 1px solid";
            shapeStats.style.paddingBottom = "5px";
            shapeStats.style.marginBottom = "5px"
            adjustTileWidth = (screenWidth - 175) / game.tilesWide;
        }
        else {
            game.isScreenSmaller = false;
            statsBanner.style.flexDirection = "row";
            shapeStats.style.borderRight = "black 1px solid";
            shapeStats.style.borderBottom = "none";
            adjustTileWidth = (screenWidth - 175) / game.tilesWide;
        }
        
        let checkTileHeight = adjustTileWidth * 15 + 150;
        if (checkTileHeight < screenHeight) {
            game.tileDimension = adjustTileWidth;
        }
        else {
            adjustTileHeight = (screenHeight - 175) / game.tilesHigh;
            game.tileDimension = adjustTileHeight;
        }
        game.gridSelector = document.querySelector('#gameGrid');
        game.gridWidth = (game.tilesWide * game.tileDimension + 2 * game.tilesWide) + 'px';
        game.gridHeight = (game.tilesHigh * game.tileDimension + 2 * game.tilesHigh) + 'px';
        game.gridSelector.style.width = game.gridWidth;
        game.gridSelector.style.height = game.gridHeight;
        game.modalContentSelector.style.height = game.gridHeight;
    }
    
    adjustTileSize();

    // Instantiates all game tiles and adds to the tileArr
    for(let i = 0; i < game.tilesWide * game.tilesHigh; i++) {
        let gridTile = document.createElement('div');
        gridTile.classList = "gridTile";
        gridTile.style.width = game.tileDimension + "px";
        gridTile.style.height = game.tileDimension + "px";
        gridTile.style.backgroundColor = 'black';
        game.gridSelector.append(gridTile);
        game.tileArr.push(gridTile);
    }

    for(let i = 0; i < game.tilesHigh; i++) {
        game.filledSqInRow[i] = 0;
    }

    window.addEventListener('resize', () => {
        adjustTileSize();
        let gridTiles = document.querySelectorAll('.gridTile');
        gridTiles.forEach(tile => {
            tile.style.width = game.tileDimension + "px";
            tile.style.height = game.tileDimension + "px";
        })
    }) 
}

// Display modal
function showModal(modalSelector, modalCloseSelector, pause = false) {
    modalSelector.style.display = "block";
    game.modalContentSelector.style.height = game.gridHeight;
    window.onclick = function(event) {
        if (event.target == modalSelector) hideModal(modalSelector);
    }
    modalCloseSelector.addEventListener('click', () => {hideModal(modalSelector, pause)})
}

// Hide modal
function hideModal(modalSelector, pause) {
    modalSelector.style.display = "none";
    if (pause == true && game.gameOver == false) {
        game.buttonControlSelectors.forEach(selector => {selector.disabled = false});
        //document.addEventListener('keydown', keyListeners)
        clearInterval(game.gravity);
        game.gravity = setInterval(playGame, game.fallInterval.current);
        game.pauseFlag = false;
    }
}

// Ends the game
function gameOver() {
    game.gameOver = true;
    game.currentScore.setHighestScore();
    localStorage.setItem("highScore", game.highestScore.stat)
    clearInterval(game.gravity);
    game.pauseFlag = true;
    document.querySelector("#gameScore").textContent = game.currentScore.stat;
    document.querySelector("#userHighScore").textContent = game.highestScore.stat;
    document.querySelector("#gameMaxLevel").textContent = game.level.stat;
    document.querySelector("#gameTotalLines").textContent = game.totalRowsCleared.stat;
    game.tileArr.forEach((value, index) => {
        game.tileArr[index].style.backgroundColor = 'black';
    })
    showModal(document.querySelector("#gameOverModal"),document.querySelector(".gameOverModalClose"));
}

// Logic for arrow and button to move left
function moveLeft() {
    let isLeftSide = false;
    let curTetroid = game.shapeTemplates[game.curTemplateId];
    curTetroid.curPosTiles.forEach((tilePos) => {
        // Set a flag if the shape is already on the left side of the screen
        if ((tilePos) % game.tilesWide == 0) {isLeftSide = true;}
    })
    // If the shape is NOT on the left side of the screen, shift the shape one square left
    if (!isLeftSide) {
        if (curTetroid.canMoveTetroid(-1)) {
            game.shapeTemplates[game.curTemplateId].updatePos();
        }   
    }
}

// Logic for arrow and button to move right
function moveRight() {
    let isRightSide = false;
    let curTetroid = game.shapeTemplates[game.curTemplateId];
    curTetroid.curPosTiles.forEach((tilePos) => {
        // Set a flag if the shape is already on the right side of the screen
        if ((tilePos) % game.tilesWide == 9) {isRightSide = true;}
    })
    // If the shape is NOT on the right side of the screen, shift the shape one square right
    if (!isRightSide) {
        if (curTetroid.canMoveTetroid(1)) {
            game.shapeTemplates[game.curTemplateId].updatePos();
        }   
    }
}

// Logic for rotation of tetroid
// direction = "CW" for clockwise rotation
// direction = "CCW" for counter-clockwise rotation
function rotate(direction) {
    let canShift = true;
    let isLeftSide = false;
    let isRightSide = false;
    let isOffBottom = false;
    let isNextTileOccupied = false;
    let curTetroid = game.shapeTemplates[game.curTemplateId];
    let nextRot = curTetroid.nextRotation(direction);

    nextRot.forEach((tilePos) => {
        // Check if one of the new tiles is on the right side of the screen
        if ((tilePos) % game.tilesWide == 9) {isRightSide = true;}
        // Check if one of the new tiles is on the left side of the screen
        else if ((tilePos) % game.tilesWide == 0) {isLeftSide = true;}
        
        // Check if one of the new tiles would be off the bottom of the screen
        if ((tilePos) >= (game.tilesWide * game.tilesHigh)) {isOffBottom = true;}

        // Check if the next tile is occupied by checking the color
        if (isOffBottom == false) {
            if (game.tileArr[tilePos].style.backgroundColor == 'gray') {
                isNextTileOccupied = true;
            }
        }

        // Check for shape looping from one side to the other OR if the next tile is occupied
        //      OR if the tile would go off the screen on the bottom
        // If true, then the shape can't rotate
        if ((isLeftSide && isRightSide) || isNextTileOccupied || isOffBottom) {
            canShift = false;
        }
    })
    
    // If the flag is true, then the shape can rotate
    if (canShift) {
        game.shapeTemplates[game.curTemplateId].rotateTetroid(direction);
    }
}

// Left button listener
let moveLeftButton = document.querySelector('#moveLeft');
moveLeftButton.addEventListener('click', () => {
    moveLeftButton.blur();
    moveLeft();
})

// Right button listener
let moveRightButton = document.querySelector('#moveRight');
moveRightButton.addEventListener('click', () => {
    moveRightButton.blur();
    moveRight();
})

// Clockwise button listener
let rotateCWButton = document.querySelector('#rotateCW');
rotateCWButton.addEventListener('click', () => {
    rotateCWButton.blur();
    rotate("CW");
})

// Counter-clockwise button listener
let rotateCCWButton = document.querySelector('#rotateCCW');
rotateCCWButton.addEventListener('click', () => {
    rotateCCWButton.blur();
    rotate("CCW");
})

game.buttonControlSelectors = [moveLeftButton, moveRightButton, rotateCWButton, rotateCCWButton];

function keyListeners(event) {
    // Press left arrow to move tetroid left
    if (event.code == "ArrowLeft") {moveLeft();}

    // Rotate tetroid counterclockwise if the d key is pressed
    else if (event.code == "KeyD") {rotate("CCW");}

    // Rotate tetroid clockwise if the f key is pressed
    else if (event.code == "KeyF") {rotate("CW");}

    // Press right arrow to move tetroid right
    else if (event.code == "ArrowRight") {moveRight();}
}

// Listeners to use keys to control shape actions
document.addEventListener('keydown', keyListeners)


function initializeHeaderButtons () {
    // Create newGame button in score banner that will reset all stats and the board
    let newGameButton = document.querySelector('#newGame');
    newGameButton.addEventListener('click', () => {
        newGameButton.blur();
        resetGame();
        clearInterval(game.gravity);
        game.gravity = setInterval(playGame, game.fallInterval.current);
        game.pauseFlag = false;
    })
    
    // Create play/pause button in score banner, toggling game.pauseFlag
    let playPauseButton = document.querySelector('#play-pause');
    playPauseButton.addEventListener('click', (event) => {
        if (game.pauseFlag) {
            playPauseButton.blur();
            game.buttonControlSelectors.forEach(selector => {selector.disabled = false});
            document.addEventListener('keydown', keyListeners)
            clearInterval(game.gravity);
            game.gravity = setInterval(playGame, game.fallInterval.current);
            game.pauseFlag = false;
        }
        else {
            clearInterval(game.gravity);
            game.buttonControlSelectors.forEach(selector => {selector.disabled = true});
            document.removeEventListener('keydown', keyListeners)
            game.pauseFlag = true;
            showModal(game.modalSelector, document.querySelector(".pauseModalClose"), true);
        }
    })

    // Creates Instructions button to display a modal
    let instructionsButton = document.querySelector("#instructions")
    instructionsButton.addEventListener('click', () => {
        if (game.pauseFlag == true) {
            showModal(game.instructionModalSelector, document.querySelector(".instructionModalClose"));
        }
    })
}

// Must call to initialize the game
function setupGame() {
    initializePlayArea();
    initializeStats();
    intializeTetroids();
    initializeHeaderButtons();
}

function playGame() {
    // Randomly selects next tetroid to appear
    function generateShape() {
        game.curTemplateId = Math.floor(Math.random() * game.shapeTemplates.length);
        game.shapeTemplates[game.curTemplateId].initialPos();
        game.shapeStatArr[game.curTemplateId].update(1);
    }

    // Checks if all tiles in a row are occupied by checking the background color
    // rowNum is 0 through game.tilesHigh 
    function canClearRow(rowNum) {
        let filledTiles = 0;
        for (let i = 0; i < game.tilesWide; i++) {
            if (game.tileArr[rowNum * 10 + i].style.backgroundColor != "black") {
                filledTiles += 1;
            }
        }

        if (filledTiles == game.tilesWide) {return true;};
        return false;
    }

    // Uses a rowNum as a starting position to clear and shift all other rows down by one
    function moveRowsDown(rowNum) {
        for (let row = rowNum; row > 0; row--) {
            for (let tileInRow = 0; tileInRow < game.tilesWide; tileInRow++) {
                game.tileArr[10 * row + tileInRow].style.backgroundColor = game.tileArr[10 * (row - 1) + tileInRow].style.backgroundColor;
            }
        }
    }

    // Updates the score and score stats based on the number of rows cleared in that drop of a shape
    function updateScoreStats(numRowsCleared) {
        game.currentScore.update(numRowsCleared);
        game.totalRowsCleared.update(numRowsCleared);
        
        if (numRowsCleared == 1) {game.oneRowCleared.update(1);}
        else if (numRowsCleared == 2) {game.twoRowsCleared.update(1);}
        else if (numRowsCleared == 3) {game.threeRowsCleared.update(1);}
        else if (numRowsCleared == 4) {game.fourRowsCleared.update(1);}
    }

    // Starts the game on the first turn by generating a shape and displaying it
    if (game.shapesGenerated == 1) {
        generateShape();
        let curTetroid = game.shapeTemplates[game.curTemplateId];
        curTetroid.updatePos();
    }
    // After the first shape of the game is generated do the following
    else {
        // Determine what shapeTemplate is being used and determine if is is valid to move the shape down one row
        let curTetroid = game.shapeTemplates[game.curTemplateId];
        let canShift = curTetroid.canMoveTetroid(10);

        // If the shape isn't newly generated and it can be shifted, then update the position
        if(canShift) {
            curTetroid.curPosTiles = curTetroid.nextPosTiles.slice();
            curTetroid.updatePos();
        }
        // If the shape can NOT be shifted...
        else {
            let numRowsCleared = 0;
            // Set the shape that is in its final position to be gray
            curTetroid.curPosTiles.forEach(tilePos => {
                game.tileArr[tilePos].style.backgroundColor = 'gray';
            })
    
            // Check if the row is full, can be cleared, shifting the rows down
            curTetroid.curPosTiles.forEach(tilePos => {
                let rowNum = Math.floor(tilePos / game.tilesWide);
                if (canClearRow(rowNum)) {
                    moveRowsDown(rowNum);
                    numRowsCleared += 1;
                }    
            })
            updateScoreStats(numRowsCleared); 
            generateShape();
        }
    }
}

// Called to set up the game
setupGame();

function resetGame() {
    console.log(game.highestScore.stat)
    if (localStorage.getItem("highScore") != null) {
        game.highestScore.stat = localStorage.getItem("highScore");
        game.highestScore.updateHighScoreDisplay();
    }
    game.gameOver = false;
    clearInterval(game.gravity);
    game.fallInterval.current = game.fallInterval.initial;
    for (let i = 0; i < game.tilesWide * game.tilesHigh; i++) {
        game.tileArr[i].style.backgroundColor = 'black';
    }
    for(let i = 0; i < game.tilesHigh; i++) {
        game.filledSqInRow[i] = 0;
    }
    game.shapesGenerated = 1;
    game.lineArr.forEach(item => {item.reset()});
    game.level.update(0);
    game.currentScore.reset();
    game.shapeStatArr.forEach(item => {item.reset()});
}