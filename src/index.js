class Server {

    constructor() {
	this.http = require('http');
	this.url = require('url');
	this.fs = require('fs');

	this.conf = require('./conf.js');

	this.server = null;
	this.newServer();
    }

    newServer() {
    	this.server = this.http.createServer((request, response) => {
    	    switch(request.method) {
    	    case "GET":
    		this.getRequest(request, response);
    		break;

    	    default:
    		response.writeHead(501); // Not Implemented
    		response.end();
    		break;
    	    }
    	}).listen(this.conf.port);
    }

    getRequest(request, response) {
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
