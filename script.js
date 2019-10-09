// The canvas
var canvas = document.getElementById("maze");

// Context variables
var ctx = canvas.getContext("2d");
var context = canvasText.getContext("2d");

// Text variables
var canvasText = document.getElementById("text");
var winText = document.getElementById("win");

// Size of maze variables
var rows = 15;
var cols = rows;
var total = rows * cols;

// Node variables
var nodes;
var curNode;
var visitedNodes;
var neighbor;

// Dimensions of each node in the maze
var width = canvas.width / cols;
var height = canvas.height / rows;

// Variables to keep track of rows and columns
var colStart;
var rowStart;
var oldCol;
var oldRow;
var rowCur;
var rowCur;

// Clear path through the maze to show where the player can move
var clearPath = [];

// Number of nodes visited by depth first search algorithm 
var visited;

// Path currently being traversed by depth first search algorithm 
var path;

// Number of moves the player has made
var moves;

// Radius for ball representing the player
var radius = Math.min(width / 4, height / 4);

// Start the game!
play();

function play() {
    // The main function for the maze. Setup the maze and allow the player to play it
    
    window.addEventListener("keydown", keyActionDown);
    nodes = [];
    generateNodes()
    pickStart();
    path = [[rowStart, colStart]];
    neighbor = null;
    rowCur = rowStart;
    colCur = colStart;
    visited = 1;
    visitedNodes = [[rowStart, colStart]];
    oldRow;
    curNode;
    generatePath();
    rowCur = 0;
    colCur = 0;
    moves = 0;
    interval = setInterval(draw, 10);
}

function generateNodes() {
    // Generate the nodes represented as a nested list

    for (let i = 0; i < rows; i++) {
        nodes[i] = [];
        for (let j = 0; j < cols; j++) {
            // each i, jth entry of nodes represent the neighboring cells
            // neighboring cells format: left, up, right, down
            // nodes in following order: row, col, wall exists 
            nodes[i][j] = [[i, j - 1, 1, "left"], [i - 1, j, 1, "up"], [i, j + 1, 1, "right"], [i + 1, j, 1, "down"]];
            // remove cells that don't exist
            if (nodes[i][j][3][0] >= rows) {
                nodes[i][j].splice(3, 1);
            }
            if (nodes[i][j][2][1] >= cols) {
                nodes[i][j].splice(2, 1);
            }
            if (nodes[i][j][1][0] < 0) {
                nodes[i][j].splice(1, 1);
            }
            if (nodes[i][j][0][1] < 0) {
                nodes[i][j].splice(0, 1);
            }
        }
    }
    drawNodes();
}

function drawNodes() {
    // Draw the nodes in the maze

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    // draw rows
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * height);
        ctx.lineTo(canvas.width, i * height);
        ctx.stroke();
    }
    // draw columns
    for (let j = 0; j <= cols; j++) {
        ctx.beginPath();
        ctx.moveTo(j * width, 0);
        ctx.lineTo(j * width, canvas.height);
        ctx.stroke();
    }
}

function pickStart() {
    // Randomly pick a starting column and row somewhere on the outer section of the maze

    rowStart = Math.floor(Math.random() * rows);  
    if (rowStart == 0 || rowStart == rows - 1) {
        colStart = Math.ceil(Math.random() * (cols - 1));
    }
    else {
        colStart = Math.floor(Math.random() * 2) * (cols - 1);
    }    
}

function generatePath() {
    // Generate the path through the maze that the player can move through

    createClearPath();
    while (visited < total) {
        while (neighbor == null && nodes[rowCur][colCur].length != 0) {
            neighbor = Math.floor(Math.random() * nodes[rowCur][colCur].length);
            if (checkVisited(nodes[rowCur][colCur][neighbor])) {
                nodes[rowCur][colCur].splice(neighbor, 1);
                neighbor = null;
            }
        }
        if (neighbor == null) {
            // all neighbors visited
            curNode = path.pop();
            rowCur = curNode[0];
            colCur = curNode[1];
        }
        else {
            // remove the wall between the two nodes
            nodes[rowCur][colCur][neighbor][2] = 0;
            removeWall(rowCur, colCur, nodes[rowCur][colCur][neighbor][3]);
            path.push(nodes[rowCur][colCur][neighbor]);
            visitedNodes.push(nodes[rowCur][colCur][neighbor]);
            oldRow = rowCur;
            oldCol = colCur;
            rowCur = nodes[rowCur][colCur][neighbor][0];
            colCur = nodes[oldRow][colCur][neighbor][1];
            visited += 1;
            generateClearPath();
        }
        neighbor = null;
    }
}

