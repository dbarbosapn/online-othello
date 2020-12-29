const crypto = require("crypto");
const Board = require("./Board");
const ranking = require("./ranking");

module.exports = class Game {
	constructor() {
		let d = new Date();
		this.hash = crypto.createHash("md5").update(d.toString()).digest("hex");
		this.players = [];
		this.board = new Board();

		this.timeout = null;
	}

	// Ads a player to the game
	addPlayer(player) {
		this.players.push(player);

		console.log("Number of players " + this.players.length);

		if (this.players.length == 2) {
			this.broadcastStatus();
			this._startClock();
		}
	}

	// Return true if (row, col) are a valid possition
	validPosition(row, col, nick) {
		return this.board.validPositionWithRowCol(
			row,
			col,
			this.getPlayerColor(nick)
		);
	}

	// Return the number of player currently in the game
	playerCount() {
		return this.players.length;
	}

	// Return the color associated with nick(username)
	getPlayerColor(nick) {
		return this.players[0].nick == nick ? 1 : 2;
	}

	// Return the object for the current player
	getCurrentPlayer() {
		return this.players[this.board.currentPlayer - 1];
	}

	getWinner() {
		let dark = this.board.dark;
		let ligth = this.board.light;

		return dark > ligth
			? this.players[0].nick
			: ligth > dark
			? this.players[1].nick
			: "tie";
	}

	// Return true if nick is the current player
	isCurrentPlayer(nick) {
		return this.getCurrentPlayer().nick == nick;
	}

	// Returns the "pointer" for all of the players present in the game
	getPlayers() {
		return this.players;
	}

	// This function will play a piece given by 2 coordinates.
	// It does not check if it's possible to actually play it
	playPiece(row, column, nick) {
		this.board = this.board.newPieceWithRowColumn(
			this.getPlayerColor(nick),
			row,
			column
		);

		// Starts the clock for the next player
		this._startClock();

		if (!this.board) console.error("Failed to check if the play was valid.");

		this.broadcastStatus();
	}

	gameIsFinished() {
		return this.board.gameEnd();
	}

	// Return a true if the current player has no moves
	noMoves() {
		return this.board.noMove(this.board.currentPlayer);
	}

	// Do skip, but it does not check if it actually can. That is the work
	// to be done in gameController
	skip() {
		this.board.changeOnSkip();
		this.broadcastStatus();
	}

	_startClock() {
		if (this.timeout !== null) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.getCurrentPlayer().forfeit();
		}, 60 * 2 * 1000);
	}

	// Argument is the player that wants to forfeit
	forfeit(player) {
		this.broadcastStatus(
			player == this.players[0] ? this.players[1].nick : this.players[0].nick
		);
	}

	// Function will broadcast the game status for all current players
	broadcastStatus(won = null) {
		this.players.forEach((player) => {
			player.sendResponseData(JSON.stringify(this.getGameStatus(player, won)));
		});
	}

	// Function generates a js object with the body of the message that will be sent
	// and returns it.
	getGameStatus(player, won = null) {
		// Game hasn't started
		if (this.playerCount() !== 2) return {};
		// Game has a winner
		else if (won != null) {
			ranking.saveRanking(player.nick, player.nick === won.nick ? true : false);
			return { winner: won };
		}

		// Game was changed
		else {
			let body = {
				board: this.board.getMatrix(),
				turn: this.getCurrentPlayer().nick,
				count: {
					dark: this.board.dark,
					light: this.board.light,
					empty:
						this.board.size * this.board.size -
						this.board.dark -
						this.board.light,
				},
			};

			// If skip is possible i.e no possible moves from current player
			if (
				player &&
				player.nick === this.getCurrentPlayer().nick &&
				this.noMoves()
			) {
				body.skip = true;
			}

			return body;
		}
	}
};
