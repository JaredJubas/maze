var canvas = document.getElementById("maze");
var ctx = canvas.getContext("2d");
var canvasText = document.getElementById("text");
var context = canvasText.getContext("2d");
var winText = document.getElementById("win");
var rows = 30;
var cols = rows;
var total = rows * cols;
var nodes;
var width = canvas.width / cols;
var height = canvas.height / rows;
var colStart;
var rowStart;
var radius = Math.min(width / 4, height / 4);
var oldCol;
var moves;
var clearPath = [];

function drawNodes() {
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

function createClearPath() {
    for (let i = 0; i < rows; i++) {
        clearPath[i] = [];
        for (let j = 0; j < cols; j++) {
            clearPath[i][j] = [];
        }
    }
}

function generateClearPath() {
    clearPath[oldRow][oldCol].push([rowCur, colCur]);
    clearPath[rowCur][colCur].push([oldRow, oldCol]);
}

function checkClearPath() {
    for (let i = 0; i < clearPath[oldRow][oldCol].length; i++) {
        if (clearPath[oldRow][oldCol][i][0] == rowCur && clearPath[oldRow][oldCol][i][1] == colCur) {
            return true;
        }
    }
    return false;
}

function generateNodes() {
    for (let i = 0; i < rows; i++) {
        nodes[i] = [];
        for (let j = 0; j < cols; j++) {
            // neighboring cells format: left, up, right, down
            // ordered row, col, wall exists 
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

function pickStart() {
    // Math.random picks number between 0(inclusive) and 1(exclusive)
    rowStart = Math.floor(Math.random() * rows);  
    if (rowStart == 0 || rowStart == rows - 1) {
        colStart = Math.ceil(Math.random() * (cols - 1));
    }
    else {
        colStart = Math.floor(Math.random() * 2) * (cols - 1);
    }    
}

function checkVisited(node) {
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

function generatePath() {
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

function draw() {
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
    let endX = canvas.width - width;
    let endY = canvas.height - height;
    ctx.beginPath();
    ctx.rect(endX + 1, endY + 1, width - 2, height - 2);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.closePath();
}

function keyActionDown(key) {
    oldCol = colCur;
    oldRow = rowCur;
    // left
    if (key.keyCode == 37 || key.keyCode == 65) {
        colCur -= 1;
        moves += 1;
    }
    // up
    else if (key.keyCode == 38 || key.keyCode == 87) {
        rowCur -= 1;
        moves += 1;
    }
    // right
    else if (key.keyCode == 39 || key.keyCode == 68) {
        colCur += 1;
        moves += 1;
    }
    // down
    else if (key.keyCode == 40 || key.keyCode == 83) {
        rowCur += 1;
        moves += 1;
    }
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

function drawMoves() {
    context.clearRect(0, 0, canvasText.width, canvasText.height);
    context.font = "16px Arial";
    context.fillStyle = "blue";
    context.fillText("Moves: " + moves, 0, 16);
  }

var path;
var neighbor;
var rowCur;
var colCur;
var visited;
var visitedNodes;
var oldRow;
var curNode;
play();

function play() {
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

function win() {
    clearInterval(interval);
    window.removeEventListener("keydown", keyActionDown); 
    winText.style.display = "block";
    window.addEventListener("keydown", resetGame);

}

function resetGame(key) {
    if (key.keyCode == 82) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        window.removeEventListener("keydown", resetGame); 
        winText.style.display = "none";
        play()
    }
}