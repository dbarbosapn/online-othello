const Player = require("./Player");
const Game = require("./Game");

var waitingPlayer = null;
var timeout = null;

var players = {};

function joinGame(nick) {
	if (!players[nick]) players[nick] = new Player(nick);

	if (!waitingPlayer) {
		let game = new Game();

		waitingPlayer = players[nick];

		stopTimeout();
		timeout = setTimeout(() => {
			waitingPlayer.forfeit();
			waitingPlayer = null;
		}, 2 * 60 * 1000); // 2 minutes timeout

		waitingPlayer.joinGame(game);
	} else if (!players[nick].inGame()) {
		players[nick].joinGame(waitingPlayer.game);
		stopTimeout();
		waitingPlayer = null;
	}

	return {
		game: players[nick].game.hash,
		color: players[nick].color,
	};
}

function leaveGame(nick) {
	players[nick].forfeit();

	if (nick === waitingPlayer.nick) {
		waitingPlayer = null;
		stopTimeout();
	}
}

function stopTimeout() {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}
}

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

	return true;
}

module.exports = { joinGame, leaveGame, setupUpdate };
