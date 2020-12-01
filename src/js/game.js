class Point {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	/* Add point and return a new added point */
	addPoint(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}

	toString() {
		return "(" + this.x + "," + this.y + ")";
	}

	toArrayIndex(size) {
		return this.y * size + this.x;
	}
}

/*  Type
    0 = empty
    1 = dark
    2 = light */
class Board {
	constructor(size = 8, state = null, currentPlayer = 1, dark = 0, light = 0) {
		this.dark = dark;
		this.light = light;
		this.currentPlayer = currentPlayer;

		this.size = size;
		this.state = [];

		if (!state) {
			this.startState();
		} else {
			this.state = [...state];
		}
	}

	updateWithMatrix(board) {
		this.dark = 0;
		this.light = 0;

		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				let point = new Point(i, j);
				let type = this.getPieceType(board[i][j]);
				this.state[point.toArrayIndex(this.size)] = type;

				if (type === 1) this.dark++;
				else if (type === 2) this.light++;
			}
		}
	}

	score(type) {
		return type === 1 ? this.dark : this.light;
	}

	/* Clones the current board and returns a new one, with the exact same elements */
	cloneBoard() {
		return new Board(
			this.size,
			this.state,
			this.currentPlayer,
			this.dark,
			this.light
		);
	}

	/* This method initiates the board with four pieces in the middle, 2 white and 2 black */
	startState() {
		for (let i = 0; i < this.size * this.size; i++) this.state[i] = 0;

		let middle = this.size / 2;
		let point = new Point(middle - 1, middle - 1);

		this.addPiece(1, point);
		this.addPiece(1, point.addPoint(new Point(1, 1)));
		this.addPiece(2, point.addPoint(new Point(0, 1)));
		this.addPiece(2, point.addPoint(new Point(1, 0)));
	}

	/* This method adds a piece in possition "point". It does not check
        if it's occupied. It does however increse the counter of light and dark pieces */
	addPiece(type, point) {
		if (type === 1) {
			this.dark++;
		} else if (type === 2) {
			this.light++;
		}

		this.state[point.toArrayIndex(this.size)] = type;
	}

	/*  This method removes a piece in possition "point". It does not check
        if it's occupied. It does however decrease the counter of light and dark pieces */
	removePiece(point) {
		let type = this.getPiece(point);

		if (type === 1) {
			this.dark--;
		} else if (type === 2) {
			this.light--;
		}

		this.state[point.toArrayIndex(this.size)] = 0;
	}

	/* As the name suggests, it inverts the type of a piece. 
        Example: dark -> light, empty -> empty, light -> dark*/
	static invertType(type) {
		switch (type) {
			case 1:
				return 2;
			case 2:
				return 1;
			default:
				return 0;
		}
	}

	/* Get the type of the piece in position "point". Be careful with going out of bounds
        because this methods does not check it */
	getPiece(point) {
		if (this.state.length === 0) return 0;
		else return this.state[point.toArrayIndex(this.size)];
	}

	getPieceName(point) {
		switch (this.getPiece(point)) {
			case 0:
				return "empty";
			case 1:
				return "dark";
			case 2:
				return "light";
		}
	}

	getPieceType(name) {
		switch (name) {
			case "empty":
				return 0;
			case "dark":
				return 1;
			case "light":
				return 2;
		}
	}

	/* Returns true if "point" is inside of the board*/
	insideBoard(point) {
		return (
			point.x >= 0 && point.x < this.size && point.y >= 0 && point.y < this.size
		);
	}

	/* This method will return true if the piece in position "point" has the same 
        color as "type"*/
	inRange(type, point) {
		return this.insideBoard(point) && this.getPiece(point) == type;
	}

	/* This method returns an array of pieces(points) to be flipped in a GIVEN 
        direction "vec"(vector). In case there isn't, it will return [] */
	getArrayOfPieces(type, point, vec) {
		let arr = [];
		let p = point.addPoint(vec);

		for (; this.inRange(type, p); p = p.addPoint(vec)) {
			arr.push(p);
		}

		if (this.insideBoard(p) && this.getPiece(p) == Board.invertType(type)) {
			return arr;
		} else {
			return [];
		}
	}

	/* Get all the flippable pieces from all directions */
	getAllFlippablePieces(type, point) {
		let arr = [];
		let type1 = Board.invertType(type);

		[-1, 1].forEach((i) => {
			arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i, 0)));
			arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(0, i)));
			arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i, i)));
			arr = arr.concat(this.getArrayOfPieces(type1, point, new Point(i, -i)));
		});

		return arr;
	}

	/* Flip a piece to color "type". It does not check if it exists */
	flipPiece(point, type) {
		this.removePiece(point);
		this.addPiece(type, point);
	}

	/* Method will find and flip all possible pieces*/
	flipAllPieces(type, point) {
		let arr = this.getAllFlippablePieces(type, point);

		arr.forEach((point) => this.flipPiece(point, type));
	}

	/* This method returns True if a position is valid i.e the point is inside of the board and 
        the piece will flip some piece of the adversary. When I mean adversary, am referring 
        to pieces that have an inverse color to "type" */
	validPosition(point, type) {
		return (
			this.insideBoard(point) &&
			this.getPiece(point) === 0 &&
			this.getAllFlippablePieces(type, point).length > 0
		);
	}

	/* This method will clone the current board, then will flip the piece in "point" and flip
        all possible pieces that follows. It case of fail it will return null */
	newPiece(type, point) {
		if (!this.validPosition(point, type)) {
			return null;
		}

		let newBoard = this.cloneBoard();

		newBoard.flipPiece(point, type);

		newBoard.flipAllPieces(type, point);

		newBoard.currentPlayer = Board.invertType(type);

		return newBoard;
	}

	getPossibleMoves(type) {
		let moves = [];
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (this.validPosition(new Point(i, j), type)) {
					moves.push(this.newPiece(type, new Point(i, j)));
				}
			}
		}

		return moves;
	}

	noMove(type) {
		return this.getPossibleMoves(type).length == 0;
	}

	gameEnd() {
		return (
			this.dark + this.light == 8 * 8 ||
			this.dark == 0 ||
			this.light == 0 ||
			(this.noMove(this.currentPlayer) &&
				this.noMove(this.currentPlayer === 1 ? 2 : 1))
		);
	}

	forfeit() {
		this.client.leave();
	}
}

