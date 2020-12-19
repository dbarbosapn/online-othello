const Player = require("./Player");
const Game = require("./Game");
const db = require("./dbcontroller");
const crypto = require("crypto");

var waitingPlayer = null;
var timeout = null;

var players = {};

function joinGame(nick) {
	if (!players[nick]) 
		players[nick] = new Player(nick, db.read("users", nick));

	if (!waitingPlayer) {
		players[nick].joinGame(new Game(), true);
		waitingPlayer = players[nick];
	} 

	else {
		players[nick].joinGame(waitingPlayer.game, false);
		waitingPlayer = null;
	}

	return {
		game: players[nick].game.hash,
		color: players[nick].color,
	};
}

function play(data, response) {
	response.writeHead(200);

	if ( 
		checkValidUser(data.nick, data.pass, response) && 
		checkValidGame(data.nick, data.game, response) && 
		checkValidMove(data.nick, data.move, response) ) {
			response.end(JSON.stringify({}));
			players[data.nick].game.playPiece(data.move.row, data.move.column, data.nick);
		}

	else {
		response.end();
	}
}

function checkValidUser(nick, pass, response) {
	if ( !nick || !pass ) {
		response.write(JSON.stringify({ error: "Invalid request body." }));
		return false;
	}
	
	else if ( !players[nick] ) {
		response.write(JSON.stringify({ error: "Invalid request body." }));
		return false;
	}

	else {
		hashPass = crypto.createHash("md5").update(pass).digest("hex");

		if ( hashPass != players[nick].pass ) {
			response.write(JSON.stringify({ error: "User registered with a different password" }));
			return false;
		}
	}

	return true;
}

function checkValidGame(nick, gameHash, response) {
	if ( !players[nick].game || players[nick].game.hash != gameHash ) {
		response.write(JSON.stringify({error: "Game not found"}));
		return false;
	}

	return true;
}

function checkValidMove(nick, move, response) {
	let p = players[nick];

	if ( move === undefined ) {
		response.write(JSON.stringify({ error:"Invalid request body."}));
		return false;
	}

	if ( move === null && p.noMoves() ) { 
		response.write(JSON.stringify({}) );
		this.p.game.skip();
		return false;
	}

	else if ( move.row == undefined ) {
		response.write(JSON.stringify({ error: "move lacks property row" }));
		return false;
	}

	else if ( move.column == undefined ) {
		response.write(JSON.stringify({ error: "move lacks property column"}));
		return false;
	}

	else if ( move.row > 7 || move.row < 0 ) {
		response.write(JSON.stringify({ error:"row should be an integer between 0 and 7"}));
		return false;
	}

	else if ( move.column > 7 || move.column < 0 ) {
		response.write(JSON.stringify({ error:"column should be an integer between 0 and 7"}));
		return false;
	}

	else if ( !p.game.isCurrentPlayer(nick) ) {
		response.write(JSON.stringify({ error: "Not your turn to play"}));
		return false;
	}

	else if ( !p.game.validPossition(move.row, move.column, nick) ) {
		response.write(JSON.stringify({ error: "Invalid move"}));
		return false;
	}

	return true;
}

function leaveGame(nick) {
	console.log("Leave " + nick);
	if ( players[nick] && waitingPlayer && players[nick] == waitingPlayer.nick ) {
		waitingPlayer = null;
		stopTimeout();
	}

	else if ( players[nick] )
		players[nick].forfeit();
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
}

module.exports = { joinGame, leaveGame, setupUpdate, play };
