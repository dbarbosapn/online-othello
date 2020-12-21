const db = require("./dbcontroller");

function getRanking() {
	let ranking = db.read("ranking");

	return ranking.slice(0, 10);
}

function saveRanking(nick, won) {
	let rank = db.read("ranking");

	let pos = rank.findIndex((elem) => elem.nick == nick);

	if (pos < 0) {
		rank.push({ nick: nick, victories: won ? 1 : 0, games: 1 });
	} else {
		rank[pos].victories += won ? 1 : 0;
		rank[pos].games += 1;
	}

	rank.sort((elem1, elem2) => {
		return elem2.victories - elem1.victories;
	});

	db.save("ranking", "ranking", rank);
}
module.exports = { saveRanking, getRanking };
