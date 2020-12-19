module.exports = class Player {
	constructor(nick, pass) {
		this.nick = nick;
		this.pass = pass;
		this.game = null;
		this._updateResponse = null;
		this.color = null;
	}

	inGame() {
		return this.game !== null;
	}

	joinGame(game, first) {
		this.game = game;
		this.color = first ? "dark": "ligth";
		game.addPlayer(this);
	}

	forfeit() {
		if (this.inGame()) {
			this.game.finishGame(this._oppositeColor());
		}

		this.game = null;
	}

	_oppositeColor() {
		return this.color === "dark" ? "white" : "dark";
	}

	setUpdateResponse(response) {
		this._updateResponse = response;
		if (this.game)
			this.sendResponseData(JSON.stringify(this.game.getGameStatus()));
	}

	sendResponseData(data) {
		if (!this._updateResponse) return;
		let date = new Date();
		let id = date.getTime(); // unique id based on time (ms since epoch)
		this._updateResponse.write(`id: ${id}\n`);
		this._updateResponse.write(`data: ${data}\n\n`);
	}
};
