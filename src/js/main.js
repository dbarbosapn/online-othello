/**
 * Panels:
 * 
 * 0 - Authentication
 * 1 - Configuration
 * 2 - Game
 * 3 - Instructions (Modal)
 * 4 - Highscore (Modal)
 * 5 - Confirmation (Modal)
 */
var currPanel = 0;

const configuration = {
    gameType: "ai",
    playerColor: "light",
    aiDifficulty: "easy",
}

var currentBoard = new Board(8);
var enemy;

window.onload = function() {
    hideOverlay();
    setupAuthentication();
    setupConfiguration();
    setupInstructions();
    setupHighScore();
    setupGame();

    showPanel(currPanel);
}

function setupAuthentication() {
    let button = document.getElementById("auth-button");

    button.onclick = function() {
        switchPanel(1);
    }
}

function setupConfiguration() {
    let button = document.getElementById("config-button");
    let vsAi = document.getElementById("vs-ai");
    let vsPlayer = document.getElementById("vs-player");
    let aiDifficultySection = document.getElementById("ai-difficulty-section");

    vsAi.onchange = function() {
        aiDifficultySection.style.display = "flex";
    }

    vsPlayer.onchange = function() {
        aiDifficultySection.style.display = "none";
    }

    button.onclick = function() {
        if (vsAi.checked) configuration.gameType = "ai";
        else configuration.gameType = "player";

        if (document.getElementById("color-light").checked) configuration.playerColor = "light";
        else configuration.playerColor = "dark";

        configuration.aiDifficulty = document.getElementById("ai-difficulty").value;

        let depth = 0;
        switch (configuration.aiDifficulty) {
            case "easy":
                depth = 1;
                break;
            case "moderate":
                depth = 3;
                break;
            case "hard":
                depth = 6;
                break;
            case "hardcore":
                depth = 10;
                break;
        }

        enemy = new AIPlayer(depth, getTypeId(configuration.playerColor === "light" ? "dark" : "light"));

        setupBoard();        

        switchPanel(2);

        startGame();
    }
}

function setupInstructions() {
    /* Getting the references for each button*/
    let instButton = document.getElementById("inst-button");
    let nextButton = document.getElementById("inst-next");
    let prevButton = document.getElementById("inst-prev");
    let closeButton = document.getElementById("close-button-inst");
  
    /* This array shall hold the all diferent references for the instruction pages*/
    let instBox = new Array();

    /* As the name implies, it holds the possition in the instruction manual, as well
        as the first and last page number. If we want to add more pages its as simple
        as changing the value of instLastPage!!! */
    let instCurPage;
    let instFirstPage = 1;
    let instLastPage = 3;

    /* Function to track all the instruction boxes and save it in an array. */
    function trackInstBox() {
        for ( let i=instFirstPage; i<=instLastPage; i++ ) {
            instBox[i] = document.getElementById("inst-box-"+i);
        }
    }

    trackInstBox();

    /* Funtion to remove all pages from the screen */
    function resetPages() {
        for ( let i=instFirstPage; i<=instLastPage; i++) {
            instBox[i].style.display = "none";
        }
    }

    /* Function to add a page to the current screen */
    function instSwitchPage(current) {
        resetPages();
        instBox[current].style.display = "flex";
        instButtonMechanic(current);
    }

    /* Button mechanics. Its in charge of dealing with the buttons. 
        For example, on the last page we can«t have a next button. */
    function instButtonMechanic(current) {
        switch (current) {
            case instFirstPage:
                prevButton.style.display = "none"; 
                nextButton.style.display = "block";
                break;

            case instLastPage:
                prevButton.style.display = "block"; 
                nextButton.style.display = "none";
                break;
            
            default:
                prevButton.style.display = "block"; 
                nextButton.style.display = "block";
        }
    }

    instCurPage = instFirstPage;
    instSwitchPage(instFirstPage);

    /* What to do when a certain reference is clicked on */
    instButton.onclick = function() {
        showPanel(3, true);
    }

    nextButton.onclick = function() {
        instCurPage++;
        instSwitchPage(instCurPage);
    }

    prevButton.onclick = function() {
        instCurPage--;
        instSwitchPage(instCurPage);
    }

    closeButton.onclick = function() {
        instCurPage = instFirstPage;
        instSwitchPage(instFirstPage);
        hidePanel(3, true);
    }
}

function setupHighScore() {
    let closeButton = document.getElementById("close-button-hs");
    let highScore = document.getElementById("highScore-button");

    displayHighScore();

    highScore.onclick = function() {
        showPanel(4, true);
    }

    closeButton.onclick = function() {
        hidePanel(4, true);
    }
}

function setupGame() {
    let manual = document.getElementById("manual-icon");
    let ranking = document.getElementById("ranking-icon");
    let forfeit = document.getElementById("forfeit-flag");

    manual.onclick = function () {
        showPanel(3, true);
    }

    ranking.onclick = function () {
        showPanel(4, true);
    }

    forfeit.onclick = function () {
        showConfirmationDialog("Forfeit", "Are you sure you want to forfeit?", function () {
            alert("You have forfeit!");
        });
    }
}

