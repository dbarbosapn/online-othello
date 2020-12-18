const http = require("http");
const url = require("url");
const fs = require("fs");
const config = require("./config");
const accounts = require("./accounts");
const ranking = require("./ranking");
const controller = require("./gamecontroller");
const { parse } = require("path");

http
	.createServer((request, response) => {
		switch (request.method) {
			case "GET":
				doGetRequest(request, response);
				break;

			case "POST":
				doPostRequest(request, response);
				break;

			default:
				response.writeHead(501); // Not Implemented
				response.end();
				break;
		}
	})
	.listen(config.port);
console.log(`Server listening on port ${config.port}`);

function doGetRequest(request, response) {
	const parsedURL = url.parse(request.url, true);

	switch (parsedURL.pathname) {
		case "/update":
			setupUpdate(parsedURL.query, response);
			break;
		// Static content like index.html css js images etc..
		default:
			getStaticContent(request, response);
			break;
	}
}

function doPostRequest(request, response) {
	const parsedURL = url.parse(request.url, false);

	let rawBody = "";
	let body;

	request
		.on("data", (chunk) => {
			rawBody += chunk;
		})
		.on("end", () => {
			try {
				body = JSON.parse(rawBody);

				parseCommand(parsedURL.pathname, body, response);
			} catch (err) {
				console.log(err);
				response.writeHead(500);
				response.end();
			}
		})
		.on("error", (err) => {
			console.log(err);
			response.writeHead(500);
			response.end();
		});
}

function parseCommand(pathname, body, response) {
	switch (pathname) {
		case "/register":
			doRegister(body, response);
			break;
		case "/join":
			doJoin(body, response);
			break;
		case "/ranking":
			doRanking(response);
			break;
		default:
			response.writeHead(404); // Not Found
			response.end();
			break;
	}
}

function doRegister(body, response) {
	if (!body.nick || !body.pass) {
		response.writeHead(400);
		response.end(JSON.stringify({ error: "Invalid request body." }));
		return;
	}

	if (accounts.authenticate(body.nick, body.pass, true)) {
		response.writeHead(200);
		response.end("{}");
	} else {
		response.writeHead(401);
		response.end(
			JSON.stringify({ error: "User registered with a different password" })
		);
	}
}

function doRanking(response) {
	response.writeHead(200);
	response.end(JSON.stringify({ ranking: ranking.getRanking() }));
}

function doJoin(body, response) {
	if (!body.nick || !body.pass) {
		response.writeHead(400);
		response.end(JSON.stringify({ error: "Invalid request body." }));
		return;
	}

	if (!accounts.authenticate(body.nick, body.pass)) {
		response.writeHead(401);
		response.end(
			JSON.stringify({ error: "User registered with a different password" })
		);
		return;
	}

	let res = controller.joinGame(body.nick);

	response.writeHead(200);
	response.end(JSON.stringify(res));
}

function setupUpdate(query, response) {
	if (!query.nick || !query.game) {
		response.writeHead(400);
		response.end(JSON.stringify({ error: "Invalid request query." }));
		return;
	}

	controller.setupUpdate(query.nick, query.game, response);
}

function getStaticContent(request, response) {
	const pathname = getPathname(request);

	if (pathname === null) {
		response.writeHead(403); //Forbidden
		response.end();
	} else {
		fs.stat(pathname, (err, stats) => {
			if (err) {
				switch (err.errno) {
					case -2:
						response.writeHead(404); // Page not found
						break;
					default:
						response.writeHead(500); // Internal Server error
						break;
				}
				console.log(err);
				response.end();
			} else if (stats.isDirectory()) {
				if (pathname.endsWith("/")) {
					getResource(pathname + config.defaultIndex, response);
				} else {
					response.writeHead(301, { Location: pathname + "/" });
					response.end();
				}
			} else {
				getResource(pathname, response);
			}
		});
	}
}

function getPathname(request) {
	const parsedURL = url.parse(request.url);

	let pathname = config.documentRoot + parsedURL.pathname;

	return pathname.startsWith(config.documentRoot) ? pathname : null;
}

function getMediaType(pathname) {
	const pos = pathname.lastIndexOf(".");
	let mediaType;

	if (pos != -1) mediaType = config.mediaTypes[pathname.substring(pos + 1)];

	if (mediaType == undefined) mediaType = "test/plain";

	return mediaType;
}

function getResource(pathname, response) {
	const mediaType = getMediaType(pathname);
	const encoding = mediaType.startsWith("image") ? null : "utf8";

	fs.readFile(pathname, encoding, (err, data) => {
		if (err) {
			response.writeHead(404); // Not found
			response.end();
		} else {
			response.writeHead(200, { "Content-Type": mediaType });
			response.end(data);
		}
	});
}
