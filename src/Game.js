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

	addPlayer(player) {
		this.players.push(player);

		if (this.players.length == 2) {
			this.broadcastStatus();
			this._startClock();
		}
	}

	playerCount() {
		return this.players.length;
	}

	getPlayerColor(nick) {
		return this.players[0].nick == nick ? 1 : 2;
	}

	validPosition(row, col, nick) {
		return this.board.validPositionWithRowCol(
			row,
			col,
			this.getPlayerColor(nick)
		);
	}

	getCurrentPlayer() {
		return this.players[this.board.currentPlayer - 1];
	}

	isCurrentPlayer(nick) {
		return this.getCurrentPlayer().nick == nick;
	}

	playPiece(row, column, nick) {
		this.board = this.board.newPieceWithRowColumn(
			this.getPlayerColor(nick),
			row,
			column
		);
		this._startClock();

		if (!this.board) console.error("Failed to check if the play was valid.");

		this.broadcastStatus();
	}

	noMoves() {
		return this.board.noMove(this.board.currentPlayer);
	}

	skip() {
		this.board.changeOnSkip();
		this.broadcastStatus();
	}

	_startClock() {
		if (this.timeout !== null) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.getCurrentPlayer().forfeit();
		}, 2 * 60 * 1000);
	}

	finishGame(wc) {
		this.broadcastStatus(
			wc == "dark" ? this.players[0].nick : this.players[1].nick
		);
	}

	/**
	 * This function will also automatically start the game, when both players join.
	 */
	broadcastStatus(wc = null) {
		this.players.forEach((player) => {
			player.sendResponseData(JSON.stringify(this.getGameStatus(wc, player)));
		});
	}

	getGameStatus(win = null, player = null) {
		if (this.playerCount() !== 2) return {};
		else if (this.board.gameEnd() && player) {
			let win =
				this.board.dark > this.board.light
					? this.players[0].nick
					: this.board.dark < this.board.light
					? this.players[1].nick
					: null;
			this.hash = null;
			ranking.saveRanking(player.nick, win == player.nick ? 1 : 0);
			return { winner: win };
		} else if (win && player) {
			this.hash = null;
			ranking.saveRanking(player.nick, win == player.nick ? 1 : 0);
			return { winner: win };
		} else {
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
