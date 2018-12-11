var timeValue = 0;
var columns = 9;
var rows = 9;
var mineCount = 10;
var flagCountValue = mineCount; //number of flags the user had remaining
var tiles = []; //array of just tiles, no mines
var coordinates = null; //2D array containing all the tiles
var mines = []; //array of mines
var isFirstTurn = true; //true when it is the users first turn
var remainingTiles = columns * rows - mineCount; //number of remaining tiles that are not mines
var isGameOver = false; //when true the user will be unable to select any buttons

function buildGrid() {
    // Fetch grid and clear out old elements.
    var grid = document.getElementById("minefield");
    grid.innerHTML = "";

    // Build DOM Grid
    var tile;
    coordinates = new Array( rows );
    for (var x = 0; x < rows; x++) {
        coordinates[x] = new Array(columns);
        for (var y = 0; y < columns; y++) {
            tile = createTile(x,y);
            grid.appendChild(tile);

            coordinates[x][y] = tile;
            coordinates[x][y].revealed = false;
        }
    }
    
    var style = window.getComputedStyle(tile);

    var width = parseInt(style.width.slice(0, -2));
    var height = parseInt(style.height.slice(0, -2));
    
    grid.style.width = (columns * width) + "px";
    grid.style.height = (rows * height) + "px";
}

function createTile(x,y) {
    var tile = document.createElement("div");

    tile.classList.add("tile");
    tile.classList.add("hidden");
    tile.x = x;
    tile.y = y;
    
    tile.addEventListener("auxclick", function(e) { e.preventDefault(); }); // Middle Click
    tile.addEventListener("contextmenu", function(e) { e.preventDefault(); }); // Right Click
    tile.addEventListener("mouseup", handleTileClick ); // All Clicks
    tile.addEventListener("mousedown", smileyLimbo);

    tiles.push(tile);

    return tile;
}

//randomly add mines to the grid
function generateMines() {
    var count = 0;
    while ( count++ < flagCountValue ) {
        var idx = Math.floor( Math.random() * tiles.length );
        var coordinate = tiles[ idx ];
    
        coordinates[coordinate.x][coordinate.y].mine = true;

        //remove tile from tiles as it is used as a mine
        tiles.splice( idx, 1 );

        mines.push(coordinate);
    }   
}

//start a new game
function startGame() {
    resetGame();
    buildGrid();
    generateMines();
    smileyAlive();
    document.getElementById("flagCount").innerHTML = flagCountValue;
}

function handleTileClick(event) {
    smileyNoLimbo();

    if (!isGameOver) {
        // Left Click
        if (event.which === 1)
            checkTile(this);
        // Middle Click
        else if (event.which === 2)
            revealAdjacentTiles(this);
        // Right Click
        else if (event.which === 3)
            updateFlag(this);
    }
}

function smileyDown() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_down");
}

function smileyUp() {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_down");
}

function smileyDead() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_lose");
}

function smileyAlive() {
    var smiley = document.getElementById("smiley");
    if(smiley.classList.contains("face_lose"))
        smiley.classList.remove("face_lose");
    else if(smiley.classList.contains("face_win"))
        smiley.classList.remove("face_win");
}

function smileyLimbo() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_limbo");
}

function smileyNoLimbo() {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_limbo");
}

function smileyWin() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_win");
}

function updateNotification(message) {
    document.getElementById("notification").innerHTML = message;
}

//change the game parameters base on the users difficulty input
function setDifficulty() {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = difficultySelector.selectedIndex;

    if(difficulty == 0) {
        mineCount = 10;
        rows = 9;
        columns = 9;
    }
    else if(difficulty == 1) {
        mineCount = 40;
        rows = 16;
        columns = 16;
    }
    else if(difficulty == 2) {
        mineCount = 99;
        rows = 30;
        columns = 16;
    }
}

