module.exports = class Player {
	constructor(nick, pass) {
		this.nick = nick;
		this.pass = pass;
		this.game = null;
		this._updateResponse = null;
		this.color = null;
	}

	// Checks if the player is playing a game
	inGame() {
		return this.game !== null && this.game.players.length === 2;
	}

	// game -> game reference
	// first -> If players was the first or second to join the game. This will be used
	//          to give colors to the players
	joinGame(game, first) {
		this.game = game;
		this.color = first ? "dark" : "light";

		// Method will add this player to the game
		game.addPlayer(this);
	}

	skip() {
		this.game.skip();
	}

	isTurn() {
		return this.game.isCurrentPlayer(this.nick);
	}

	noMoves() {
		return this.game.noMoves();
	}

	// This user will forfeit its game
	forfeit() {
		if (this.game) this.game.forfeit(this);
	}

	// Return a string with the oponnents color
	_oppositeColor() {
		return this.color === "dark" ? "light" : "dark";
	}

	// Saves the channel of server->client in _updateResponse
	// to later be used to send SSE
	setUpdateResponse(response) {
		this._updateResponse = response;

		if (this.game)
			this.sendResponseData(JSON.stringify(this.game.getGameStatus()));
	}

	// Send data in the proper way to SSE channel
	sendResponseData(data) {
		if (!this._updateResponse) return;
		let date = new Date();
		let id = date.getTime(); // unique id based on time (ms since epoch)
		this._updateResponse.write(`id: ${id}\n`);
		this._updateResponse.write(`data: ${data}\n\n`);
	}
};