function createClearPath() {
    // Create an empty list to represent the clear path for the player

    for (let i = 0; i < rows; i++) {
        clearPath[i] = [];
        for (let j = 0; j < cols; j++) {
            clearPath[i][j] = [];
        }
    }
}

function checkVisited(node) {
    // Return true if the node has been visited and false otherwise

    if (visitedNodes.length == 0) {
        return false;
    }
    for (var i = 0; i < visitedNodes.length; i++) {
        if (node[0] == visitedNodes[i][0] && node[1] == visitedNodes[i][1]) {
            return true;
        }
    }
    return false;
}

function removeWall(row, col, direction) {
    // Remove the wall at the given row and col in the specified direction by making the line white

    ctx.beginPath();
    if (direction == "left") {
        ctx.moveTo(col * width, row * height + 0.6);
        ctx.lineTo(col * width, (row + 1) * height - 0.6);
    }
    else if (direction == "up") {
        ctx.moveTo(col * width + 0.6, row * height);
        ctx.lineTo((col + 1) * width - 0.6, row * height);
    }
    else if (direction == "right") {
        ctx.moveTo((col + 1) * width, row * height + 0.6);
        ctx.lineTo((col + 1) * width, (row + 1) * height - 0.6);
    }
    else {
        ctx.moveTo(col * width + 0.6, (row + 1) * height);
        ctx.lineTo((col + 1) * width - 0.6, (row + 1) * height);
    }
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function generateClearPath() {
    // Generate the clear path for the player

    clearPath[oldRow][oldCol].push([rowCur, colCur]);
    clearPath[rowCur][colCur].push([oldRow, oldCol]);
}

function draw() {
    // Draw the maze with the player position and end 

    ctx.clearRect(oldCol * width + 1, oldRow * height + 1, width - 2, height - 2);
    drawEnd();
    drawMoves()
    ctx.beginPath();
    var x = colCur * width + width / 2;
    var y = rowCur * height + height / 2;
    ctx.arc(x, y, radius, 0, 2*Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
    if (rowCur == rows - 1 && colCur == cols - 1) {
        win();
    }
}

function drawEnd() {
    // Draw the end

    let endX = canvas.width - width;
    let endY = canvas.height - height;
    ctx.beginPath();
    ctx.rect(endX + 1, endY + 1, width - 2, height - 2);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.closePath();
}

function drawMoves() {
    // Draw the number of moves below the maze that the player has made

    context.clearRect(0, 0, canvasText.width, canvasText.height);
    context.font = "16px Arial";
    context.fillStyle = "blue";
    context.fillText("Moves: " + moves, 0, 16);
  }

function keyActionDown(key) {
    // Change the row or column depending on what key was pressed

    oldCol = colCur;
    oldRow = rowCur;
    // left
    moves += 1
    if (key.keyCode == 37 || key.keyCode == 65) {
        colCur -= 1;
    }
    // up
    else if (key.keyCode == 38 || key.keyCode == 87) {
        rowCur -= 1;
    }
    // right
    else if (key.keyCode == 39 || key.keyCode == 68) {
        colCur += 1;
    }
    // down
    else if (key.keyCode == 40 || key.keyCode == 83) {
        rowCur += 1;
    }
    // make sure the move was ina  valid spot
    if (colCur > cols - 1 || colCur < 0) {
        colCur = oldCol;
        moves -= 1;
    }
    else if (rowCur > rows - 1 || rowCur < 0) {
        rowCur = oldRow;
        moves -= 1;
    }
    else if (!checkClearPath()) {
        rowCur = oldRow;
        colCur = oldCol;
        moves -= 1;
    }
    draw();
}

function checkClearPath() {
    // 

    for (let i = 0; i < clearPath[oldRow][oldCol].length; i++) {
        if (clearPath[oldRow][oldCol][i][0] == rowCur && clearPath[oldRow][oldCol][i][1] == colCur) {
            return true;
        }
    }
    return false;
}

function win() {
    // Display the win message and allow the player to press the R key to reset the maze

    clearInterval(interval);
    window.removeEventListener("keydown", keyActionDown); 
    winText.style.display = "block";
    window.addEventListener("keydown", resetGame);

}

function resetGame(key) {
    // Reset the game with a new maze if the R key was pressed

    if (key.keyCode == 82) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.removeEventListener("keydown", resetGame); 
        winText.style.display = "none";
        play()
    }
}
