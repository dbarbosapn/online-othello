/**
 * Panels:
 *
 * 0 - Authentication
 * 1 - Configuration
 * 2 - Game
 * 3 - Instructions (Modal)
 * 4 - Highscore (Modal)
 * 5 - Confirmation (Modal)
 * 6 - Waiting for Opponent (Modal)
 */

class UI {
	constructor(client) {
		this.currPanel = 0;

		this.configuration = {
			gameType: "ai",
			playerColor: 0,
			aiDifficulty: "easy",
		};

		this.client = client;

		this.hideOverlay();
		this.setupAuthentication();
		this.setupConfiguration();
		this.setupInstructions();
		this.setupHighScore();
		this.setupGame();

		this._showPanel(this.currPanel);
	}

	setupAuthentication() {
		let button = document.getElementById("auth-button");
		let username = document.getElementById("username");
		let password = document.getElementById("userpass");

		button.onclick = () =>
			this.client.authenticate(username.value, password.value);
	}

	showAuthentication() {
		this._switchPanel(0);
	}

	showConfiguration() {
		this._switchPanel(1);
	}

	setupConfiguration() {
		let button = document.getElementById("config-button");
		let vsAi = document.getElementById("vs-ai");
		let vsPlayer = document.getElementById("vs-player");
		let aiDifficultySection = document.getElementById("ai-difficulty-section");
		let playerShit = document.getElementById("player-shit");
		let cancelSearch = document.getElementById("cancel-search");

		vsAi.onchange = function () {
			aiDifficultySection.style.display = "flex";
			playerShit.style.display = "flex";
		};

		vsPlayer.onchange = function () {
			aiDifficultySection.style.display = "none";
			playerShit.style.display = "none";
		};

		button.onclick = () => {
			if (vsAi.checked) this.configuration.gameType = "ai";
			else {
				this.configuration.gameType = "player";
				this.client.findOpponent();
				return;
			}

			if (document.getElementById("color-light").checked)
				this.configuration.playerColor = 2;
			else this.configuration.playerColor = 1;

			this.configuration.aiDifficulty = document.getElementById(
				"ai-difficulty"
			).value;

			let depth = 0;
			switch (this.configuration.aiDifficulty) {
				case "easy":
					depth = 1;
					break;
				case "moderate":
					depth = 2;
					break;
				case "hard":
					depth = 3;
					break;
				case "hardcore":
					depth = 4;
					break;
			}

			this.client.playOffline(
				depth,
				this.configuration.playerColor == 1 ? 2 : 1
			);
		};

		cancelSearch.onclick = () => {
			this.client.leave();
			this.stopWaiting(false);
		};
	}

	waitForOpponent() {
		this._showPanel(6, true);
		this.waiting = true;
	}

	stopWaiting(showError) {
		this._hidePanel(6, true);
		this.waiting = false;
		if (showError) this.showGameAlert("Error joining game");
	}

	isWaiting() {
		return this.waiting;
	}

	startGame() {
		this.stopWaiting(false);
		this._switchPanel(2);
	}

	setupInstructions() {
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
			for (let i = instFirstPage; i <= instLastPage; i++) {
				instBox[i] = document.getElementById("inst-box-" + i);
			}
		}

		trackInstBox();

