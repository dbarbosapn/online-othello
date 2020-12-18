const crypto = require("crypto");
const Board = require("../Board");

module.exports = class Game {
	constructor() {
		let d = new Date();
		this.hash = crypto.createHash("md5").update(d.toString()).digest("hex");
		this.players = [];
		this.board = new Board();
	}

	addPlayer(player) {
		if (this.playerCount() >= 2) return null;

		this.players.push(player);

		this.broadcastStatus();

		if (this.playerCount() == 0) return "dark";
		else return "light";
	}

	playerCount() {
		return this.players.length;
	}

	finishGame(winningColor) {
		// finish game
	}

	getCurrentPlayer() {
		return this.players[this.board.currentPlayer - 1];
	}

	/**
	 * This function will also automatically start the game, when both players join.
	 */
	broadcastStatus() {
		this.players.forEach((player) => {
			player.sendResponseData(JSON.stringify(this.getGameStatus()));
		});
	}

	/**
	 * TODO: This function should receive a player as argument and send skip, if he can skip etc.
	 */
	getGameStatus() {
		if (this.playerCount() !== 2) return {};
		return {
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
	}
};
