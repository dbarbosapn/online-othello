class Server {

    // Atenção não estamos a usar websockets, mas SSE(Server sent events), simplemente
    // porque ja temos o nosso cliente a funcionar com SSE. Supostamente com jogos
    // é suposto usar webSocket, mas como ate os professores implementaram o server
    // com SSE acho que não ha problema de fazermos o mesmo
    constructor() {
	this.http = require('http');
	this.url = require('url');
	this.fs = require('fs');

	this.conf = require('./conf.js');

	this.server = this.newServer();
    }

    newServer() {
	// Creates http server
    	this.server = this.http.createServer((request, response) => {
    	    switch(request.method) {
    	    case "GET":
    		this.getRequest(request, response);
    		break;

	    case "POST":
		this.postRequest(request, response);
		break;

    	    default:
    		response.writeHead(501); // Not Implemented
    		response.end();
    		break;
    	    }
    	}).listen(this.conf.port);
    }

    postRequest(request, response) {
	let body = "";
	let query; // http://Host:PORT/Pathname?Query

	request
	    // More data coming
	    .on('data', (chunk) => { body += chunk; })
	    // No more pending data
	    .on('end', () => {
		try {
		    query = JSON.parse(body);
		    this.checkCommand(request, response, query);
		}
		catch(err) { console.log(err); }
	    })
	    .on('error', (err) => { console.log(err); });
    }

    checkCommand(request, response, query) {
	switch( this.url.parse(request.url, false).pathname ) {
	case '/register':
	    this.doRegistration(query, response);
	    break;

	case '/ranking':
	    this.doRanking(response);
	    break;

	case '/join':
	    this.doJoin(response, query);
	    break;

	default:
	    response.writeHead(501);
	    response.end();
	    break;
	}
    }

    doRegistration(query, response) {
	// change to an actual registration
	response.writeHead(200);
	response.end(JSON.stringify({name:"registtration"}));
    }

    doRanking(response) {
	// Change to an actual response
	response.writeHead(200);
	response.end(JSON.stringify({name:"ranking"}));
    }

    doJoin(response, query) {
	// Change to an actual join
	response.writeHead(200);
	response.end(JSON.stringify({name:"join"}));
    }

    getRequest(request, response) {
	const parsedUrl = this.url.parse(request.url, false);

	switch( parsedUrl.pathname ) {
	case "/update":
	    this.doUpdate(parsedUrl.query, response);
	    break;

	// Static content like index.html css js images etc..
	default:
	    this.getStaticContent(request, response);
	    break;
	}
    }

    doUpdate(query, response) {
	const headers = {
	    'Content-Type': 'text/event-stream',
	    'Connection': 'keep-alive',
	    'Cache-Control': 'no-cache'
	};

	response.writeHead(200, headers);

	this.writeToClient(response, {name:"update"});
    }

    // Writes to client event stream. Seems to have some kind of problem
    writeToClient(response, data) {
	setInterval(() => { response.write("Hello"); }, 2000);
    }

    getStaticContent(request, response) {
    	const pathname = this.getPathname(request);

    	if ( pathname === null ) {
    	    response.writeHead(403); //Forbidden
    	    response.end();
    	}

    	else {
    	    this.fs.stat(pathname, (err, stats) => {
    		if ( err ) {
    		    response.writeHead(500); // Internal Server error
    		    console.log(err);
    		    response.end();
    		}

    		else if ( stats.isDirectory() ) {

    		    if ( pathname.endsWith('/') ) {
    			this.getResource(pathname + this.conf.defaultIndex, response);
    		    }

    		    else {
    			resonse.writeHead(301, {"Location": pathname + '/'});
    			response.end();
    		    }
    		}

    		else {
    		    this.getResource(pathname, response);
    		}
    	    });
    	}
    }

    getPathname(request) {
    	const parsedUrl = this.url.parse(request.url);

    	let pathname = this.conf.documentRoot + parsedUrl.pathname;

    	return pathname.startsWith(this.conf.documentRoot) ? pathname : null;
    }

    getMediaType(pathname) {
	const pos = pathname.lastIndexOf('.');
	let mediaType;

	if ( pos != -1 )
	    mediaType = this.conf.mediaTypes[pathname.substring(pos+1)];

	if ( mediaType == undefined )
	    mediaType = 'test/plain';

	return mediaType;
    }

    getResource(pathname, response) {
	const mediaType = this.getMediaType(pathname);
	const encoding = mediaType.startsWith("image") ? null: "utf8";

    	this.fs.readFile(pathname, encoding, (err, data) => {
    	    if ( err ) {
    		response.writeHead(404); // Not found
    		response.end();
    	    }

    	    else {
    		response.writeHead(200, { 'Content-Type': mediaType });
    		response.end(data);
    	    }
    	});
    }
}

var server = new Server();
