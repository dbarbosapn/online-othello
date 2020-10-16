/**
 * Panels:
 * 
 * 0 - Authentication
 * 1 - Configuration
 * 2 - Instructions 
 *      3 - Game Play
 *      4 - Valid Moves
 *      5 - End Game
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

        switchPanel(999);
    }
}

function setupInstructions() {
    let instButton = document.getElementById("inst-button");
    let nextButton = document.getElementById("inst-next");
    let prevButton = document.getElementById("inst-prev");

    instButton.onclick = function() {
        switchPanel(2);

        curInst = 3;
        showPanel(curInst);

        for (let i = 4; i < 6; i++)
            hidePanel(i);
    }

    nextButton.onclick = function() {
        nextInst();
    }

    prevButton.onclick = function() {
        prevInst();
    }

}

function curPanel() {
    return memPanel[memPanel.length - 1];
}

function switchPanel(newPanel) {
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
        case 3:
            return "inst-box-1";
        case 4:
            return "inst-box-2";
        case 5:
            return "inst-box-3";
    }

    return "";
}