class OnlineGame {
	constructor(color, ui, client) {
		this.playerColor = color;
		this.ui = ui;

		this.currentBoard = new Board();

		this.client = client;

		this.ui.setupBoard();
		this.ui.showGame();
		this.startGame();
	}

	startGame() {
		this.ui.processBoard(this.currentBoard);

		if (this.playerColor === 1) {
			this.ui.showGameAlert("Your turn!");
		}
	}

	update(play, board) {
		console.log("Updating board...");
		this.currentBoard.updateWithMatrix(board);
		this.currentBoard.currentPlayer = play
			? this.playerColor
			: Board.invertType(this.playerColor);

		if (play) this.ui.showGameAlert("Your turn!");

		this.ui.processBoard(this.currentBoard);
	}

	playerTurn(point) {
		this.client
			.notify({
				row: point.x,
				column: point.y,
			})
			.then((res) => {
				if ("error" in res) {
					console.log(res.error);

					this.checkPossibleErrors(res.error);
				}
			})
			.catch((err) => {
				console.log(err);
				this.ui.outputMessage("error", "An unknown error occurred.");
			});
	}

	checkPossibleErrors(error) {
		// Note: Should be careful with encoding
		if (error === "Not your turn to play")
			this.ui.outputMessage("info", "Wait for your turn, please.");
		else if (error.includes("Nenhuma") || error.includes("preenchida"))
			this.ui.outputMessage("error", "Invalid move");
		else this.ui.outputMessage("warning", "Something went wrong. Try again");
	}

	endGame(winner) {
		if (winner == null) this.ui.tiedFinish();
		else if (winner === this.client.name) this.ui.wonFinish();
		else this.ui.lostFinish();

		// Go back to configuration
		this.ui.showConfiguration();

		// Show highscores
		this.client.ranking(true);
	}

	forfeit() {
		this.client.leave();
	}
}