function setupBoard() {
    let board = document.getElementById("board");

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `cell-${i}-${j}`;

            let piece = document.createElement("div");
            piece.className = "piece";
            piece.classList.add("empty");
            
            cell.appendChild(piece);

            cell.onclick = function () {
                playerTurn(new Point(i, j));
            }

            board.appendChild(cell);
        }
    }

    processBoard();
}

function processBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            setPiece(i, j, currentBoard.getPieceName(new Point(i, j)));
        }
    }
}

function setPiece(i, j, type) {
    let cell = document.getElementById(`cell-${i}-${j}`);
    let piece = cell.firstChild;

    piece.classList.remove("light");
    piece.classList.remove("dark");
    piece.classList.remove("empty");


    switch (type) {
        case "empty":
            piece.classList.add("empty");
            break;
        case "light":
            piece.classList.add("light");
            break;
        case "dark":
            piece.classList.add("dark");
            break;
    }
}

function outputMessage(type, msg) {
    let ref = document.getElementById("msg-box");
    
    let className = null;

    /* Defining the class to be used in newElem */
    switch(type) {
        case "error":
            className = "msg-style error-msg";
            break;
            
        case "info":
            className = "msg-style info-msg";           
            break;

        case "warning":
            className = "msg-style warning-msg";            
            break;
    }

    addTextElement(ref, "p", msg, className).scrollIntoView(true);
}

function addTextElement(reference, whatType, msg, whatClass = null) {
    /* Creating a new element of type "whatType", where whatType=="p" || 
        whatType=="h1" etc..*/
    let newElem = document.createElement(whatType);

    /* Changing the class of newElem. Previously <whatType> now <whatType class=whatClass> */
    if (whatClass) {
        newElem.classList = whatClass;
    }

    /* Adding a text node to newElem. Previousle <whatType class...></whatType> now 
        <whatType class...>msg</whatType> */
    newElem.appendChild(document.createTextNode(msg));

    /* Adding the new node created previously, aka newElem, to the end of ref */
    reference.appendChild(newElem);

    return newElem;
}

function showGameAlert (str) {
    let display = document.getElementById("game-alert");

    let newElem = addTextElement(display, "h1", str);

    setTimeout(function() { 
        newElem.remove();
    }, 3000);
}

function switchPanel(newPanel) {
    hidePanel(currPanel);
    showPanel(newPanel);
    currPanel = newPanel;
}

function hidePanel(panel, modal = false) {
    let boxName = getBoxName(panel);
    document.getElementById(boxName).style.display = "none";

    if (modal) {
        hideOverlay();
    }
}

function showPanel(panel, modal = false) {
    let boxName = getBoxName(panel);
    document.getElementById(boxName).style.display = "flex";

    if (modal) {
        showOverlay();
    }
}

function hideOverlay() {
    document.getElementById("dark-overlay").style.display = "none";
}

function showOverlay() {
    document.getElementById("dark-overlay").style.display = "block";
}

function getBoxName(panel) {
    switch (panel) {
        case 0:
            return "ident-box";
        case 1:
            return "config-box";
        case 2:
            return "game-box";
        case 3:
            return "inst-box";
        case 4:
            return "high-score-box";
        case 5:
            return "confirmation-dialog";
    }

    return "";
}

/* HighScores*/
function HighScore(name, date, score) {
    this.name = name;
    this.date = date;
    this.score = score;
}

/* Array to test high Score table writing*/
var players = [new HighScore("Enio", "31-12-20", 69),
    new HighScore("Jesus", "0-0-0", 999),
    new HighScore("Diogo", "13-7-13", 420)
];

/* Right now the following functions are just for
    testing the High Score panel. But i think we can
    use them when we actually want to have a real HS.
    The structure can also be usefull for implementing
    a message board or a command feedback*/
function displayHighScore() {
    let content = "";
    players.sort((a, b) => b.score - a.score);
    players.forEach((player) => content += '<tr><td>' + player.name + '</td><td>' + player.date + '</td><td>' + player.score + '</td></tr>');
    document.getElementById("highscore-content").innerHTML = content;
}

function displayMiniHighScore() {
    let content = "";
    players.sort((a, b) => a.score - b.score);

    players.forEach(player => {
        content += '<tr><td>' + player.name + '</td></tr>'
    });

    document.getElementById("mini-highscore-content").innerHTML = content;
}

function showConfirmationDialog(title, content, onConfirm) {
    document.getElementById("dialog-title").innerText = title;
    document.getElementById("dialog-content").innerText = content;

    document.getElementById("cancel-button").onclick = function () {
        hidePanel(5, true);
    }

    document.getElementById("confirm-button").onclick = function () {
        onConfirm();
        hidePanel(5, true);
    };

    showPanel(5, true);
}

function getTypeId(type) {
    switch (type) {
        case "empty":
            type = 0;
            break;
        case "dark":
            type = 1;
            break;
        case "light":
            type = 2;
            break;
    }
    return type;
}