const db = require("./dbcontroller");

function getRanking() {
	let ranking = db.read("ranking");
	if (!ranking) ranking = [];
	return ranking;
}

module.exports = { getRanking };