		/* Funtion to remove all pages from the screen */
		function resetPages() {
			for (let i = instFirstPage; i <= instLastPage; i++) {
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
		instButton.onclick = () => {
			this._showPanel(3, true);
		};

		nextButton.onclick = () => {
			instCurPage++;
			instSwitchPage(instCurPage);
		};

		prevButton.onclick = () => {
			instCurPage--;
			instSwitchPage(instCurPage);
		};

		closeButton.onclick = () => {
			instCurPage = instFirstPage;
			instSwitchPage(instFirstPage);
			this._hidePanel(3, true);
		};
	}

	setupHighScore() {
		let closeButton = document.getElementById("close-button-hs");
		let highScore = document.getElementById("highScore-button");

		highScore.onclick = () => {
			this.client.ranking();
		};

		closeButton.onclick = () => {
			document.getElementById("won-text").style.display = "none";
			document.getElementById("lost-text").style.display = "none";
			document.getElementById("tie-text").style.display = "none";
			this._hidePanel(4, true);
		};
	}

	setupBoard() {
		let board = document.getElementById("board");

		board.innerHTML = "";

		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				let cell = document.createElement("div");
				cell.className = "cell";
				cell.id = `cell-${i}-${j}`;

				let piece = document.createElement("div");
				piece.className = "piece";
				piece.classList.add("empty");

				cell.appendChild(piece);

				cell.onclick = () => {
					this.client.playerTurn(new Point(i, j));
				};

				board.appendChild(cell);
			}
		}
	}

	processBoard(board) {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				this.setPiece(i, j, board.getPieceName(new Point(i, j)));
			}
		}

		document.getElementById("dark-pieces").innerText = board.dark;
		document.getElementById("light-pieces").innerText = board.light;
		document.getElementById("empty-cells").innerText =
			board.size * board.size - board.light - board.dark;
	}

	showSkip() {
		let skip = document.getElementById("skip-icon");

		skip.style.display = "block";
	}

	hideSkip() {
		let skip = document.getElementById("skip-icon");

		skip.style.display = "none";
	}

	setPiece(i, j, type) {
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

	setupGame() {
		let manual = document.getElementById("manual-icon");
		let ranking = document.getElementById("ranking-icon");
		let forfeit = document.getElementById("forfeit-flag");
		let skip = document.getElementById("skip-icon");

		manual.onclick = () => {
			this._showPanel(3, true);
		};

		ranking.onclick = () => {
			if (this.client.matchId == null) this.client.aiRanking();
			else this.client.ranking();
		};

		forfeit.onclick = () => {
			this.showConfirmationDialog(
				"Forfeit",
				"Are you sure you want to forfeit?"
			);
		};

		forfeit.style.display = "block";

		skip.onclick = () => this.client.skip();

		skip.style.display = "none";
	}

	outputMessage(type, msg) {
		let ref = document.getElementById("msg-box");

		let className = null;

		/* Defining the class to be used in newElem */
		switch (type) {
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

		this.addTextElement(ref, "p", msg, className).scrollIntoView(true);
	}

	addTextElement(reference, whatType, msg, whatClass = null) {
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

	showGameAlert(str, permanent = false) {
		let display = document.getElementById("game-alert");

		let newElem = this.addTextElement(display, "h1", str);

		if (!permanent) {
			setTimeout(function () {
				newElem.remove();
			}, 1000);
		}
	}

	hideGameAlerts() {
		let display = document.getElementById("game-alert");

		display.innerHTML = "";
	}

	showGame() {
		this._switchPanel(2);
	}

	_switchPanel(newPanel) {
		this._hidePanel(this.currPanel);
		this._showPanel(newPanel);
		this.currPanel = newPanel;
	}

	_hidePanel(panel, modal = false) {
		let boxName = this.getBoxName(panel);
		document.getElementById(boxName).style.display = "none";

		if (modal) {
			this.hideOverlay();
		}
	}

	_showPanel(panel, modal = false) {
		let boxName = this.getBoxName(panel);
		document.getElementById(boxName).style.display = "flex";

		if (modal) {
			this.showOverlay();
		}
	}

	hideOverlay() {
		document.getElementById("dark-overlay").style.display = "none";
	}

	showOverlay() {
		document.getElementById("dark-overlay").style.display = "block";
	}

	getBoxName(panel) {
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
			case 6:
				return "wait-opponent";
		}

		return "";
	}

	displayScores(scores) {
		let content = "";

		scores.forEach(
			(score) =>
				(content +=
					"<tr><td>" +
					score.nick +
					"</td><td>" +
					score.victories +
					"</td><td>" +
					score.games +
					"</td></tr>")
		);
		document.getElementById("highscore-content").innerHTML = content;

		this._showPanel(4, true);
	}

	showConfirmationDialog(title, content) {
		document.getElementById("dialog-title").innerText = title;
		document.getElementById("dialog-content").innerText = content;

		document.getElementById("cancel-button").onclick = () => {
			this._hidePanel(5, true);
			document.getElementById("forfeit-flag").display = "block";
		};

		document.getElementById("confirm-button").onclick = () => {
			this._hidePanel(5, true);
			this.client.forfeit();
		};

		this._showPanel(5, true);
	}

	getTypeId(type) {
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

	wonFinish() {
		document.getElementById("won-text").style.display = "inline";
	}

	lostFinish() {
		document.getElementById("lost-text").style.display = "inline";
	}

	tiedFinish() {
		document.getElementById("tie-text").style.display = "inline";
	}
}
