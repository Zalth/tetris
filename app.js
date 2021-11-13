// Set tile size and dimensions of the game area
const game = {
    tileDimension: 28,      //Tiles are 60 px wide
    tilesWide: 10,          //10 tiles per row
    tilesHigh: 15,          //15 rows
    gridWidth: 0,           //Will update on setupGame(game)
    gridHeight: 0,          //Will update on setupGame(game)
    gridSelector: '',       //Will update on setupGame(game)
    tileArr: [],            //Will update on setupGame(game)
    shapeTemplates: [],     //Will store all tetroids and all orientations
    curTemplateId: '',      //The tetroid currently falling   
    fallInterval: {
        initial: 900,
        current: 900
    },     //How long it takes to drop tetroid 1 square in millisec
    filledSqInRow: [],       //Keeps track of how many squares are filled in each row
    scoreArr: [],
    lineArr: [],
    shapeStatArr: [],
    gravity: '',
    newShape: true,
    shapesGenerated: 1,
    currentScore: '',
    highestScore: '',
    oneRowCleared: '',
    twoRowsCleared: '',
    threeRowsCleared: '',
    fourRowsCleared: '',
    totalRowsCleared: '',
    level: '',
    pauseFlag: true

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
        game.level.stat = 1 + Math.floor(game.totalRowsCleared.stat / 10);
        game.level.displaySelector.textContent = game.level.stat;
        game.fallInterval.current = game.fallInterval.initial * Math.pow(0.9, (game.level.stat - 1));
    }
}

// Extends Stats class for current and highest score
class Scores extends Stats {
    constructor(htmlId) {
        super(htmlId);
    }
    setHighestScore() {
        if (game.currentScore.stat > game.highestScore.stat) {
            game.highestScore.stat = game.currentScore.stat;
            game.scoreArr[1].displaySelector.textContent = game.highestScore.stat;
        }
    }
    update(rowsClearedThisMove) {
        this.stat += parseInt(100 * rowsClearedThisMove * (1 + (rowsClearedThisMove - 1) * 0.1 + 0.5 * game.level.stat));
        game.currentScore.stat = this.stat;
        this.displaySelector.textContent = this.stat;
        this.setHighestScore();
    }
}

// Extends Stats class for how many of a specific tetroid has been spawned
class ShapeStats extends Stats {
    constructor(htmlId, asideTemplate) {
        super(htmlId);
        this.asideTemplate = asideTemplate;
        this.displaySelector = document.createElement('span');
        this.containerSelector = document.querySelector('#shapeStats');
    }
    initialize() {
        let newDiv = document.createElement('div');
        newDiv.className = "asideShapes";
        newDiv.style.height = '24px';
        for (let i = 0; i < 8; i++) {
            let gridTile = document.createElement('div');
            gridTile.style.width = '10px';
            gridTile.style.height = '10px';
            
            if (i == this.asideTemplate[0] || i == this.asideTemplate[1] || i == this.asideTemplate[2] || i == this.asideTemplate[3]) {
                gridTile.style.backgroundColor = "blue";
                gridTile.style.border = "1px solid black";
            }
            newDiv.append(gridTile);
        }
        this.displaySelector.id = this.htmlId;
        this.displaySelector.textContent = this.stat;
        this.containerSelector.append(newDiv, this.displaySelector);
    }
    update(adjustedBy) {
        this.stat += adjustedBy;
        this.displaySelector.textContent = this.stat;
        game.shapesGenerated += adjustedBy;
    }
}

// Class for each individual tetroid shape and rotational orientation
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
            game.currentScore.setHighestScore();
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
        if (versionNumber == 0) {return this.vers0.slice();}
        else if (versionNumber == 1) {return this.vers1.slice();}
        else if (versionNumber == 2) {return this.vers2.slice();}
        else if (versionNumber == 3) {return this.vers3.slice();}
        else {console.log("Error in retrieving Tetroid Version");}
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

    // Initialize all ShapeStats class objects
    const lShapeStats = new ShapeStats('lShape', [3, 5, 6, 7]);
    const revLShapeStats = new ShapeStats('revLShape', [2, 3, 5, 7])
    const tShapeStats = new ShapeStats('tShape', [3, 4, 5, 7]);
    const squareShapeStats = new ShapeStats('squareShape', [2, 4, 3, 5]);
    const sShapeStats = new ShapeStats('sShape', [3, 4, 5, 6]);
    const revSShapeStats = new ShapeStats('revSShape', [2, 4, 5, 7]);
    const lineShapeStats = new ShapeStats('lineShape', [0, 2, 4, 6]);   

    game.shapeStatArr = [lShapeStats, revLShapeStats, tShapeStats, squareShapeStats, sShapeStats, revSShapeStats, lineShapeStats];
    game.shapeStatArr.forEach(item => {item.initialize()});
}

