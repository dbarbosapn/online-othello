class Client {
	constructor(group) {
		this.name = null;
		this.pass = null;

		/* Replace with our group number */
		this.group = group;

		/* Server name */
		this.serverURL = "http://twserver.alunos.dcc.fc.up.pt:8008/";

		/* Match Id */
		this.matchId = null;

		/* Game piece color */
		this.color = null;

		/* Server Source */
		this.eventSource = null;

		/* Game Object (either OnlineGame or AiGame) */
		this.game = null;

		this.ui = new UI(this);
	}

	authenticate(username, password) {
		if (username === "" && password === "") {
			this.ui.showGameAlert("Name or Password empty.");
			return;
		}

		this.ui.showGameAlert("Connecting...", true);

		this.sendRequest("register", {
			nick: username,
			pass: password,
		})
			.then((res) => {
				this.ui.hideGameAlerts();
				if ("error" in res) {
					this.ui.showGameAlert("Invalid name/password combination.");
					console.log(res.error);
				} else {
					this.name = username;
					this.pass = password;
					this.ui.showConfiguration();
				}
			})
			.catch((err) => {
				this.ui.hideGameAlerts();

				console.log(err);
				this.connectionFailed();
			});
	}

	connectionFailed() {
		console.log("Connection Failed: User=" + this.name + " Pass=" + this.pass);
		this.name = null;
		this.pass = null;

		this.ui.showAuthentication();
	}

	join() {
		this.sendRequest("join", {
			group: this.group,
			nick: this.name,
			pass: this.pass,
		})
			.then((res) => {
				if ("error" in res) {
					console.log(res.error);
					this.ui.stopWaiting(true);
				} else {
					this.matchId = res.game;
					this.color = res.color;
					this.startListening();
				}
			})
			.catch((err) => {
				console.log(err);
				this.ui.stopWaiting(true);
			});
	}

	findOpponent() {
		this.ui.waitForOpponent();
		this.join();
	}

	startListening() {
		if (this.eventSource != null) this.stopListening();

		let url =
			this.serverURL + "update?nick=" + this.name + "&game=" + this.matchId;
		this.eventSource = new EventSource(url);

		this.eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if ("board" in data) {
				if (this.ui.isWaiting()) {
					this.playOnline();
				}

				this.game.update(data.turn === this.name, data.board);
			}
		};
	}

	executeCommandLeave() {
		this.executeCommand(this.server + "leave", {
			nick: this.name,
			pass: this.pass,
			game: this.matchId,
		})
			.then((data) => {
				this.matchId = null;
				this.color = null;
				this.ignoreServer();
			})
			.catch(console.log);
	}

	forfeit() {
		this.game.forfeit();
	}

	stopListening() {
		this.eventSource.close();
		this.eventSource = null;
	}

	getRanking() {
		this.sendRequest("ranking")
			.then((res) => console.log(res))
			.catch((err) => {
				console.log(err);
				this.ui.showGameAlert("Error retrieving ranking data.");
			});
	}

	async notify(move) {
		return this.sendRequest("notify", {
			nick: this.name,
			pass: this.pass,
			game: this.matchId,
			move: move,
		});
	}

	playOffline(depth, color) {
		this.game = new AiGame(depth, color, this.ui);
	}

	playOnline(color) {
		this.ui.stopWaiting();
		this.game = new OnlineGame(color, this.ui, this);
	}

	playerTurn(point) {
		this.game.playerTurn(point);
	}

	async sendRequest(endpoint, content = {}, method = "POST") {
		let res = await fetch(this.serverURL + endpoint, {
			method: method,
			body: JSON.stringify(content),
		});

		return res.json();
	}
}
