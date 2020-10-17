/**
 * Panels:
 * 
 * 0 - Authentication
 * 1 - Configuration
 * 2 - Instructions 
 *      3 - Game Play
 *      4 - Valid Moves
 *      5 - End Game
 * 6 - HighScore
 */

var memPanel = [0];

var curInst = 3;

const configuration = {
    gameType: "ai",
    playerColor: "light",
    aiDifficulty: "easy",
}

window.onload = function() {
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

        switchPanel(999);
    }
}

function resetInstPage() {

    curInst = 3;
    showPanel(curInst);

    for (let i = 4; i < 6; i++)
        hidePanel(i);

}

function setupInstructions() {
    let instButton = document.getElementById("inst-button");
    let nextButton = document.getElementById("inst-next");
    let prevButton = document.getElementById("inst-prev");

    instButton.onclick = function() {
        switchPanel(2);
    }

    nextButton.onclick = function() {
        nextInst();
    }

    prevButton.onclick = function() {
        prevInst();
    }

}

function setupHighScore() {
    let backButton = document.getElementById("back-button-hs");
    let highScore = document.getElementById("highScore-button");
    let instButton = document.getElementById("inst-button-hs");

    displayHighScore();

    highScore.onclick = function() {
        switchPanel(6);
    }

    backButton.onclick = function() {
        switchPanelBack();
    }

    instButton.onclick = function() {
        switchPanel(2);
    }
}

function curPanel() {
    return memPanel[memPanel.length - 1];
}

/* A special case needed to be implemented when
    switching to page 2 aka Instructions manual.
    This happen because 3 4 and 5 are not panels 
    but text boxes. When we load panel nº 2 we 
    also load text box nº3, and this creates
    a confusion when backtracking. To resolve
    this problem, we choose not to keep track
    of 3,4 and 5 in memPanel, instead we use the actual
    number, meaning 4 comes after 3, 3 comes before 4 etc.. */
function switchPanel(newPanel) {
    if ( newPanel == 2 ) {
        curInst = 3;
        showPanel(curInst);

        for (let i = 4; i < 6; i++)
            hidePanel(i);
    }

    hidePanel(curPanel());
    showPanel(newPanel);
    memPanel.push(newPanel);
}

function switchPanelBack() {
    hidePanel(memPanel.pop());
    showPanel(curPanel());
}

/* Functions to traverse instruction manual. Next instruction page
    In case there is no next page we go back to the previous panel*/
function nextInst() {
    if (curInst < 5) {
        hidePanel(curInst);
        curInst += 1;
        showPanel(curInst);
    } else {
        curInst = 3;
        switchPanelBack();
    }
}

/* Previous instruction page. In case there is bo previous page
    we go to the previous panel*/
function prevInst() {
    if (curInst <= 3) {
        switchPanelBack();
        curInst = 3;
    } else {
        hidePanel(curInst);
        curInst -= 1;
        showPanel(curInst);
    }
}

function hidePanel(panel) {
    let boxName = getBoxName(panel);
    document.getElementById(boxName).style.display = "none";
}

function showPanel(panel) {
    let boxName = getBoxName(panel);
    document.getElementById(boxName).style.display = "flex";
}

function getBoxName(panel) {
    switch (panel) {
        case 0:
            return "ident-box";
        case 1:
            return "config-box";
        case 2:
            return "inst-box";
        /* START: Do not change this part. It will break the code */
        case 3:
            return "inst-box-1";
        case 4:
            return "inst-box-2";
        case 5:
            return "inst-box-3";
        /*END*/
        case 6:
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
var player = [new HighScore("Enio", "31-12-20", 69),
            new HighScore("Jesus", "0-0-0", 1000),
            new HighScore("Diogo", "13-7-13", -1000)];

/* Right now the following functions are just for
    testing the High Score panel. But i think we can
    use them when we actually want to have a real HS.
    The structure can also be usefull for implementing
    a message board or a command feedback*/            
function displayHighScore() {
    let content = "";
    player.sort((a, b) => a.score - b.score);
    player.forEach((player) => content += '<tr><td>' + player.name +'</td><td>' + player.date + '</td><td>' + player.score +'</td></tr>');
    document.getElementById("highScore-content").innerHTML = content;
}
function miniDisplayHighScore() {
    let content = "";
    player.sort((a, b) => a.score - b.score);

    for ( let i = 0; i<10 && i<player.length; i++ )
        content += '<tr><td>' + player[0].name + '</td></tr>'

    document.getElementById("mini-highScore-content").innerHTML = content;

}

