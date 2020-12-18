const fs = require("fs");
const config = require("./config");

// Type => users | ranking
// Key => userName
// value => if Type == users then value == HashPass otherwise value == Score
function save(type, key, value) {
	let rawData = fs.readFileSync(config.database[type]);
	let data = JSON.parse(rawData);
	data[key] = value;
	fs.writeFileSync(config.database[type], JSON.stringify(data));
}

// key = null if you want all the data base, otherwise you need to specify the user
function read(type, key=null) {
	let rawData = fs.readFileSync(config.database[type]);
	let data = JSON.parse(rawData);
	return type == "ranking" ? data.ranking : (key == null ? data : data[key]);
}

module.exports = { save, read };
