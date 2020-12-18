const db = require("./dbcontroller");

function getRanking() {
	let ranking = db.read("ranking");

	return ranking.slice(0, 10);

}

function saveRanking(nick, won) {
	let ranking = db.read("ranking");

	let pos = ranking.findIndex((elem) => elem.nick == nick );

	if ( pos < 0 ) {
		ranking.push({"nick":nick, "victories":(won ? 1: 0), "games":1})
	}

	else {
		let pos = ranking.findIndex((elem) => elem.nick == nick);
		ranking[pos].victories += (won ? 1: 0);
		ranking[pos].games += 1;
	}

	ranking.sort((elem1, elem2) => {
		return elem2.victories - elem1.victories;
	});
		
	db.save("ranking", "ranking", ranking);

}
module.exports = { saveRanking, getRanking };
