const db = require("./dbcontroller");
const crypto = require("crypto");

function authenticate(username, password, create = false) {
	let dbPass = db.read("users", username);
	let hashPass = crypto.createHash("md5").update(password).digest("hex");

	if ( !dbPass && create ) {
		db.save("users", username, hashPass);
		return true;
	}

	else if ( !dbPass ) {
		return false;
	}

	else 
		return dbPass === hashPass ? true: false;

}

module.exports = { authenticate };
