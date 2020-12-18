const fs = require("fs");
const config = require("./config");

function save(key, value) {
	let rawData = fs.readFileSync(config.database);
	let json = JSON.parse(rawData);
	json[key] = value;
	fs.writeFileSync(config.database, JSON.stringify(json));
}

function read(key) {
	let rawData = fs.readFileSync(config.database);
	let json = JSON.parse(rawData);
	return json[key];
}

module.exports = { save, read };
