/**
 * Panels:
 * 
 * 0 - Authentication
 * 1 - Configuration
 * 2 - Game
 * 3 - Instructions (Modal)
 * 4 - Highscore (Modal)
 */
var currPanel = 0;

var currInstructionBox = 1;

const configuration = {
    gameType: "ai",
    playerColor: "light",
    aiDifficulty: "easy",
}

window.onload = function() {
    hideOverlay();
    setupAuthentication();
    setupConfiguration();
    setupInstructions();
    setupHighScore();
}

function setupAuthentication() {
    let button = document.getElementById("auth-button");
    showPanel(0);

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

        switchPanel(2);
    }
}

function setupInstructions() {
    let instButton = document.getElementById("inst-button");
    let nextButton = document.getElementById("inst-next");
    let prevButton = document.getElementById("inst-prev");
    let closeButton = document.getElementById("close-button-inst");
    prevButton.style.display = "none";

    let instBox1 = document.getElementById("inst-box-1");
    let instBox2 = document.getElementById("inst-box-2");
    instBox2.style.display = "none";
    let instBox3 = document.getElementById("inst-box-3");
    instBox3.style.display = "none";

    instButton.onclick = function() {
        showPanel(3, true);
    }

    nextButton.onclick = function() {
        if (currInstructionBox == 1) {
            instBox1.style.display = "none";
            instBox2.style.display = "flex";
            prevButton.style.display = "block";
        } else {
            instBox2.style.display = "none";
            instBox3.style.display = "flex";
            nextButton.style.display = "none";
        }
        currInstructionBox++;
    }

    prevButton.onclick = function() {
        if (currInstructionBox == 2) {
            instBox2.style.display = "none";
            instBox1.style.display = "flex";
            prevButton.style.display = "none";
        } else {
            instBox3.style.display = "none";
            instBox2.style.display = "flex";
            nextButton.style.display = "block";
        }
        currInstructionBox--;
    }

    closeButton.onclick = function() {
        currInstructionBox = 1;
        instBox1.style.display = "flex";
        instBox2.style.display = "none";
        instBox3.style.display = "none";
        prevButton.style.display = "none";
        nextButton.style.display = "block";
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

function switchPanel(newPanel) {
    hidePanel(currPanel);
    showPanel(newPanel);
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
            return "high-score-box"
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
    new HighScore("Jesus", "0-0-0", 1000),
    new HighScore("Diogo", "13-7-13", -1000)
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