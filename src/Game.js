const crypto = require("crypto");
const { invertType } = require("./Board");
const Board = require("./Board");

module.exports = class Game {
	constructor() {
		let d = new Date();
		this.hash = crypto.createHash("md5").update(d.toString()).digest("hex");
		this.players = [];
		this.board = new Board();
	}

	addPlayer(player) {
		this.players.push(player);
		
		if ( this.players.length == 2 )
			this.broadcastStatus();
	}

	playerCount() {
		return this.players.length;
	}

	getPlayerColor(nick) {
		return this.players[0].nick == nick ? 1: 2
	}

	validPossition(row, col, nick) {
		return this.board.validPositionWithRowCol(row, col, this.getPlayerColor(nick));
	}

	getCurrentPlayer() {
		return this.players[this.board.currentPlayer - 1];
	}

	isCurrentPlayer(nick) {
		return this.getCurrentPlayer().nick == nick;
	}

	playPiece(row, column, nick) {
		console.log("ASSSSSSSSSSSSSSSSSSSSSSS");
		this.board = this.board.newPieceWithRowColumn(this.getPlayerColor(nick), row, column);

		if ( !this.board )
			console.log("Falhou ao ver se a jogada era valida e tentou se jogala");

		console.log(this.board.toString());

		this.broadcastStatus();
	}

	noMoves() {
		return this.board.noMove(this.getCurrentPlayer());
	}

	skip() {
		this.board.changeOnSkip();
		this.broadcastStatus();
	}

	finishGame(wc) {
		this.broadcastStatus(wc == "dark" ? this.players[0].nick : this.players[1].nick);
	}
	/**
	 * This function will also automatically start the game, when both players join.
	 */
	broadcastStatus(wc = null) {
		console.log(wc);
		this.players.forEach((player) => {
			player.sendResponseData(JSON.stringify(this.getGameStatus(wc)));
		});
	}

	getGameStatus(win = null) {
		console.log(win);
		if (this.playerCount() !== 2) 
			return {};

		else if ( this.board.gameEnd() ) {
			let win = this.board.dark > this.board.ligth ? this.players[0].nick : (this.board.dark < this.board.ligth ? this.players[1].nick: null);
			this.hash = null;
			return {winner: win}
		}

		else if ( win ) {
			this.hash = null;
			return {winner: win};
		}

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

			if ( !this.board.getPossibleMoves(this.getCurrentPlayer()) ) {
				body.skip = true;
			}

			return body;

		}
	}
};