class AiGame {
	constructor(depth, color, ui, client) {
		this.aiColor = color;
		this.playerColor = color === 1 ? 2 : 1;
		this.ui = ui;
		this.client = client;

		/* Initialization of the board */
		this.currentBoard = new Board();

		this.aiPlayer = new AIPlayer(depth, color);
		this.ui.setupBoard();
		this.ui.showGame();
		this.startGame();
	}

	startGame() {
		this.ui.processBoard(this.currentBoard);

		/* If ai is dark => start. */
		if (this.aiColor === 1) {
			this.aiTurn();
		} else {
			this.ui.showGameAlert("Your turn!");
		}
	}

	playerTurn(point) {
		if (this.aiColor === this.currentBoard.currentPlayer) {
			this.ui.outputMessage("info", "Wait for your turn, please.");
			return;
		}

		let newBoard = this.currentBoard.newPiece(this.playerColor, point);

		if (newBoard) {
			this.currentBoard = newBoard;
			this.ui.processBoard(this.currentBoard);
			this.aiTurn();
		} else {
			this.ui.outputMessage("error", "Invalid move");
		}

		this.checkPlayerStuck();
	}

	aiTurn() {
		setTimeout(() => {
			if (this.checkStuck(this.currentBoard.currentPlayer)) {
				// AI passes the turn
				this.currentBoard.currentPlayer = Board.invertType(
					this.currentBoard.currentPlayer
				);
				return;
			}

			let newBoard = this.aiPlayer.calculateNextMove(this.currentBoard);
			if (newBoard) {
				this.currentBoard = newBoard;
				this.ui.processBoard(this.currentBoard);
				this.ui.resetButtonVisibility();

				this.ui.showGameAlert("Your turn!");
			}
		}, 1500);
	}

	/* Function checks if a player of type "type" is stuck, i.e 
        the game has ended or no possible moves */
	checkStuck(type) {
		if (this.currentBoard.gameEnd()) {
			this.endGame();
			return false;
		} else if (this.currentBoard.noMove(type)) {
			if (this.currentBoard.currentPlayer === this.playerColor)
				this.ui.verifyButtonVisibility();
			else this.ui.showGameAlert("Your turn!");
			return true;
		}

		return false;
	}

	/* Function checks if player is stuck */
	checkPlayerStuck() {
		return this.checkStuck(this.playerColor);
	}

	noMovesMessage(type) {
		this.ui.outputMessage(
			"warning",
			"Your opponent has no moves. It's your turn again"
		);
	}

	/* Change highScore */
	endGame() {
		let playerScore = this.currentBoard.score(this.playerColor);
		let aiScore = this.currentBoard.score(this.playerColor == 1 ? 2 : 1);

		// We separate the scores because a player can also login with the name "Computer"
		let scores = localStorage.getItem("local-scores");
		if (scores === null) scores = JSON.stringify({});
		scores = JSON.parse(scores);

		let computerScore = localStorage.getItem("computer-score");
		if (computerScore === null) {
			computerScore = JSON.stringify({
				nick: "Computer",
				victories: 0,
				games: 0,
			});
		}
		computerScore = JSON.parse(computerScore);
		let playerName = this.client.name;

		if (!(playerName in scores)) {
			scores[playerName] = {
				nick: playerName,
				victories: 0,
				games: 0,
			};
		}

		scores[playerName].games++;
		computerScore.games++;

		if (playerScore > aiScore) {
			this.ui.wonFinish();
			scores[playerName].victories++;
		} else if (playerScore < aiScore) {
			this.ui.lostFinish();
			computerScore.victories++;
		} else {
			this.ui.tiedFinish();
		}

		// Go back to configuration
		this.ui.showConfiguration();

		// Update local scores
		localStorage.setItem("local-scores", JSON.stringify(scores));
		localStorage.setItem("computer-score", JSON.stringify(computerScore));

		// Show highscores
		this.client.aiRanking();
	}

	forfeit() {
		this.currentBoard = new Board();
		if (this.currentPlayer === 2) {
			this.currentBoard.light = 64;
			this.currentBoard.dark = 0;
		} else {
			this.currentBoard.light = 0;
			this.currentBoard.dark = 64;
		}

		this.endGame();
	}
}
