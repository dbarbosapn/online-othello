/**
 * Panels:
 * 
 * 0 - Authentication
 * 1 - Configuration
 */


// STATE
var curPanel = 0;
const configuration = {
    gameType: "ai",
    playerColor: "light",
    aiDifficulty: "easy",
}

window.onload = function () {
    setupAuthentication();
    setupConfiguration();
}

function setupAuthentication() {
    let button = document.getElementById("auth-button");

    button.onclick = function () {
        switchPanel(1);
    }
}

function setupConfiguration() {
    let button = document.getElementById("config-button");
    let vsAi = document.getElementById("vs-ai");
    let vsPlayer = document.getElementById("vs-player");
    let aiDifficultySection = document.getElementById("ai-difficulty-section");

    vsAi.onchange = function () {
        aiDifficultySection.style.display = "flex";
    }

    vsPlayer.onchange = function () {
        aiDifficultySection.style.display = "none";
    }

    button.onclick = function () {
        if (vsAi.checked) configuration.gameType = "ai";
        else configuration.gameType = "player";

        if (document.getElementById("color-light").checked) configuration.playerColor = "light";
        else configuration.playerColor = "dark";

        configuration.aiDifficulty = document.getElementById("ai-difficulty").value;

        console.log(configuration);
        switchPanel(2);
    }
}

function switchPanel(newPanel) {
    hidePanel(curPanel);
    showPanel(newPanel);
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
    }

    return "";
}