const Player = require("./Player");
const Game = require("./Game");
const db = require("./dbcontroller");
const crypto = require("crypto");

var waitingPlayer = null;
var timeout = null;

var players = {};

// Function controls how join game command is processed
// and return the reponse body
function joinGame(nick, response) {
	// Check if the player is not currently playing
	if (!players[nick]) players[nick] = new Player(nick, db.read("users", nick));
	else if (players[nick].game !== null) {
		response.writeHead(400);
		return { error: "User already in game" };
	}

	// Ok head
	response.writeHead(200);

	// Check if there is already a player waiting
	if (!waitingPlayer) {
		players[nick].joinGame(new Game(), true);
		waitingPlayer = players[nick];
		startTimeout();
	} else {
		players[nick].joinGame(waitingPlayer.game, false);
		waitingPlayer = null;
		stopTimeout();
	}

	return { game: players[nick].game.hash, color: players[nick].color };
}

// Function manages a notify i.e play piece/skip
// the response body will be writen in this function instead of returning something
// and will trigger an SSE
function play(data, response) {
	response.writeHead(200);

	// If play is valid
	if (
		checkValidUser(data.nick, data.pass, response) &&
		checkValidGame(data.nick, data.game, response) &&
		checkValidMove(data.nick, data.move, response)
	) {
		response.end(JSON.stringify({}));
		players[data.nick].game.playPiece(
			data.move.row,
			data.move.column,
			data.nick
		);

		// If some player, calculated implicitly with
		// the previous call, has won or lost then we call leaveGame
		// with the winner as the argument
		if (players[data.nick].game.gameIsFinished()) {
			this.leaveGame(data.nick, players[data.nick].game.getWinner());
		}
	}

	// Otherwise send error code, that was obtained in the previous
	// conditions checks. It does not call a SSE in this case
	else {
		response.end();
	}
}

// Return true if user and pass are valid
function checkValidUser(nick, pass, response) {
	if (!nick || !pass) {
		response.write(JSON.stringify({ error: "Invalid request body." }));
		return false;
	} else if (!players[nick]) {
		response.write(JSON.stringify({ error: "Invalid request body." }));
		return false;
	} else {
		hashPass = crypto.createHash("md5").update(pass).digest("hex");

		if (hashPass != players[nick].pass) {
			response.write(
				JSON.stringify({ error: "User registered with a different password" })
			);
			return false;
		}
	}

	return true;
}

// Return true if its a valid game, i.e game actually exists
function checkValidGame(nick, gameHash, response) {
	if (!players[nick].game || players[nick].game.hash != gameHash) {
		response.write(JSON.stringify({ error: "Game not found" }));
		return false;
	}

	return true;
}

// Return true if its a valid move. Moves must have certain standards
function checkValidMove(nick, move, response) {
	let p = players[nick];

	if (move === undefined) {
		response.write(JSON.stringify({ error: "Invalid request body." }));
		return false;
	}

	// move can be null, BUT only if the current player has no moves
	else if (move === null && p.noMoves()) {
		response.write(JSON.stringify({}));
		p.skip();
		return false;
	} else if (move.row == undefined) {
		response.write(JSON.stringify({ error: "Move lacks property 'row'" }));
		return false;
	} else if (move.column == undefined) {
		response.write(JSON.stringify({ error: "Move lacks property 'column'" }));
		return false;
	} else if (move.row > 7 || move.row < 0) {
		response.write(
			JSON.stringify({ error: "Row should be an integer between 0 and 7" })
		);
		return false;
	} else if (move.column > 7 || move.column < 0) {
		response.write(
			JSON.stringify({ error: "Column should be an integer between 0 and 7" })
		);
		return false;
	} else if (!p.isTurn()) {
		response.write(JSON.stringify({ error: "Not your turn to play" }));
		return false;
	} else if (!p.game.validPosition(move.row, move.column, nick)) {
		response.write(JSON.stringify({ error: "Invalid move" }));
		return false;
	}

	return true;
}

// Function manages how to leave a game
function leaveGame(nick, won = null) {
	// Checks if player is currently in game or lobby
	if (
		players[nick] &&
		waitingPlayer &&
		players[nick].nick === waitingPlayer.nick
	) {
		waitingPlayer.game = null;
		waitingPlayer = null;
		stopTimeout();
	}

	// won => UserName | tie
	else if (won != null) {
		players[nick].game.broadcastStatus(won);

		// Gets the players in nick's game
		let tempArr = players[nick].game.getPlayers();

		// Closes the game for all the player in nick's game
		tempArr.forEach((elem) => {
			elem.game = null;
		});
	}

	// Player is in game
	else if (players[nick]) {
		// Gets the players in nick's game
		let tempArr = players[nick].game.getPlayers();

		// Calls a forfeit
		players[nick].forfeit();

		// Closes the game for all the player in nick's game
		tempArr.forEach((elem) => {
			elem.game = null;
		});
	} else {
		console.log("Player not in a game: " + nick);
	}
}

function stopTimeout() {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}
}

function startTimeout() {
	stopTimeout();
	timeout = setTimeout(() => {
		waitingPlayer.forfeit();
		waitingPlayer = null;
	}, 2 * 60 * 1000);
}

// Deals with a SSE.
function setupUpdate(nick, hash, response) {
	response.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Access-Control-Allow-Origin": "*",
		Connection: "keep-alive",
	});
	response.write("retry: 10000\n"); // Setup retry every 10 seconds if something goes wrong

	if (
		!players[nick] ||
		!players[nick].game ||
		players[nick].game.hash !== hash
	) {
		response.write("id: 0\n");
		response.write(
			`data: ${JSON.stringify({
				error: "Invalid game reference",
			})}\n\n`
		);
	} else {
		players[nick].setUpdateResponse(response);
		players[nick].sendResponseData("{}");
	}
}

module.exports = { joinGame, leaveGame, setupUpdate, play };