// Instantiate all members of Tetroid class
function intializeTetroids() {
    const lShape = new Tetroid(0, 'green', [3, 11, 12, 13], [1, 11, 21, 22], [11, 12, 13, 21], [1, 2, 12, 22]);
    const revLShape = new Tetroid(1, 'yellow', [11, 12, 13, 1], [1, 11, 21, 2], [11, 12, 13, 23], [2, 12, 21, 22])
    const tShape = new Tetroid(2, 'orange', [11, 12, 13, 2], [2, 12, 22, 13], [11, 12, 13, 22], [2, 12, 22, 11]);
    const squareShape = new Tetroid(3, 'greenyellow', [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12], [1, 2, 11, 12]);
    const sShape = new Tetroid(4, 'violet', [2, 3, 11, 12], [1, 11, 12, 22], [2, 3, 11, 12], [1, 11, 12, 22]);
    const revSShape = new Tetroid(5, 'darksalmon', [1, 2, 12, 13], [2, 11, 12, 21], [1, 2, 12, 13], [2, 11, 12, 21]);
    const lineShape = new Tetroid(6, 'blue', [0, 1, 2, 3], [2, 12, 22, 32], [0, 1, 2, 3], [2, 12, 22, 32]);

    game.shapeTemplates = [lShape, revLShape, tShape, squareShape, sShape, revSShape, lineShape];
}

// Instantiate play area
function initializePlayArea() {
    // Calculates and sets the width and height of playable area in px, including tile borders using the game object
    function adjustTileSize() {
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        let leftStats = document.querySelector('.aside-left-stats');
        let rightStats = document.querySelector('.aside-right-stats');
        let adjustTileWidth = 0;

        if (screenWidth < 500) {
            leftStats.style.display = "none";
            rightStats.style.display = "none";
            adjustTileWidth = (screenWidth - 185) / game.tilesWide;
        }
        else {
            leftStats.style.display = "flex";
            rightStats.style.display = "flex";
            adjustTileWidth = (screenWidth - 355) / game.tilesWide;
        }
        
        let checkTileHeight = adjustTileWidth * 15 + 80;
        if (checkTileHeight < screenHeight) {
            game.tileDimension = adjustTileWidth;
        }
        else {
            adjustTileHeight = (screenHeight - 80) / game.tilesHigh;
            game.tileDimension = adjustTileHeight;
        }
        game.gridSelector = document.querySelector('#gameGrid');
        game.gridWidth = (game.tilesWide * game.tileDimension + 2 * game.tilesWide) + 'px';
        game.gridHeight = (game.tilesHigh * game.tileDimension + 2 * game.tilesHigh) + 'px';
        game.gridSelector.style.width = game.gridWidth;
        game.gridSelector.style.height = game.gridHeight;
    }
    
    adjustTileSize();

    // Instantiates all game tiles with borders and adds to the tileArr
    for(let i = 0; i < game.tilesWide * game.tilesHigh; i++) {
        let gridTile = document.createElement('div');
        gridTile.classList = "gridTile";
        gridTile.style.width = game.tileDimension + "px";
        gridTile.style.height = game.tileDimension + "px";
        gridTile.style.border = "1px solid white";
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

// Set up listeners for key and button functionality
function initializeControls() {
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

    // Listeners to use keys to control shape actions
    document.addEventListener('keydown', (event) => {
        // Press left arrow to move tetroid left
        if (event.code == "ArrowLeft") {moveLeft();}

        // Rotate tetroid counterclockwise if the d key is pressed
        else if (event.code == "KeyD") {rotate("CCW");}

        // Rotate tetroid clockwise if the f key is pressed
        else if (event.code == "KeyF") {rotate("CW");}

        // Press right arrow to move tetroid right
        else if (event.code == "ArrowRight") {moveRight();}
    }) 

    // Create newGame button in score banner that will reset all stats and the board
    let newGameButton = document.querySelector('#newGame');
    newGameButton.addEventListener('click', () => {
        newGameButton.blur();
        resetGame();
        game.gravity = setInterval(playGame, game.fallInterval.current);
    })
    
    // Create play/pause button in score banner
    let playPauseButton = document.querySelector('#play-pause');
    playPauseButton.addEventListener('click', () => {
        if (game.pauseFlag) {
            playPauseButton.blur();
            game.gravity = setInterval(playGame, game.fallInterval.current);
            game.pauseFlag = false;
        }
        else {
            clearInterval(game.gravity);
            game.pauseFlag = true;
        }
    })
}

// Must call to initialize the game
function setupGame() {
    initializePlayArea();
    initializeStats();
    intializeTetroids();
    initializeControls();
}

function playGame() {
    // Randomly selects next tetroid to appear
    function generateShape() {
        game.curTemplateId = Math.floor(Math.random() * game.shapeTemplates.length);
        game.shapeTemplates[game.curTemplateId].initialPos();
        game.shapeStatArr[game.curTemplateId].update(1);
    }

    function clearRows(rowsToClear) {
        let rowsToClearLen = rowsToClear.length;
        updateScoreStats(rowsToClearLen);
        for (let i = 0; i < rowsToClearLen; i++) {
            let row = rowsToClear.pop();
            moveRowsDown(row, i + 1);
        }
    }

    function moveRowsDown(row, rowsShifted) {
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
        game.currentScore.update(rowsToClearLen);
        game.totalRowsCleared.update(rowsToClearLen);
        
        if (rowsToClearLen == 1) {game.oneRowCleared.update(1);}
        else if (rowsToClearLen == 2) {game.twoRowsCleared.update(1);}
        else if (rowsToClearLen == 3) {game.threeRowsCleared.update(1);}
        else if (rowsToClearLen == 4) {game.fourRowsCleared.update(1);}
    }

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
            if (rowsToClear.length > 0) {clearRows(rowsToClear);}
            generateShape();
        }
    }
}

// Called to set up the game
setupGame();

function resetGame() {
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
    game.pauseFlag = false;
}