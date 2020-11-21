class Client {
	constructor() {
		this.name = null;
		this.pass = null;

		/* Replace with our group number */
		this.group = 999;

		/* Server name */
		this.server = "http://twserver.alunos.dcc.fc.up.pt:8008/";

		/* Game Hash Code */
		this.gameCode = null;

		/* Game piece color */
		this.color = null;

		/* Server Source */
		this.eventSource = null;

		this.inter = new Interface(this);
	}

	executeCommandRegister() {
		this.executeCommand(this.server + "register", {
			nick: this.name,
			pass: this.pass,
		})
			.then((data) => {
				this.checkConnectionResponse(data);
			})
			.catch((data) => {
				console.log(data);
				this.connectionFail();
			});
	}

	tryConnecting(userName, userPass) {
		this.name = userName;
		this.pass = userPass;

		this.executeCommandRegister();
	}

	checkConnectionResponse(data) {
		if ("error" in data) this.connectionFail();
		else this.inter.connectSuccessInterface();
	}

	connectionFail() {
		console.log("Connection failed: User=" + this.name + " pass=" + this.pass);
		this.name = null;
		this.pass = null;

		this.inter.connectFailInterface();
	}

	executeCommandJoin() {
		this.executeCommand(this.server + "join", {
			group: this.group,
			nick: this.name,
			pass: this.pass,
		})
			.then((data) => {
				this.gameCode = data.game;
				this.color = data.color;
				this.listenToServer();
				console.log(data);
			})
			.catch(console.log);
	}

	findOpponent() {
		this.inter.findOpponentInterface();

		this.executeCommandJoin();
	}

	listenToServer() {
		if (this.eventSource != null) this.ignoreServer();

		let url =
			this.server + "update?nick=" + this.name + "&game=" + this.gameCode;
		console.log(url);
		this.eventSource = new EventSource(url);

		this.eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log(data);

			if (this.inter.currPanel == 7 && data.board != undefined)
				this.inter.foundOpponetInterface();
		};
	}

	executeCommandLeave() {
		this.executeCommand(this.server + "leave", {
			nick: this.name,
			pass: this.pass,
			game: this.gameCode,
		})
			.then((data) => {
				this.gameCode = null;
				this.color = null;
				this.ignoreServer();
			})
			.catch(console.log);
	}

	forfeit() {
		if (this.aiGame != null) this.aiGame.forfeit();
		else {
			this.executeCommandLeave();
		}
	}

	ignoreServer() {
		this.eventSource.close();
		this.eventSource = null;
	}

	executeCommandRanking() {
		this.executeCommand(this.server + "ranking")
			.then((data) => console.log(data))
			.catch(console.log);
	}

	executeCommandNotify(move) {
		this.executeCommand(this.server + "notify", {
			nick: this.name,
			pass: this.pass,
			game: this.gameCode,
			move: move,
		})
			.then((data) => validatePlay(data))
			.catch(console.log);
	}

	playOffline(depth, color) {
		this.aiGame = new AiGame(depth, color, this.inter);
	}

	playerTurn(point) {
		if (this.aiGame != null) {
			this.aiGame.playerTurn(point);

			this.aiGame.checkPlayerStuck();
		}
	}

	async executeCommand(url, content = {}) {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(content),
		});

		return response.json();
	}
}

window.onload = function () {
	const client = new Client("test123", "test123");
};
