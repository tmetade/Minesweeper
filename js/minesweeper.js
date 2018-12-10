//TODO
//comment this bad boy
//make it look nice
//group related functions

var timeValue = 0;
var columns = 9;
var rows = 9;
var mineCount = 10;
var flagCountValue = mineCount;
var tiles = [];
var coordinates = null;
var mines = [];
var isFirstTurn = true;
var remainingTiles = columns * rows - mineCount;
var isGameOver = false;

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
        console.log( coordinate.y + ":" + coordinate.x );
    }   
}

function startGame() {
    //reset variables in case new game starts
    resetGame();

    // update remaining bombs
    document.getElementById("flagCount").innerHTML = flagCountValue;

    buildGrid();
    generateMines();
    smileyAlive();
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

function setDifficulty() {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = difficultySelector.selectedIndex;

    if(difficulty == 0)
    {
        console.log("easy");
        mineCount = 10;
        rows = 9;
        columns = 9;
    }
    else if(difficulty == 1)
    {
        console.log("medium");
        mineCount = 40;
        rows = 16;
        columns = 16;
    }
    else if(difficulty == 2)
    {
        console.log("hard");
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

function mineFound(elem) {
    displayAllMines();
    displayWrongFlags();
    elem.classList.remove("mine");
    elem.classList.add("mine_hit");
    gameOver();
}

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

    if(remainingTiles == 0)
        winner();
}

function gameOver() {
    isGameOver = true;
    stopTimer();
    updateNotification("You Lose! Try again");
    smileyDead();
}

function displayAllMines() {
    for (var i = 0; i < mines.length; i++) {
        if(!mines[i].classList.contains("flag")) {
            mines[i].classList.remove("hidden");
            mines[i].classList.add("mine");
        }
    }
}

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

function updateFlag(elem) {
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

function revealAdjacentTiles(elem) {
    elem.classList.remove("hidden");
}

function checkTile(elem) {
     if (!elem.classList.contains("flag")) {
        if(coordinates[elem.x][elem.y].mine && !isFirstTurn)
            mineFound(elem)
        else
            displayTile(elem)
     }    
}

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

function winner() {
    isGameOver = true;
    updateNotification(`Congratulations, You Win! Your score was ${timeValue}.`);
    stopTimer();
    smileyWin();
}

function updateNotification(message) {
    document.getElementById("notification").innerHTML = message;
}