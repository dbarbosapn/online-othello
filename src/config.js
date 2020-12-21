module.exports = {
	port: 8035,
	mediaTypes: {
		txt: "text/plain",
		html: "text/html",
		css: "text/css",
		js: "application/javascript",
		png: "image/png",
		jpeg: "image/jpeg",
		jpg: "image/jpeg",
	},
	defaultIndex: "index.html",
	documentRoot: "public",
	database: { users: "dbUsers.json", ranking: "dbRanking.json" },
};
