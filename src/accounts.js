const db = require("./dbcontroller");
const crypto = require("crypto");

function authenticate(username, password, create = false) {
	let users = db.read("users");
	if (!users) users = {};

	let hash = crypto.createHash("md5").update(password).digest("hex");

	if (create && !users[username]) {
		users[username] = hash;
		db.save("users", users);
	}

	if (users[username] !== hash) return false;

	return true;
}

module.exports = { authenticate };