function startTimer() {
    timeValue = 0;
    timer = window.setInterval(onTimerTick, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function onTimerTick() {
    timeValue++;
    updateTimer();
}

function updateTimer() {
    document.getElementById("timer").innerHTML = timeValue;
}

//checks the type of tile that the user has selected
function checkTile(elem) {
     if (!elem.classList.contains("flag")) {
        if(coordinates[elem.x][elem.y].mine && !isFirstTurn)
            mineFound(elem)
        else
            displayTile(elem)
     }    
}

//add and remove flag on the tile that the user has selected
function updateFlag(elem) {
    if(!coordinates[elem.x][elem.y].revealed) {
        if(elem.classList.contains("flag")) {
        elem.classList.remove("flag");
        elem.classList.add("hidden");
        flagCountValue++;
        } else {
            elem.classList.remove("hidden");
            elem.classList.add("flag");
            flagCountValue--;
        }
        document.getElementById("flagCount").innerHTML = flagCountValue;
    }
}

//reveals the tiles that are adjancet to the selected tile
function revealAdjacentTiles(elem) {
    var x = elem.x == 0 ? elem.x : elem.x - 1;
    for( ; x <= elem.x + 1 && x < coordinates.length; x++) {
        var y = elem.y == 0 ? elem.y : elem.y-1;
        for( ; y <= elem.y + 1 && y < coordinates[x].length; y++) {
            if(!coordinates[x][y].revealed) {
                checkTile(coordinates[x][y]);
            }
        }
    }
}

//calls functions to display all the mines when a mine is selected
function mineFound(elem) {
    displayAllMines();
    displayWrongFlags();
    elem.classList.remove("mine");
    elem.classList.add("mine_hit");
    gameOver();
}


//iterate through the mines array to reveal all the mines
function displayAllMines() {
    for (var i = 0; i < mines.length; i++) {
        if(!mines[i].classList.contains("flag")) {
            mines[i].classList.remove("hidden");
            mines[i].classList.add("mine");
        }
    }
}

//iterate through the coordinates to see if there is a flag on a tile that doesnt have a mine
function displayWrongFlags() {
    for(var x = 0; x < coordinates.length; x++) {
        for(var y = 0 ; y < coordinates[x].length; y++) {
            if(!coordinates[x][y].mine && coordinates[x][y].classList.contains("flag")) {
                coordinates[x][y].classList.remove("flag");
                coordinates[x][y].classList.add("mine_marked");
            }
        }
    }
}

//Sets the tiles number based on the number of neighbouring mines
function displayTile(elem) {
    var neighbourMines = getNumNeighbourMines( elem.x, elem.y );
   
    if (neighbourMines != 0 && !isFirstTurn) {
        elem.classList.remove("hidden");
        switch ( neighbourMines ) { 
            case 1: 
                elem.classList.add("tile_1");
                break;
            case 2: 
                elem.classList.add("tile_2");
                break;
            case 3: 
                elem.classList.add("tile_3");
                break;
            case 4: 
                elem.classList.add("tile_4");
                break;
            case 5: 
                elem.classList.add("tile_5");
                break;
            case 6: 
                elem.classList.add("tile_6");
                break;
            case 7: 
                elem.classList.add("tile_7");
                break;
            case 8: 
                elem.classList.add("tile_8");
                break;
        }
        coordinates[elem.x][elem.y].revealed = true;
        remainingTiles --;
    } else if(neighbourMines == 0) {
        coordinates[elem.x][elem.y].revealed = true;
        remainingTiles --;
        if (isFirstTurn) {
            isFirstTurn = false;
            startTimer();
        }
        elem.classList.remove("hidden");
        expand( elem.x, elem.y );
    }

    //if there are no more tiles to be revealed then the user has won
    if(remainingTiles == 0)
        winner();
}

//iterate over the adjacent tiles to see how many of them are mines
function getNumNeighbourMines(elemX, elemY) {
    var mineCount = 0;
        
    var x = elemX==0 ? elemX : elemX-1;
    for( ; x <= elemX + 1 && x < coordinates.length; x++) {
        var y = elemY==0 ? elemY : elemY-1;
        for( ; y <= elemY + 1 && y < coordinates[x].length; y++) {
            if(coordinates[x][y].mine) {
                mineCount++;
            }
        }
    }
    return mineCount;
}

function expand( elemX, elemY ) {
    var x = elemX == 0 ? elemX : elemX - 1;
    for( ; x <= elemX + 1 && x < coordinates.length; x++) {
        var y = elemY == 0 ? elemY : elemY-1;
        for( ; y <= elemY + 1 && y < coordinates[x].length; y++) {
            if(!coordinates[x][y].mine && !coordinates[x][y].revealed && !coordinates[x][y].classList.contains("flag")) {
                displayTile(coordinates[x][y]);
            }
        }
    }
}

//resets all the variables in order to start a new game
function resetGame() {
    tiles = [];
    coordinates = null;
    mines = [];  
    flagCountValue = mineCount;
    isFirstTurn = true;
    updateNotification("");
    remainingTiles = columns*rows - mineCount;
    isGameOver = false;
    timeValue = 0;
    updateTimer();
}

function winner() {
    isGameOver = true;
    updateNotification(`Congratulations, You Win! Your score was ${timeValue}.`);
    stopTimer();
    smileyWin();
}

function gameOver() {
    isGameOver = true;
    stopTimer();
    updateNotification("You Lose! Try again");
    smileyDead();
}